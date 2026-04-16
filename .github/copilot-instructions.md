---
spark: true
---

# Copilot Instructions — spark-base

## Contesto

Questo pacchetto fornisce il layer fondazionale del framework SCF.
Definisce agenti base, skill comuni, instruction condivise e regole operative
riutilizzabili da tutti i plugin linguaggio-specifici.

## Regole base

- Leggi sempre `.github/project-profile.md` prima di assumere stack o architettura.
- Usa `.github/AGENTS.md` come indice canonico degli agenti installati.
- Se una capability richiesta non e coperta da plugin attivi, delega ad Agent-Research.
- Non modificare `.github/runtime/` tramite sistemi di manifest o ownership package.
- Per operazioni git, usa Agent-Git o proponi i comandi senza eseguirli direttamente.
- Le capability language-specific devono essere fornite dai plugin installati sopra `spark-base`.

## Runtime MCP richiesto

Questo layer richiede `spark-framework-engine >= 1.9.0`; i tool e le resource runtime seguenti sono stati introdotti a partire da `1.5.0`:
- `scf_get_runtime_state()`
- `scf_update_runtime_state(patch)`
- `scf://runtime-state`
- `scf://agents-index` in modalita multi-file `AGENTS*.md`

Quando il task tocca tool MCP o codice engine, mantieni separati `stdout` e `stderr` e verifica che i tool pubblici siano registrati con il decorator corretto.

## Routing degli agenti

- Agenti executor base: orchestrazione, git, release, framework docs, onboarding, ricerca.
- Agenti dispatcher base: analyze, plan, docs, validate.
- Agenti plugin: dichiarano `plugin`, `capabilities`, `languages` e vengono scoperti via `AGENTS-{plugin-id}.md`.

## Output

- Mantieni output testuale navigabile e NVDA-friendly.
- Usa il prefisso `ERRORE:` per blocchi critici.
- Preferisci report brevi con cosa cambia, perche e impatto operativo.