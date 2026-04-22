---
spark: true
name: framework-query
description: Pattern per interrogare il framework SCF e descriverne struttura, agenti e tool runtime.
---

# framework-query

- Per agenti: usa `scf://agents-index` o il relativo tool MCP.
- Per versioni: usa `scf_get_framework_version()`.
- Per runtime: usa `scf_get_runtime_state()` o `scf://runtime-state`.
- Mantieni le risposte orientate al task dell'utente, non a un dump completo.