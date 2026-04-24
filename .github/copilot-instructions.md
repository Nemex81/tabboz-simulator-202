---
spark: true
scf_file_role: "config"
scf_version: "1.4.0"
scf_merge_strategy: "merge_sections"
scf_protected: false
scf_owner: "spark-base"
scf_merge_priority: 10
---

# Copilot Instructions — SPARK Base Package

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

Questo layer richiede `spark-framework-engine >= 2.4.0`; i tool e le resource runtime seguenti sono stati introdotti a partire da `1.5.0`:
- `scf_get_runtime_state()`
- `scf_update_runtime_state(patch)`
- `scf://runtime-state`
- `scf://agents-index` in modalita multi-file `AGENTS*.md`

Quando il task tocca tool MCP o codice engine, mantieni separati `stdout` e `stderr` e verifica che i tool pubblici siano registrati con il decorator corretto.

## Ownership e Update Policy

- `copilot-instructions.md` di questo pacchetto e' un file condiviso con `scf_merge_strategy: merge_sections`: le modifiche devono preservare le sezioni degli altri owner.
- Il comportamento di installazione e update del workspace e' governato dai tool engine `scf_get_update_policy()` e `scf_set_update_policy(...)` e dal parametro `update_mode` dei tool pubblici.
- Se il motore restituisce `authorization_required` o `action_required`, il flusso corretto e' completare quel passaggio prima di promettere scritture sotto `.github/`.

## Routing degli agenti

- Agenti executor base: orchestrazione, git, release, framework docs, onboarding, ricerca.
- Agenti dispatcher base: analyze, plan, docs, validate.
- Agenti plugin: dichiarano `plugin`, `capabilities`, `languages` e vengono scoperti via `AGENTS-{plugin-id}.md`.

Nota cross-layer: alcuni agenti con prefisso `code-` (ad es. `code-Agent-Code`,
`code-Agent-CodeRouter`, `code-Agent-CodeUI`, `code-Agent-Design`) sono forniti
dal pacchetto `scf-master-codecrafter`. In un workspace dove `scf-master-codecrafter`
non è installato, i riferimenti a questi agenti saranno link morti — questo è il
comportamento atteso per agenti di layer superiore. Per comportamenti runtime
corretti, installa `scf-master-codecrafter` o aggiorna i riferimenti locali.

## Output

- Mantieni output testuale navigabile e NVDA-friendly.
- Usa il prefisso `ERRORE:` per blocchi critici.
- Preferisci report brevi con cosa cambia, perche e impatto operativo.