# Tabboz Simulator — 2026 Edition

> Un RPG gestionale che celebra la cultura *coatta* degli anni '90-2000 italiani, con meccaniche scolastiche avanzate, sistema sociale profondo e relazioni sentimentali.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Indice

- [Panoramica](#panoramica)
- [Feature Principali](#feature-principali)
- [Quick Start](#quick-start)
- [Script Disponibili](#script-disponibili)
- [Stack Tecnologico](#stack-tecnologico)
- [Struttura del Progetto](#struttura-del-progetto)
- [Documentazione](#documentazione)
- [Accessibilità](#accessibilità)
- [Contribuire](#contribuire)
- [Licenza](#licenza)

---

## Panoramica

**Tabboz Simulator 2026** è la riedizione moderna dell'iconico simulatore italiano.
Il giocatore interpreta uno studente delle superiori e deve:

- Sopravvivere a **5 anni scolastici** (dalla prima alla quinta)
- Bilanciare **12 statistiche** tra fisiche, mentali e risorse
- Gestire **amicizie a 4 assi** (amicizia, romantico, amore, odio)
- Coltivare **relazioni sentimentali** con profili generati casualmente
- Superare **eventi casuali** (metallari, polizia, bulli, gare motorini)
- Ottenere il **diploma di maturità** senza essere bocciato o espulso

Il gioco è completamente client-side, con persistenza locale via KV storage e **zero backend**.

Le prove scolastiche programmate distinguono ora tra compiti scritti e interrogazioni orali, mentre gli eventi della mattina prima di entrare a scuola sono separati dagli eventi che avvengono già in aula.

---

## Feature Principali

| Area | Funzionalità |
| --- | --- |
| **Scuola** | 6 indirizzi scolastici, materie con pesi, prove programmate scritte/orali, interrogazioni a sorpresa, condotta e assenze |
| **Statistiche RPG** | 12 stat (muscoli, coattaggine, figosità, intelligenza, carisma, salute, ecc.) con reputazione derivata |
| **Relazioni 4 Assi** | Sistema relazionale amicizia/romantico/amore/odio con catalogo interazioni e prerequisiti |
| **Fidanzata** | Generazione procedurale con personalità, hobby, aspetto e sistema romantico progressivo |
| **Tratti Caratteriali** | 16 tratti CK3-style (gregario/solitario, coraggioso/codardo, ecc.) con bonus e malus |
| **Eventi Casuali** | Metallari, polizia, bulli, gare motorini con scommesse dinamiche e modificatori reputazione |
| **Salute** | 8 condizioni (influenza, infortunio, acne, ecc.) con durata e status effect |
| **Audio** | Effetti sonori sintetizzati via Web Audio API |
| **Temi** | 3 varianti visive (Neon Blue, Black Violet, Ganja Style) |
| **Accessibilità** | ARIA live, focus trap, scorciatoie da tastiera, contrasto ≥ 9:1 |
| **Persistenza** | Auto-save in tempo reale, sopravvive al refresh del browser |

---

## Quick Start

### Prerequisiti

- [Node.js](https://nodejs.org/) 18+ (consigliato 20+)
- npm 9+

### Installazione

```bash
# Clona il repository
git clone https://github.com/Nemex81/tabboz-simulator-202.git
cd tabboz-simulator-202

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su **http://127.0.0.1:5000/tabboz-simulator-202/**

### Build di Produzione

```bash
npm run build
npm run preview
```

---

## Script Disponibili

| Script | Comando | Descrizione |
| --- | --- | --- |
| **dev** | `npm run dev` | Server di sviluppo con HMR |
| **build** | `npm run build` | Build TypeScript + Vite per produzione |
| **preview** | `npm run preview` | Anteprima della build di produzione |
| **lint** | `npm run lint` | Analisi statica con ESLint |

---

## Stack Tecnologico

| Livello | Tecnologia |
| --- | --- |
| **UI Framework** | React 19 + TypeScript 5.7 |
| **Build Tool** | Vite 7 (SWC) |
| **Stili** | Tailwind CSS 4 + CSS custom properties |
| **Componenti** | shadcn/ui (Radix UI primitives) + GitHub Spark |
| **Icone** | Phosphor Icons |
| **Audio** | Web Audio API (sintetizzato, zero file esterni) |
| **Persistenza** | `@github/spark` KV Storage |
| **Notifiche** | Sonner |
| **Error Handling** | react-error-boundary |

---

## Struttura del Progetto

```
tabboz-simulator-202/
├── docs/                       # Documentazione tecnica
│   ├── architecture.md         # Architettura logica e componenti
│   └── api.md                  # Riferimento API (librerie, hook, componenti)
│
├── src/
│   ├── main.tsx                # Entry point (ErrorBoundary + Toaster + App)
│   ├── App.tsx                 # Controller centralizzato
│   ├── lib/                    # Logica di dominio pura (zero React)
│   ├── hooks/                  # Custom hooks (business logic)
│   ├── components/             # Componenti React (27 applicativi)
│   │   └── ui/                 # ~48 primitivi shadcn/ui
│   └── styles/                 # CSS temi
│
├── vite.config.ts              # Configurazione build
├── tailwind.config.js          # Configurazione Tailwind
├── tsconfig.json               # TypeScript strict
└── package.json                # Dipendenze e script
```

Per una descrizione completa, consulta la [documentazione tecnica](#documentazione).

---

## Documentazione

| Documento | Descrizione |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | Architettura logica, layer, flusso dati, componenti |
| [docs/api.md](docs/api.md) | Riferimento API completo: tipi, funzioni, hook, costanti |
| [docs/ANALISI_CODEBASE_COMPLETA.md](docs/ANALISI_CODEBASE_COMPLETA.md) | Report di analisi e piano di rimedio (audit completo, 08 Apr 2026) |
| [THEME_SYSTEM.md](THEME_SYSTEM.md) | Sistema di temi e variabili CSS |
| [SECURITY.md](SECURITY.md) | Policy di sicurezza |
| [PRD.md](PRD.md) | Product Requirements Document |

---

## Accessibilità

Il progetto è progettato per essere **completamente accessibile**:

- **Screen reader:** notifiche ARIA live per ogni azione e cambio di stato
- **Navigazione da tastiera:** tutti i controlli raggiungibili senza mouse
- **Scorciatoie:** `?` per aiuto, `Ctrl+1-8` per tab, `Space` per azione, `Escape` per chiudere
- **Focus trap:** attivo in tutti i dialog modali
- **Contrasto:** palette con ratio minimo 9:1
- **Semantica:** struttura heading corretta, label su ogni controllo

---

## Contribuire

1. Fai un fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/nome-feature`)
3. Committa le modifiche (`git commit -m 'Aggiungi nome-feature'`)
4. Pusha il branch (`git push origin feature/nome-feature`)
5. Apri una Pull Request

### Convenzioni

- **Codice:** TypeScript strict, ESLint
- **Stili:** Tailwind CSS utility-first
- **Componenti:** Pattern shadcn/ui (composizione via slot)
- **Stato:** Hook custom, zero state management library
- **Logica pura:** Funzioni in `src/lib/` senza dipendenze React

Documentazione aggiornata: 08 Apr 2026 — vedi `docs/ANALISI_CODEBASE_COMPLETA.md` per l'audit e i prossimi passi consigliati.

---

## Licenza

Distribuito sotto licenza **MIT**. Vedi [LICENSE](LICENSE) per i dettagli.
