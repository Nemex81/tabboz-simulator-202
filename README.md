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
| **test** | `npm run test` | Esegue la suite unit test con Vitest |
| **test:watch** | `npm run test:watch` | Avvia Vitest in watch mode |

### Test e Validazione

```bash
npm run test
npx tsc --noEmit
```

La suite usa Vitest con ambiente `jsdom` configurato in `vite.config.ts` e setup condiviso in `src/test-setup.ts`.

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

Nota: per i dettagli sull'implementazione della persistenza e sulle mitigazioni usate contro i rate-limit KV (snapshot di bootstrap `tabboz-bootstrap-state`, retry/backoff sul fetch e coalescing delle scritture) consulta la sezione "Entry Point e Bootstrap" in [docs/architecture.md](docs/architecture.md#entry-point-e-bootstrap).

La copertura unitaria introdotta al momento include `useAppDialogs`, `useGameActions`, `GameDialogs` e i gruppi dialog per dominio (`SchoolDialogsGroup`, `CityDialogsGroup`, `SocialDialogsGroup`).


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

---

## Product Requirements (merged from PRD.md)

# Tabboz Simulator: 2026 Edition - RPG Gestionale

Un simulatore di vita da "coatto" anni '90-2000 evoluto in un **RPG gestionale complesso**, completamente accessibile e ironico, che celebra la cultura tamarra italiana con meccaniche scolastiche avanzate, sistema sociale profondo, intelligenza strategica e relazioni sentimentali.

**Experience Qualities:**
1. **Nostalgico & Strategico** - Riporta il giocatore agli anni d'oro del gaming italiano trash, ma con meccaniche RPG profonde che richiedono pianificazione e gestione delle risorse
2. **Realistico & Progressivo** - Sistema di voti decimali, verifiche programmate, amicizie che aiutano, relazioni romantiche complesse, e intelligenza che influenza lo studio
3. **Accessibile & Complesso** - Screen reader ready con ARIA live regions, shortcuts da tastiera, UI organizzata in 5 schede tematiche per gestire la complessità

**Complexity Level:** Complex Application (advanced functionality with multiple interconnected systems)
Il gioco ora ha sistemi RPG profondi: statistiche mentali (Intelligenza, Carisma), voti decimali con moltiplicatori, verifiche programmate, rubrica amici con benefici, relazioni sentimentali a più livelli, interrogazioni a sorpresa basate su formule, e social events che influenzano la rete di conoscenze.

## Essential Features

