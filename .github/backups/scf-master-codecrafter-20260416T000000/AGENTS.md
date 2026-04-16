# Framework Copilot — Solitario Classico Accessibile

> **Versione Framework**: v1.11.0 — 29 Marzo 2026

Questo framework orchestra lo sviluppo del progetto tramite 14 agenti specializzati
e prompt files nativi di VS Code. Ogni agente ha un ruolo specifico nel ciclo di
sviluppo (dal concept al rilascio) con trigger di attivazione, output e gate di
validazione. Il flusso E2E completo e descritto in [docs/WORKFLOW.md](../docs/WORKFLOW.md).

---

## Agenti Nativi

Gli agenti sono disponibili nel dropdown agenti della chat di VS Code.
Ogni file agente contiene: scopo, trigger, deliverable, gate e workflow.

- [Agent-Helper](agents/Agent-Helper.md) — Consultivo read-only sul Framework Copilot
  Agente consultivo. Risponde a domande su agenti, prompt, skill, istruzioni
  e struttura del framework. Non modifica file, non esegue comandi git.
  Modalità: read-only. Scope esclusivo: lettura di .github/.
  Modelli: Claude Sonnet 4.6, gpt-5-mini.
- [Agent-Welcome](agents/Agent-Welcome.md) — Setup profilo progetto
  Agente di inizializzazione. Raccoglie le info fondamentali
  del progetto, genera .github/project-profile.md come
  source of truth, adatta i componenti language-specific.
  OP-3: bootstrap opzionale della struttura docs/ tramite skill docs_manager
  (flusso S/N, additivo e non distruttivo).
  OP-4: bootstrap documentale core con 3 livelli (struttura / +core docs /
  +istruzioni progetto); proposto al termine di OP-3.
  Competenza separata: ripristino .github/copilot-instructions.md da template
  neutro, solo su richiesta esplicita con "RIPRISTINA" e framework_edit_mode: true.
  Non partecipa al ciclo E2E. Invocabile dal dropdown o
  tramite #project-setup.prompt.md e #project-update.prompt.md.
  Modelli: GPT-5 mini nel frontmatter del framework; Raptor mini disponibile
  operativamente nell'ambiente quando supportato dal validator.
- [Agent-Orchestrator](agents/Agent-Orchestrator.md) — Coordinatore E2E
  Orchestratore del ciclo completo. Usa subagent delegation per
  coordinare tutti gli agenti specializzati. Gate oggettivi verificati
  tramite script CLI. Checkpoint di controllo con conferma utente.
  Invocazione: seleziona dal dropdown o usa #orchestrate.prompt.md
- [Agent-Analyze](agents/Agent-Analyze.md) — Discovery e analisi codebase (read-only)
- [Agent-Design](agents/Agent-Design.md) — Decisioni architetturali, creazione DESIGN_*.md
- [Agent-Plan](agents/Agent-Plan.md) — Breaking down in fasi, PLAN_*.md e docs/TODO.md
- [Agent-CodeRouter](agents/Agent-CodeRouter.md) — Dispatcher sotto-ciclo codifica
  Coordinatore del sotto-ciclo implementazione. Classifica le fasi del TODO
  come GUI o non-GUI e delega ad Agent-CodeUI o Agent-Code.
  Invocato da Agent-Orchestrator in sostituzione diretta di Agent-Code.
- [Agent-Code](agents/Agent-Code.md) — Implementazione incrementale, commit atomici
  (invariato, ora sub-agente di Agent-CodeRouter per fasi non-GUI)
- [Agent-CodeUI](agents/Agent-CodeUI.md) — Implementazione GUI wxPython + accessibilità NVDA
  Sub-agente di Agent-CodeRouter per fasi che coinvolgono componenti UI.
  Ogni componente deve superare checklist WAI-ARIA + NVDA prima del commit.
- [Agent-Validate](agents/Agent-Validate.md) — Test coverage, quality gates
- [Agent-Docs](agents/Agent-Docs.md) — Sync API.md, ARCHITECTURE.md, CHANGELOG.md
- [Agent-Release](agents/Agent-Release.md) — Versioning SemVer, build cx_freeze, release
- [Agent-FrameworkDocs](agents/Agent-FrameworkDocs.md) — Manutenzione Framework
  Agente esclusivo per documentazione e changelog del Framework Copilot.
  Scope: `.github/**`. Attivazione: solo manuale o tramite prompt `framework-*`.
  Non partecipa al ciclo E2E del progetto.
- [Agent-Git](agents/Agent-Git.md) — Operazioni Git autorizzate
  Unico agente autorizzato a eseguire git tramite run_in_terminal.
  Gestisce commit, push, merge, tag con conferme esplicite obbligatorie.
  Modelli: gpt-5-mini, GPT-5.3-Codex. Invocabile dal dropdown o come subagente.

---

## Dual-Track Documentation

Il framework adotta una separazione netta tra documentazione del framework
e documentazione del progetto ospite.

**Binario Framework** — gestito da Agent-FrameworkDocs:

- `.github/FRAMEWORK_CHANGELOG.md`: storico evoluzione framework
- `.github/AGENTS.md`: questo file
- `.github/README.md`: guida importazione framework
- `.github/agents/README.md`, `.github/prompts/README.md`

**Binario Progetto** — gestito da Agent-Docs nel ciclo E2E:

- `CHANGELOG.md` della root: storico del progetto applicativo
- `docs/API.md`, `docs/ARCHITECTURE.md`: documentazione tecnica progetto

**Regola invariante**: Agent-FrameworkDocs non tocca mai `CHANGELOG.md`
della root. Agent-Docs non tocca mai `FRAMEWORK_CHANGELOG.md`.
I due binari non si incrociano.

---

## Prompt Files

I prompt files si attivano dal file picker di VS Code (scrivi # in chat) o digitando
il nome del file. Usano variabili di input con sintassi `${input:label}`.

- `#project-setup.prompt.md` — Setup iniziale framework
  per nuovo progetto. Da eseguire prima di qualsiasi
  altra operazione. Delega ad Agent-Welcome OP-1.
- `#project-update.prompt.md` — Aggiorna campi del
  profilo progetto. Delega ad Agent-Welcome OP-2.
- `#verbosity.prompt.md` — Modifica il livello di verbosita
  comunicativa globale degli agenti.
  Richiede `framework_edit_mode: true`; se il framework e lockato,
  usare prima `#framework-unlock.prompt.md`.
  - ... (file truncated for brevity)
