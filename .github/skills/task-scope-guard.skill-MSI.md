---
spark: true
name: task-scope-guard
description: Controlla che il task resti nel perimetro richiesto e segnala deviazioni prima di implementare.
---

# task-scope-guard

- Esplicita repository e file in scope.
- Se emergono side effect cross-repo, dichiarali prima di modificare.
- Non estendere il task senza motivo verificabile.