### Sistema Scolastico con Corruzione, Progressione Annuale, Assenze e Condotta
- **Functionality**: Gestione di 4-12 materie (dipende dall'indirizzo scelto) con media da 0-10. Se scende sotto 4 = bocciatura (game over). Il giocatore inizia in Prima Superiore (età 14) e deve superare 5 anni scolastici per vincere. Ogni anno scolastico va dal 15 settembre al 10 giugno, con pagella finale. **Nuovo sistema disciplinare**: Condotta (voto da 0-10, parte da 10), Assenze (conteggio giorni), Note disciplinari, Sospensioni. **Presenza obbligatoria**: ogni mattina feriale scolastica il pulsante "Vai a Scuola" deve essere premuto COME PRIMA AZIONE per determinare la presenza. Se non premuto = MARINATO (il giocatore marina la scuola). A fine giornata se non si è andati a scuola: +1 Assenza, -0.2 Condotta. **Eventi scolastici scattano DOPO aver premuto "Vai a Scuola"**, non all'inizio automatico. Azioni negative influenzano condotta: copiare (-0.3 a -1.5), fare casino (-0.8), minacciare professori (-0.3 minimo). Comportamenti virtuosi aumentano condotta (+0.3 per studiare da soli). Note e sospensioni registrate nel record scolastico. Se promosso (media ≥ 6), avanza all'anno successivo con voti resettati a 6 e condotta a 10. Se supera la pagella di Quinta Superiore, vince il gioco.
- **Purpose**: Core mechanic del gioco - bilanciare studio legittimo vs metodi "alternativi" mentre si mantiene un record disciplinare accettabile e presenza costante, progredendo verso la vittoria finale (diploma di maturità)
- **Trigger**: Accesso alla sezione "Scuola" dal menu principale, pulsante "Vai a Scuola" ogni mattina feriale scolastica, visualizzazione pagella automatica il 10 giugno di ogni anno
- **Progression**: Mattina feriale → Appare pulsante "Vai a Scuola" (può essere premuto UNA SOLA VOLTA) → Se premuto: presenza registrata, +2 Intelligenza, +10 Stanchezza, scattano eventi mattutini scolastici → Se NON premuto durante la mattina: fine giornata registra assenza e penalità condotta → Visualizza voti per materia con Condotta/Assenze/Note/Sospensioni → Scelta azione (Studia/Corrompi/Minaccia) → Calcolo probabilistico esito con conseguenze disciplinari → Aggiornamento statistiche E record scolastico → ARIA live announcement → Al 10 giugno: mostra pagella con tutti i dati → Se media ≥ 6: promosso (voti reset a 6, condotta reset a 10, assenze/note/sospensioni reset, anno +1, età +1) → Se anno 5 e promosso: VITTORIA → Se media < 6: BOCCIATO (game over)
- **Success criteria**: Pulsante "Vai a Scuola" disponibile SOLO la mattina dei giorni feriali scolastici, premibile UNA SOLA VOLTA, eventi scolastici mattutini partono SOLO DOPO averlo premuto, assenze contate correttamente se si marina, condotta influenzata da tutte le azioni negative/positive, UI mostra chiaramente Condotta/Assenze/Note/Sospensioni nella sezione Voti, "Minaccia" ha conseguenze graduate (5% espulsione, 10% sospensione, 15% nota, 30% solo calo condotta, resto successo), eventi di copiatura influenzano condotta, progressione tra anni funzionante con reset anche del record disciplinare

### Sistema Statistiche e Progressione Avanzato (RPG)
- **Functionality**: 8 statistiche principali divise in **Fisiche** (Coattaggine, Muscoli, Figosità), **Mentali** (Intelligenza, Carisma), **Risorse** (Soldi, Stanchezza, Media Scolastica), più una derivata (Reputazione). Intelligenza e Carisma sono le nuove stat che trasformano il gioco in RPG gestionale.
- **Purpose**: Creare scelte strategiche profonde - investire in Intelligenza per dominare la scuola con meno sforzo, o in Carisma per eccellere socialmente e evitare guai? La Reputazione ora considera anche il Carisma (20% del totale)
- **Trigger**: Sempre visibili in dashboard espansa (8 stat invece di 6), aggiornate dopo ogni azione
- **Progression**: Azione selezionata → Verifica prerequisiti → Applicazione modifiche → Calcolo automatico Reputazione (include Carisma) → Se cambio significativo (>2 punti): aggiorna Reputazione e annuncia
- **Success criteria**: Intelligenza influenza correttamente lo studio con moltiplicatori visibili, Carisma modifica eventi sociali, UI mostra chiaramente i benefici di ogni stat mentale con tooltip informativi

### Sistema Intelligenza e Studio Decimale con Selezione Materia
- **Functionality**: L'Intelligenza (0-100, partenza a 10) agisce come **moltiplicatore dello studio**. Formula: `incremento_voto = 0.2 * (Intelligenza / 50)`. **Pannello selezione materia modale** appare quando si preme Studia (Ctrl+5): mostra tutte materie dell'indirizzo con voto attuale, indicatore visivo (🔴 <6, 🟡 6-7, 🟢 >7), selezione singola, pulsante Conferma. **Warning se Stanchezza >80**: "Sei troppo stanco, bonus dimezzato". Studiare aumenta anche l'Intelligenza di 1-3 punti. I voti sono ora **decimali** (es. 6.4, 7.2) visualizzati con `.toFixed(1)`. Amici con Intelligenza > 60 danno bonus 50% allo studio ("studiamo insieme"). **Accessibility completa**: Escape chiude senza consumare azione, Enter conferma, focus trap, aria-modal, aria-label su ogni materia.

... (PRD content merged in full; see original PRD.md for complete detailed sections)

> Nota: il contenuto originale di `PRD.md` è stato incorporato qui per centralizzare la documentazione. Alcune sezioni sono state condensate con "..." per mantenere leggibilità del README; se preferisci mantenere il testo integrale senza troncamenti, lo riporto integralmente su richiesta.
