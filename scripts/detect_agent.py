#!/usr/bin/env python3
"""
detect_agent.py

Rileva e ispeziona gli agenti SCF dal repository corrente.
Sorgenti: .github/AGENTS.md, .github/AGENTS-master.md, .github/agents/*.md

Stdlib only — nessuna dipendenza esterna. Python 3.11+.

Utilizzo:
  python scripts/detect_agent.py --smoke          # sanity check gate ANALYZE
  python scripts/detect_agent.py --list           # elenca tutti gli agenti
  python scripts/detect_agent.py --list --json    # output JSON
  python scripts/detect_agent.py --agent-id Agent-Code
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = PROJECT_ROOT / ".github" / "agents"
AGENTS_INDEX = PROJECT_ROOT / ".github" / "AGENTS.md"
AGENTS_MASTER = PROJECT_ROOT / ".github" / "AGENTS-master.md"


@dataclass
class AgentInfo:
    name: str
    source: str
    role: str = ""
    description: str = ""
    capabilities: list[str] = field(default_factory=list)
    layer: str = ""
    version: str = ""


def _parse_frontmatter(text: str) -> dict[str, object]:
    """Extract key-value pairs from YAML-style frontmatter (between --- delimiters).

    Handles scalar values and simple inline list syntax: [a, b, c].
    Does not require PyYAML.
    """
    result: dict[str, object] = {}
    lines = text.splitlines()

    if not lines or lines[0].strip() != "---":
        return result

    end_idx = -1
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            end_idx = i
            break

    if end_idx == -1:
        return result

    for line in lines[1:end_idx]:
        if ":" not in line:
            continue
        key, _, raw_val = line.partition(":")
        key = key.strip()
        val = raw_val.strip()

        if not key:
            continue

        # Inline list: [a, 'b', "c"]
        if val.startswith("[") and val.endswith("]"):
            inner = val[1:-1]
            items = [item.strip().strip("'\"") for item in inner.split(",") if item.strip()]
            result[key] = items
        else:
            result[key] = val

    return result


def _load_agent_file(path: Path) -> Optional[AgentInfo]:
    """Parse a single agent .md file and return AgentInfo, or None on failure."""
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        print(f"ERRORE: impossibile leggere {path}: {exc}", file=sys.stderr)
        return None

    fm = _parse_frontmatter(text)

    name = str(fm.get("name", "")).strip() or path.stem
    if not name:
        return None

    role = str(fm.get("role", "")).strip()
    description = str(fm.get("description", "")).strip()
    layer = str(fm.get("layer", "")).strip()
    version = str(fm.get("version", "")).strip()

    raw_caps = fm.get("capabilities") or fm.get("delegates_to_capabilities") or []
    if isinstance(raw_caps, list):
        caps: list[str] = [str(c).strip() for c in raw_caps if str(c).strip()]
    else:
        caps = [str(raw_caps).strip()] if str(raw_caps).strip() else []

    return AgentInfo(
        name=name,
        source=str(path.relative_to(PROJECT_ROOT)),
        role=role,
        description=description,
        capabilities=caps,
        layer=layer,
        version=version,
    )


def _scan_agents_dir(directory: Path) -> list[AgentInfo]:
    """Scan agents directory for .md files (skips README.md)."""
    agents: list[AgentInfo] = []
    for md in sorted(directory.glob("*.md")):
        if md.name.lower() == "readme.md":
            continue
        agent = _load_agent_file(md)
        if agent:
            agents.append(agent)
    return agents


# Pattern: "- Agent-Foo — role — capability1, capability2"
_INDEX_PATTERN = re.compile(
    r"^-\s+(Agent-\w+)\s+[—–-]+\s+(\w[\w-]*)\s+[—–-]+\s+(.*)",
    re.MULTILINE,
)


def _parse_agents_index(path: Path) -> list[AgentInfo]:
    """Parse an AGENTS*.md index for list-style agent entries."""
    agents: list[AgentInfo] = []
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return agents

    for m in _INDEX_PATTERN.finditer(text):
        name = m.group(1).strip()
        role = m.group(2).strip()
        caps_raw = m.group(3).strip()
        caps = [c.strip() for c in caps_raw.split(",") if c.strip()]
        agents.append(
            AgentInfo(
                name=name,
                source=str(path.relative_to(PROJECT_ROOT)),
                role=role,
                capabilities=caps,
            )
        )

    return agents


def collect_agents() -> list[AgentInfo]:
    """Collect agents from all sources, deduplicating by name.

    Priority: individual agent files > AGENTS-master.md > AGENTS.md.
    """
    by_name: dict[str, AgentInfo] = {}

    # Priority 1: individual agent files (most complete, have full frontmatter)
    if AGENTS_DIR.is_dir():
        for agent in _scan_agents_dir(AGENTS_DIR):
            by_name[agent.name] = agent

    # Priority 2: AGENTS-master.md
    if AGENTS_MASTER.exists():
        for agent in _parse_agents_index(AGENTS_MASTER):
            if agent.name not in by_name:
                by_name[agent.name] = agent

    # Priority 3: AGENTS.md (broad index)
    if AGENTS_INDEX.exists():
        for agent in _parse_agents_index(AGENTS_INDEX):
            if agent.name not in by_name:
                by_name[agent.name] = agent

    return list(by_name.values())


def cmd_smoke() -> int:
    """Verify detection prerequisites: AGENTS.md exists, agents dir exists, >=1 agent found."""
    errors: list[str] = []

    if not AGENTS_INDEX.exists():
        errors.append(f"AGENTS.md non trovato: {AGENTS_INDEX}")

    if not AGENTS_DIR.is_dir():
        errors.append(f"directory agenti non trovata: {AGENTS_DIR}")

    if errors:
        for e in errors:
            print(f"ERRORE: {e}", file=sys.stderr)
        return 1

    agents = collect_agents()
    if not agents:
        print("ERRORE: nessun agente valido rilevato", file=sys.stderr)
        return 1

    print(f"smoke OK — {len(agents)} agenti rilevati")
    return 0


def cmd_list(as_json: bool) -> int:
    """List all detected agents to stdout."""
    agents = collect_agents()
    if not agents:
        print("ERRORE: nessun agente rilevato", file=sys.stderr)
        return 1

    if as_json:
        print(json.dumps([asdict(a) for a in agents], indent=2, ensure_ascii=False))
    else:
        for a in agents:
            caps = ", ".join(a.capabilities) if a.capabilities else "-"
            role = a.role or "-"
            print(f"{a.name}  role={role}  caps=[{caps}]  source={a.source}")

    return 0


def cmd_agent_id(agent_id: str, as_json: bool) -> int:
    """Show info for a specific agent identified by name."""
    agents = collect_agents()
    match = next((a for a in agents if a.name.lower() == agent_id.lower()), None)

    if match is None:
        print(f"ERRORE: agente '{agent_id}' non trovato", file=sys.stderr)
        return 1

    if as_json:
        print(json.dumps(asdict(match), indent=2, ensure_ascii=False))
    else:
        lines = [
            f"name:         {match.name}",
            f"role:         {match.role or '-'}",
            f"layer:        {match.layer or '-'}",
            f"version:      {match.version or '-'}",
            f"description:  {match.description or '-'}",
            f"capabilities: {', '.join(match.capabilities) or '-'}",
            f"source:       {match.source}",
        ]
        print("\n".join(lines))

    return 0


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Detect and inspect SCF agents in the repository.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--smoke", action="store_true", help="Quick sanity check; exit 0 if OK")
    p.add_argument("--list", action="store_true", dest="list_all", help="List all detected agents")
    p.add_argument("--agent-id", metavar="NAME", help="Show info for a specific agent by name")
    p.add_argument("--json", action="store_true", dest="as_json", help="Output as JSON")
    return p


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.smoke:
        return cmd_smoke()

    if args.agent_id:
        return cmd_agent_id(args.agent_id, args.as_json)

    if args.list_all:
        return cmd_list(args.as_json)

    # Default behaviour: smoke check
    return cmd_smoke()


if __name__ == "__main__":
    sys.exit(main())
