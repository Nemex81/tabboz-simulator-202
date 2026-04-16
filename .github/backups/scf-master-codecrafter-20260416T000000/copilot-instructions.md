# Copilot Custom Instructions  Solitario Classico Accessibile

## Contesto Progetto

Leggi `.github/project-profile.md` prima di
qualsiasi operazione. È la source of truth per
nome, stack tecnico e architettura del progetto.
Non usare valori hardcoded in questo file come
riferimento al progetto corrente.

Se `initialized: false`: NON interrompere l'operazione.
Aggiungi in testa alla tua risposta questo avviso,
prima di qualsiasi altro contenuto:

***
⚠️ PROGETTO NON INIZIALIZZATO
Framework non configurato. Per abilitare tutte le funzionalità:
scrivi `#project-setup` in chat, oppure seleziona Agent-Welcome e scrivi "nuovo progetto".
Puoi continuare a usare il framework normalmente.
***

Poi prosegui normalmente con il task richiesto.

## Framework Copilot v1.11.0

**Questo progetto utilizza un framework orchestrazione Copilot con agenti nativi VS Code.**

### Quick Start (3 passi)

1. **Seleziona agente**: dal dropdown agenti nella chat di VS Code (`.github/agents/`)
2. **Scopri gli agenti**: [.github/agents/Agent-NAME.md](agents/) per la specifica di ciascuno

### Componenti Framework

| Componente | Scopo |
|-----------|-------|
| **`.github/agents/*.md`** | 14 agenti nativi VS Code |
| **`.github/skills/*.skill.md`** | Abilità atomiche riutilizzabili |
| **`.github/instructions/*.instructions.md`** | Regole contestuali per filetype |
| **`.github/prompts/*.md`** | Entry point e workflow |

Dettaglio completo: → `.github/AGENTS.md`

---

... (file truncated for brevity)
