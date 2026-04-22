---
spark: true
name: code-routing
description: Classifica un task di implementazione come UI o non-UI per il dispatcher code router.
---

# code-routing

- Se il task tocca accessibilita, interazioni visive o componenti UI: route `code-ui`.
- Se il task tocca logica, backend, tooling o docs tecniche: route `code`.
- Se il task e misto, spezzalo in fasi e segnala l'ambiguita all'orchestratore.
