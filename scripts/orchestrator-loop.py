#!/usr/bin/env python3
"""
orchestrator-loop.py

Driver CLI per il loop autonomo dell'orchestratore SCF.
Stdlib only. Output strutturato per screen reader (NVDA).
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent
STATE_PATH = PROJECT_ROOT / ".github" / "runtime" / "orchestrator-state.json"
TODO_PATH = PROJECT_ROOT / "docs" / "TODO.md"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class Phase:
    id: str
    title: str
    is_checkpoint: bool = False


@dataclass
class GateResult:
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int


class OrchestratorState:
    DEFAULT = {
        "current_phase": "",
        "current_agent": "",
        "retry_count": 0,
        "confidence": 1.0,
        "execution_mode": "autonomous",
        "last_updated": "",
        "phase_history": [],
        "active_task_id": "",
    }

    def __init__(self, path: Path = STATE_PATH):
        self.path = path
        self._state = None

    def load(self) -> dict:
        if not self.path.exists():
            self._state = dict(self.DEFAULT)
            return self._state
        try:
            with self.path.open("r", encoding="utf-8") as f:
                self._state = json.load(f)
        except Exception:
            raise
        return self._state

    def save(self, patch: Dict) -> None:
        state = self._state or dict(self.DEFAULT)
        state.update(patch)
        state["last_updated"] = utc_now_iso()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
        self._state = state

    def reset(self) -> None:
        self._state = dict(self.DEFAULT)
        self._state["last_updated"] = utc_now_iso()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("w", encoding="utf-8") as f:
            json.dump(self._state, f, indent=2, ensure_ascii=False)


class TodoReader:
    PHASE_IDS = ["ANALYZE", "DESIGN", "PLAN", "CODE", "VALIDATE", "DOCS", "RELEASE"]

    def __init__(self, path: Path = TODO_PATH):
        self.path = path

    def _read_lines(self) -> List[str]:
        if not self.path.exists():
            return []
        return self.path.read_text(encoding="utf-8").splitlines()

    def get_pending_phases(self) -> List[Phase]:
        lines = self._read_lines()
        pending: List[Phase] = []
        for ln in lines:
            if "[x]" in ln or "[X]" in ln:
                continue
            if "[" in ln and "]" in ln:
                # unchecked checkbox line
                title = ln.strip()
                pid = None
                for candidate in self.PHASE_IDS:
                    if candidate in ln.upper():
                        pid = candidate
                        break
                if pid is None:
                    # fallback: use first word uppercased
                    parts = ln.strip().split()
                    pid = parts[0].upper() if parts else "UNKNOWN"
                is_cp = pid in {"DESIGN", "PLAN", "RELEASE"}
                pending.append(Phase(id=pid, title=title, is_checkpoint=is_cp))
        return pending

    def mark_phase_done(self, phase_id: str) -> None:
        lines = self._read_lines()
        out = []
        done = False
        for ln in lines:
            if not done and ("[" in ln and "]" in ln):
                if phase_id in ln.upper() and ("[x]" not in ln and "[X]" not in ln):
                    # mark this line
                    new = ln.replace("[ ]", "[x]") if "[ ]" in ln else ln
                    if new == ln:
                        # try other checkbox variants
                        new = ln.replace("[]", "[x]")
                    out.append(new)
                    done = True
                    continue
            out.append(ln)
        if done:
            self.path.write_text("\n".join(out) + "\n", encoding="utf-8")


class GateRunner:
    GATE_MAP = {
        "ANALYZE": ["python", "scripts/detect_agent.py", "--smoke"],
        "DESIGN": ["python", "scripts/validate_gates.py", "--check-design"],
        "PLAN": ["python", "scripts/validate_gates.py", "--check-plan"],
        "CODE": ["python", "scripts/validate_gates.py", "--check-all"],
        "VALIDATE": ["python", "-m", "pytest", "-m", "not gui", "--cov=src", "-q"],
        "DOCS": ["python", "scripts/sync-documentation.py", "--check"],
        "RELEASE": [],
    }

    def __init__(self, verbose: bool = False):
        self.verbose = verbose

    def run_gate(self, phase: Phase) -> GateResult:
        cmd = self.GATE_MAP.get(phase.id, [])
        if not cmd:
            # manual gate
            return GateResult(exit_code=0, stdout="gate manuale", stderr="", duration_ms=0)

        start = datetime.now()
        try:
            proc = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True)
            end = datetime.now()
            duration = int((end - start).total_seconds() * 1000)
            return GateResult(exit_code=proc.returncode, stdout=proc.stdout, stderr=proc.stderr, duration_ms=duration)
        except FileNotFoundError as e:
            end = datetime.now()
            duration = int((end - start).total_seconds() * 1000)
            return GateResult(exit_code=1, stdout="", stderr=str(e), duration_ms=duration)


class ConfidenceCalculator:
    WARN_KEYS = ["warning", "deprecated", "skip"]

    def calculate(self, gate_result: GateResult, phase: Phase) -> float:
        base = 1.0 if gate_result.exit_code == 0 else 0.5
        text = (gate_result.stdout or "") + "\n" + (gate_result.stderr or "")
        score = base
        for k in self.WARN_KEYS:
            count = text.lower().count(k)
            if count:
                score -= 0.05 * count
        score = max(0.0, score)
        return round(score, 2)


class OrchestratorLoop:
    def __init__(self, dry_run: bool = False, verbose: bool = False):
        self.state = OrchestratorState()
        self.todo = TodoReader()
        self.gate_runner = GateRunner(verbose=verbose)
        self.calc = ConfidenceCalculator()
        self.dry_run = dry_run

    def _print(self, prefix: str, msg: str) -> None:
        print(f"{prefix}: {msg}")

    def _handle_dry_run(self, pending: List[Phase]) -> int:
        self._print("LOOP", "dry-run — fasi pendenti:")
        for p in pending:
            cmd = GateRunner.GATE_MAP.get(p.id, [])
            self._print("LOOP", f"{p.id} — {p.title} — gate: {' '.join(cmd) if cmd else 'manuale'}")
        return 0

    def _print_status(self) -> int:
        st = self.state.load()
        self._print("STATO", json.dumps(st, ensure_ascii=False))
        return 0

    def run(self, start_phase: Optional[str] = None) -> int:
        try:
            st = self.state.load()
        except Exception as e:
            self._print("ERRORE", f"impossibile leggere stato: {e}")
            return 1

        pending = self.todo.get_pending_phases()
        if start_phase:
            # filter to start at given phase id
            idx = next((i for i, p in enumerate(pending) if p.id == start_phase), None)
            if idx is not None:
                pending = pending[idx:]

        if not pending:
            self._print("LOOP", "nessuna fase pendente")
            return 0

        if self.dry_run:
            return self._handle_dry_run(pending)

        for phase in list(pending):
            self._print("LOOP", f"esecuzione fase {phase.id} — {phase.title}")

            if phase.is_checkpoint:
                # in autonomous mode we proceed automatically
                mode = st.get("execution_mode", "autonomous")
                if mode == "autonomous":
                    self._print("CHECKPOINT", f"{phase.id} — eseguo automaticamente in autonomous mode")
                    # update state and continue
                    st.update({"current_phase": phase.id, "current_agent": "Agent-Orchestrator", "retry_count": 0})
                    self.state.save(st)
                    self.todo.mark_phase_done(phase.id)
                    pending.pop(0)
                    continue
                else:
                    # ask user
                    self._print("CHECKPOINT", f"{phase.id} — attendere conferma utente (S/N)")
                    ans = input().strip().lower()
                    if ans != "s":
                        self._print("ATTENZIONE", "interrotto dall'utente al checkpoint")
                        return 3
                    st.update({"current_phase": phase.id, "current_agent": "Agent-Orchestrator", "retry_count": 0})
                    self.state.save(st)
                    self.todo.mark_phase_done(phase.id)
                    pending.pop(0)
                    continue

            # run gate
            result = self.gate_runner.run_gate(phase)
            self._print("GATE", f"fase {phase.id} — EXIT {result.exit_code} — dur {result.duration_ms}ms")
            if self.gate_runner.verbose:
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr, file=sys.stderr)

            confidence = self.calc.calculate(result, phase)
            self._print("CONFIDENCE", f"{confidence}")

            retry_count = st.get("retry_count", 0)
            if result.exit_code == 0 and confidence >= 0.85:
                # success
                st.update({"current_phase": phase.id, "current_agent": "Agent-Orchestrator", "confidence": confidence, "retry_count": 0})
                hist = st.get("phase_history", [])
                hist.append(phase.id)
                st["phase_history"] = hist
                self.state.save(st)
                self._print("STATO", f"aggiornato → fase {phase.id}")
                self.todo.mark_phase_done(phase.id)
                pending.pop(0)
                continue
            else:
                retry_count = retry_count + 1
                penalized = max(0.0, confidence - 0.10)
                st.update({"retry_count": retry_count, "confidence": penalized})
                self.state.save(st)
                self._print("ATTENZIONE", f"fase {phase.id} fallita o confidence bassa: retry={retry_count} confidence={penalized}")
                if retry_count >= 2 or penalized < 0.85:
                    self._print("ATTENZIONE", "escalation: passaggio a execution_mode supervised")
                    st.update({"execution_mode": "supervised"})
                    self.state.save(st)
                    return 2

        self._print("LOOP", "ciclo completato — tutte le fasi pendenti eseguite")
        return 0


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Orchestrator loop driver")
    p.add_argument("--mode", required=True, choices=["run", "status", "reset", "dry-run"])
    p.add_argument("--phase", required=False)
    p.add_argument("--verbose", action="store_true")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    loop = OrchestratorLoop(dry_run=(args.mode == "dry-run"), verbose=args.verbose)
    if args.mode == "status":
        return loop._print_status()
    if args.mode == "reset":
        loop.state.reset()
        loop._print("LOOP", "stato resettato ai default")
        return 0
    if args.mode == "dry-run":
        return loop.run(start_phase=args.phase)
    if args.mode == "run":
        return loop.run(start_phase=args.phase)
    return 1


if __name__ == "__main__":
    try:
        rc = main()
    except KeyboardInterrupt:
        print("ATTENZIONE: interrotto da utente")
        rc = 3
    except Exception as e:
        print(f"ERRORE: {e}")
        rc = 1
    sys.exit(rc)
