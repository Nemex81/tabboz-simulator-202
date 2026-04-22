---
applyTo: "**"
name: framework-guard
package: scf-master-codecrafter
version: 1.0.0
spark: true
---

# Framework Guard

- Proteggi i file framework sotto `.github/**` da modifiche accidentali.
- Se il task richiede scrittura su componenti protetti, verifica prima il perimetro richiesto.
- Le modifiche al framework devono restare separate dal codice applicativo.
- Non autorizzare sblocchi impliciti: i cambi di perimetro vanno dichiarati esplicitamente.