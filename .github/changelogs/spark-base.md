---
spark: true
---

# Changelog — spark-base

## [1.1.0] - 2026-04-15

### Added

- `spark-guide.agent.md` entra nel layer base come agente user-facing condiviso tra bootstrap iniziale e stack pacchetti.

### Changed

- Il pacchetto richiede `spark-framework-engine >= 2.1.0` per adottare in sicurezza `spark-guide` quando il file era gia' stato bootstrap-pato dal motore.

## [1.0.0] - 2026-04-15

### Added

- Prima release del layer fondazionale SCF.
- 11 agenti base per orchestrazione, validazione, git, release, docs e ricerca.
- Instruction, skill condivise e prompt framework migrati da `scf-master-codecrafter`.

### Notes

- Richiede `spark-framework-engine >= 1.9.0`.