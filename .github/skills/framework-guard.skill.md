---
spark: true
name: framework-guard
description: Definisce il blocco standard per modifiche ai componenti del framework SCF.
---

# framework-guard

- Verifica se il task e framework-scope o application-scope.
- Se tocchi `.github/**`, dichiara esplicitamente il perimetro.
- Non mischiare nello stesso changeset framework e codice applicativo se evitabile.