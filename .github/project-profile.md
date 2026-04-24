---
<<<<<<< HEAD
initialized: false
scf_protected: true
scf_file_role: "config"
scf_merge_priority: 10
scf_merge_strategy: "user_protected"
active_plugins: []
scf_version: "1.2.0"
framework_edit_mode: false
scf_owner: "spark-base"
spark: true
framework_version: ""

=======
spark: true
initialized: true
framework_edit_mode: false
active_plugins:
	- scf-master-codecrafter
	- spark-base
framework_version: "scf-master-codecrafter@2.1.0"
spark_base_version: "1.4.0"
engine_version: "2.1.1"
project_name: "Tabboz Simulator"
description: "Riedizione moderna di Tabboz Simulator: RPG gestionale client-side"
stack:
	- "React 19"
	- "TypeScript 5.7"
	- "Vite 7"
	- "Tailwind CSS 4"
test_runner: "Vitest"
build_system: "tsc + Vite"
initialized_at: "2026-04-17"
>>>>>>> 402c79acd997c4a955f32ea72a8678fcb9c17e66
---

# Project Profile

File auto-generato dall'agente di onboarding (`Agent-Welcome` style). Contiene i metadati minimi usati dal framework SCF per operazioni di bootstrap e diagnostica.

<<<<<<< HEAD
Compilazione iniziale prevista:

- Agent-Welcome raccoglie nome progetto, stack, workflow e vincoli.
- I plugin installati aggiornano `active_plugins` senza sovrascrivere il resto.
- `framework_version` viene valorizzato quando il layer master e installato nel workspace target.

Quando `initialized: false`, gli agenti devono:

- mostrare un avviso non bloccante;
- evitare assunzioni su linguaggio o stack;
- proporre `#project-setup` o Agent-Welcome per il bootstrap.
=======
Campi principali:
- `initialized`: indica che il workspace è stato inizializzato per l'integrazione SCF.
- `active_plugins`: elenco dei pacchetti SCF attualmente installati nel workspace.
- `framework_version`: versione del layer master installato.
- `engine_version`: versione del motore SCF rilevata.
- `project_name`, `description`, `stack`, `test_runner`, `build_system`: informazioni di riferimento utili per agenti e script di bootstrap.

Se desideri che l'agente rimuova o modifichi campi, richiedi esplicitamente le modifiche.
>>>>>>> 402c79acd997c4a955f32ea72a8678fcb9c17e66
