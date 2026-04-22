---
spark: true
---

# Copilot Instructions — SCF Master CodeCrafter

## Contesto

Questo pacchetto fornisce il layer master del framework SCF.
Definisce agenti trasversali, dispatcher, skill comuni e regole operative
riutilizzabili da tutti i plugin linguaggio-specifici.

## Regole base

- Leggi sempre `.github/project-profile.md` prima di assumere stack o architettura.
- Usa `.github/AGENTS.md` come indice canonico degli agenti installati.
- Se una capability richiesta non e coperta da plugin attivi, delega ad Agent-Research.
- Non modificare `.github/runtime/` tramite sistemi di manifest o ownership package.
- Per operazioni git, usa Agent-Git o proponi i comandi senza eseguirli direttamente.
- Per task su codice Python, test Python o contesto MCP, applica anche `.github/instructions/python.instructions.md`, `.github/instructions/tests.instructions.md` e `.github/instructions/mcp-context.instructions.md` quando pertinenti.

## Runtime MCP richiesto

Questo layer richiede `spark-framework-engine >= 2.1.0`; i tool e le resource runtime seguenti sono stati introdotti a partire da `1.5.0`:
- `scf_get_runtime_state()`
- `scf_update_runtime_state(patch)`
- `scf://runtime-state`
- `scf://agents-index` in modalita multi-file `AGENTS*.md`

Quando il task tocca tool MCP o codice engine, mantieni separati `stdout` e `stderr` e verifica che i tool pubblici siano registrati con il decorator corretto.

## Routing degli agenti

- Agenti executor master: orchestrazione, git, release, framework docs, onboarding, ricerca.
- Agenti dispatcher master: analyze, design, plan, docs, code-ui, code-router.
- Agenti plugin: dichiarano `plugin`, `capabilities`, `languages` e vengono scoperti via `AGENTS-{plugin-id}.md`.

## Output

- Mantieni output testuale navigabile e NVDA-friendly.
- Usa il prefisso `ERRORE:` per blocchi critici.
- Preferisci report brevi con cosa cambia, perche e impatto operativo.