---
spark: true
name: file-deletion-guard
description: Impone conferma esplicita e elenco impatti prima di eliminare file o directory.
---

# file-deletion-guard

- Non eliminare file senza conferma utente esplicita.
- Elenca sempre i path coinvolti e il motivo.
- Se il file appartiene al framework, verifica anche il perimetro `framework-guard`.