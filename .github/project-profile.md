---
spark: true
initialized: false
active_plugins: []
framework_version: ""
---

# Project Profile Template

Questo file e la source of truth del framework installato nel workspace.

Compilazione iniziale prevista:
- Agent-Welcome raccoglie nome progetto, stack, workflow e vincoli.
- I plugin installati aggiornano `active_plugins` senza sovrascrivere il resto.
- `framework_version` viene valorizzato quando il layer master e installato nel workspace target.

Quando `initialized: false`, gli agenti devono:
- mostrare un avviso non bloccante;
- evitare assunzioni su linguaggio o stack;
- proporre `#project-setup` o Agent-Welcome per il bootstrap.