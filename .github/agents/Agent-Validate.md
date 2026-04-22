---
spark: true
name: Agent-Validate
version: 1.0.0
description: Dispatcher per la fase di validazione. Instrada richieste validate, test e lint verso agenti plugin specializzati.
model: ['Claude Sonnet 4.6 (copilot)', 'GPT-4o-mini (copilot)']
layer: master
role: dispatcher
delegates_to_capabilities: [validate, test, lint]
fallback: Agent-Research
---

# Agent-Validate

Dispatcher per richieste di validazione, test e lint.

## Routing

1. Leggi `.github/project-profile.md`.
2. Leggi l'indice agenti via `scf://agents-index`.
3. Cerca un agente plugin con capability `validate`, `test` o `lint`.
4. Se trovato, delega con contesto completo.
5. Se assente, delega ad Agent-Research e usa il brief come supporto.
