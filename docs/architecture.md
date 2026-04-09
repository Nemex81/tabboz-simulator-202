# Architettura — Tabboz Simulator 2026

> Documento tecnico che descrive l'architettura logica, i layer, i componenti e le convenzioni del progetto.

---

## Aggiornamenti recenti (08 Apr 2026)

- Aggiunte e modifiche al sottosistema "scuola": `initSchoolYear` è ora invocabile dall'onboarding (`SchoolSelection`).
- `SchoolRecord` include il campo persistente `isAtSchool` per indicare presenza mattutina (persistente in KV).
- Risolto un problema runtime di reconciliaton: alcune chiamate che aggiornavano lo stato del genitore sono state deferite al prossimo tick (pattern `setTimeout(..., 0)`) per evitare errori DOM `removeChild` in flussi mattutini.
- Per garantire remount puliti del pannello mattutino, `SchoolMorningPanel` viene ora renderizzato con keying/Suspense controllata quando `isComplete` cambia.
- Aggiunta logica di guard per il comando "Avanza fase" (UI + scorciatoia): viene bloccato durante la sequenza mattutina scolastica attiva.
- Report di analisi codice completo: `docs/ANALISI_CODEBASE_COMPLETA.md` (vedi sezione Documentazione).
- Le prove programmate supportano ora il discriminante opzionale `type?: 'scritto' | 'orale'` nel flusso `ScheduledExam`; la generazione è centralizzata in `exam-system.ts` con builder strutturati in `school-structured-events.ts`, e `ExamsPanel.tsx` espone il tipo nel pannello UI.


## Indice

1. [Panoramica](#panoramica)
2. [Stack Tecnologico](#stack-tecnologico)
3. [Struttura del Progetto](#struttura-del-progetto)
4. [Diagramma dei Layer](#diagramma-dei-layer)
5. [Entry Point e Bootstrap](#entry-point-e-bootstrap)
6. [Gestione dello Stato](#gestione-dello-stato)
7. [Custom Hooks (Business Logic)](#custom-hooks-business-logic)
8. [Librerie di Dominio (src/lib)](#librerie-di-dominio-srclib)
9. [Componenti UI](#componenti-ui)
10. [Sistema di Temi](#sistema-di-temi)
11. [Code Splitting e Lazy Loading](#code-splitting-e-lazy-loading)
12. [Accessibilità (a11y)](#accessibilità-a11y)
13. [Persistenza e Validazione](#persistenza-e-validazione)
14. [Audio](#audio)
15. [Build e Deploy](#build-e-deploy)
16. [Flusso Dati: Esempio Completo](#flusso-dati-esempio-completo)

---

## Panoramica

Tabboz Simulator 2026 è un **RPG gestionale single-page** costruito con React 19 e TypeScript.
Il giocatore interpreta uno studente delle superiori italiane e deve bilanciare studio, vita sociale, statistiche e relazioni per diplomarsi in 5 anni scolastici.

L'architettura segue un pattern **"Hooks as Services"**: tutta la logica di business risiede in custom hooks specializzati, orchestrati da un unico componente radice (`App.tsx`) che funge da **controller centralizzato**.

---

## Stack Tecnologico

| Livello        | Tecnologia                                  |
| -------------- | ------------------------------------------- |
| UI Framework   | React 19 + TypeScript 5.7                   |
| Build          | Vite 7 con SWC (`@vitejs/plugin-react-swc`) |
| Stili          | Tailwind CSS 4 + CSS custom properties      |
| Componenti UI  | shadcn/ui (Radix primitives) + Spark        |
| Icone          | Phosphor Icons (`@phosphor-icons/react`)     |
| Persistenza    | `@github/spark` KV Storage                  |
| Notifiche      | Sonner (toast)                               |
| Audio          | Web Audio API (sintetizzato)                 |
| Error Handling | `react-error-boundary`                       |
| Lint/Format    | ESLint 9 + TypeScript-ESLint                |

---

## Struttura del Progetto

```
tabboz-simulator-202/
├── index.html                  # Shell HTML
├── vite.config.ts              # Configurazione Vite + plugin
├── tailwind.config.js          # Configurazione Tailwind + preset Spark
├── tsconfig.json               # TypeScript strict mode + alias @/
├── package.json                # Dipendenze + script npm
├── theme.json                  # Definizioni varianti tema (JSON)
├── components.json             # Configurazione scaffolding shadcn/ui
├── runtime.config.json         # Impostazioni runtime (deploy)
│
├── docs/                       # Documentazione tecnica e piani
│
└── src/
    ├── main.tsx                # Entry point → ErrorBoundary + Toaster + App
    ├── App.tsx                 # Controller centralizzato (stato + hook + routing tab)
    ├── ErrorFallback.tsx       # Componente fallback per errori runtime
    ├── index.css               # Variabili CSS dei temi
    ├── main.css                # Import Tailwind + stili globali
    ├── vite-end.d.ts           # Dichiarazioni tipo ambiente Vite
    │
    ├── lib/                    # Logica di dominio pura (zero dipendenze React)
    │   ├── types.ts            # Tipi e interfacce condivise
    │   ├── game-utils.ts       # Utility stat, calcoli, probabilità
    │   ├── time-utils.ts       # Calendario, fasi giornata, avanzamento tempo
    │   ├── subjects.ts         # Definizioni materie per indirizzo/anno
    │   ├── exam-system.ts      # Generazione e valutazione prove scritte/orali
    │   ├── social-system.ts    # Generazione amici/relazioni, probabilità incontri
    │   ├── relation-system.ts  # Sistema relazionale 4 assi (amicizia/romantico/amore/odio)
    │   ├── girlfriend-system.ts# Generazione e gestione fidanzata
    │   ├── enhanced-friend-system.ts # Azioni amicizia avanzate
    │   ├── character-traits.ts # Tratti caratteriali (ispirazione CK3)
    │   ├── school-events.ts    # Eventi scolastici (professore, genitori)
    │   ├── school-morning-events.ts  # Eventi narrativi mattutini pre-scuola
    │   ├── school-structured-events.ts # Eventi contestuali in aula + builder prove strutturate
    │   ├── street-morning-events.ts  # Eventi narrativi mattutini (strada/marina)
    │   ├── afternoon-events.ts # Eventi narrativi pomeridiani
    │   ├── phase-actions.ts    # Azioni disponibili per fase/giorno
    │   ├── bet-system.ts       # Sistema scommesse e gare motorini
    │   ├── sound-effects.ts    # Sintesi audio via Web Audio API
    │   └── data-validation.ts  # Validazione e sanitizzazione dati
    │
    ├── hooks/                  # Custom hooks (business logic React)
    │   ├── useGameStats.ts     # Statistiche + reputazione automatica
    │   ├── useGameTime.ts      # Data, fase, azioni, avanzamento giorno
    │   ├── useGameActions.ts   # Handler per ogni tipo di azione
    │   ├── useEventEngine.ts   # Motore eventi casuali
    │   ├── useGameRelations.ts # Interazioni relazionali 4 assi
    │   ├── useHealthSystem.ts  # Condizioni di salute e status effect
    │   ├── useGameLog.ts       # Diario/log di gioco
    │   ├── useAppDialogs.ts    # Stato dei dialog modali
    │   ├── useKeyboardShortcuts.ts # Scorciatoie da tastiera
    │   └── use-mobile.ts       # Rilevamento dispositivo mobile
    │
    ├── components/             # Componenti React (presentazione + interazione)
    │   ├── ActionButton.tsx
    │   ├── CharacterSheet.tsx
    │   ├── CityPanel.tsx
    │   ├── DiaryPanel.tsx
    │   ├── EnhancedFriendsPanel.tsx
    │   ├── ExamsPanel.tsx
    │   ├── FriendsPanel.tsx
    │   ├── GameDialogs.tsx
    │   ├── GirlfriendPanel.tsx
    │   ├── GradeProgressPanel.tsx
    │   ├── HealthRecordPanel.tsx
    │   ├── KeyboardShortcutsDialog.tsx
    │   ├── RelationCard.tsx
    │   ├── RelationsPanel.tsx
    │   ├── RelationshipsPanel.tsx
    │   ├── ReportCardDialog.tsx
    │   ├── SchoolEventDialog.tsx
    │   ├── SchoolMorningPanel.tsx
    │   ├── SchoolSelection.tsx
    │   ├── StatDisplay.tsx
    │   ├── StatsDashboard.tsx
    │   ├── SubjectSelectionDialog.tsx
    │   ├── TeacherSelectionDialog.tsx
    │   ├── ThemeSelector.tsx
    │   └── TimeDisplay.tsx
    │
    ├── components/ui/          # Primitivi UI (shadcn/ui + Radix)
    │   ├── button.tsx          # ~48 componenti wrapper Radix
    │   ├── card.tsx
    │   ├── dialog.tsx
    │   ├── tabs.tsx
    │   └── ...
    │
    └── styles/
        └── theme.css           # CSS custom properties per variante tema
```

---

## Diagramma dei Layer

```
┌───────────────────────────────────────────────────────────────────┐
│                          Presentazione                            │
│   components/*.tsx + components/ui/*  (React JSX)                 │
├───────────────────────────────────────────────────────────────────┤
│                        Business Logic                             │
│   hooks/useGame*.ts   (Custom Hooks — stato + side-effect)        │
├───────────────────────────────────────────────────────────────────┤
│                          Dominio Puro                             │
│   lib/*.ts   (Funzioni pure, tipi, costanti — zero React)         │
├───────────────────────────────────────────────────────────────────┤
│                        Persistenza                                │
│   @github/spark  useKV()  (Key-Value storage locale)              │
├───────────────────────────────────────────────────────────────────┤
│                          Infrastruttura                           │
│   Vite  ·  Tailwind  ·  Web Audio API  ·  ErrorBoundary           │
└───────────────────────────────────────────────────────────────────┘
```

**Regole di dipendenza:**

- `lib/` **non** importa da `hooks/` o `components/` (logica pura).
- `hooks/` importa da `lib/` ma **non** da `components/`.
- `components/` importa da `hooks/` e `lib/`.
- `App.tsx` orchestra tutto: istanzia gli hook e distribuisce stato/callback ai componenti tramite props.

---

## Entry Point e Bootstrap

```
index.html
  └─ <div id="root">
       └─ src/main.tsx
            ├─ ErrorBoundary (react-error-boundary)
            │   └─ ErrorFallback.tsx
            ├─ Toaster (sonner, posizione: top-center)
            └─ App.tsx
```

1. **`main.tsx`** monta l'app con `createRoot()`.
2. **`ErrorBoundary`** intercetta errori runtime non gestiti e mostra `ErrorFallback`.
3. **`Toaster`** fornisce il sistema di notifiche toast a livello globale.
4. **`App.tsx`** è il controller centralizzato: gestisce tutto lo stato, gli hook e la composizione dei componenti.

---

## Gestione dello Stato

### Pattern: KV Storage + Validazione + Hook

Lo stato persistente vive in **KV Storage** (`useKV` di Spark).
Ogni valore KV passa attraverso un layer di **validazione** prima di essere usato.

```
useKV('tabboz-stats', defaults)      ← Storage persistente
    ↓
validateStats(rawStats)              ← Sanitizzazione + type safety
    ↓
useGameStats(validatedStats)         ← Hook business logic
    ↓
<StatDisplay value={stats.muscoli}>  ← Componente UI
```

### Chiavi KV Principali

| Chiave KV                  | Tipo                      | Descrizione                       |
| -------------------------- | ------------------------- | --------------------------------- |
| `tabboz-school-type`       | `SchoolType \| null`      | Indirizzo scolastico scelto       |
| `tabboz-player-profile`    | `PlayerProfile \| null`   | Profilo giocatore (nome, genere)  |
| `tabboz-grades`            | `SubjectGrades`           | Voti correnti per materia         |
| `tabboz-friends`           | `Friend[]`                | Lista amici                       |
| `tabboz-relationships`     | `Relationship[]`          | Interessi sentimentali            |
| `tabboz-girlfriend`        | `Ragazza \| null`         | Fidanzata attuale                 |
| `tabboz-theme`             | `ThemeVariant`            | Tema UI scelto                    |
| `tabboz-school-record`     | `SchoolRecord`            | Condotta, assenze, note           |
| `tabboz-grades-history`    | `Record<number, Grades>`  | Archivio voti per anno scolastico |

Nota: `SchoolRecord` ora include il campo persistente `isAtSchool: boolean` usato come flag indicativo se il giocatore si è recato fisicamente a scuola nella mattina corrente.

### Flusso di Aggiornamento

```
Azione utente → callback dal componente
  → hook handler (es. handleStudia)
    → calcolo logica pura (lib/*.ts)
    → setStats() → useKV setter → persistenza immediata
    → addLogEntry() → diario aggiornato
    → announce() → toast + ARIA live
```

---

## Custom Hooks (Business Logic)

Gli hook incapsulano la logica di gioco e separano le responsabilità:

| Hook                     | Responsabilità                                            |
| ------------------------ | --------------------------------------------------------- |
| `useGameStats`           | Gestione 12 statistiche, calcolo reputazione automatico   |
| `useGameTime`            | Avanzamento data/fase/azioni, pagella, promozione/bocciatura |
| `useGameActions`         | Esecuzione azioni (palestra, studia, lavoro, disco, ecc.) |
| `useEventEngine`         | Generazione eventi casuali (metallari, polizia, bulli, gare) |
| `useGameRelations`       | Interazioni relazionali 4 assi con prerequisiti ed effetti |
| `useHealthSystem`        | Condizioni di salute (influenza, infortunio, ecc.)         |
| `useGameLog`             | Diario giornaliero con entry tipizzate                     |
| `useAppDialogs`          | Stato on/off di tutti i dialog modali                      |
|                         | Include ora stati specifici per gli eventi mattutini: `schoolMorningEvents`, `showSchoolMorning`, `streetMorningEvents`, `showStreetMorning` |
| `useKeyboardShortcuts`   | Binding tastiera per a11y e power user                     |

### Orchestrazione

`App.tsx` istanzia **tutti** gli hook e compone i risultati:

```tsx
// App.tsx (semplificato)
const { stats, setStats } = useGameStats(announce);
const { gameTime, consumeAction, ... } = useGameTime({ stats, setStats, ... });
const { handleStudia, handlePalestra, ... } = useGameActions({ stats, gameTime, ... });
const { doInteraction } = useGameRelations({ friends, stats, ... });
const { triggerRandomEvent, ... } = useEventEngine({ stats, friends, ... });
const { healthRecord, tickConditions, ... } = useHealthSystem({ stats, ... });
const { gameLog, addLogEntry } = useGameLog();
const dialogs = useAppDialogs();
```

---

## Librerie di Dominio (src/lib)

Contengono **funzioni pure** e **costanti** senza dipendenze React.
Sono testabili in isolamento e riutilizzabili.

| Modulo                        | Responsabilità                                         |
| ----------------------------- | ------------------------------------------------------ |
| `types.ts`                    | Tipi e interfacce condivise per l'intero progetto       |
| `game-utils.ts`               | Utility generiche: clamp, probabilità, calcolo media    |
| `time-utils.ts`               | Calendario, fasi giornata, avanzamento tempo            |
| `subjects.ts`                 | Definizioni materie con pesi e disponibilità per indirizzo |
| `exam-system.ts`              | Generazione e valutazione prove programmate/interrogazioni |
| `social-system.ts`            | Generazione amici/relazioni, probabilità incontri       |
| `relation-system.ts`          | Sistema relazionale 4 assi + catalogo interazioni       |
| `girlfriend-system.ts`        | Generazione e gestione fidanzata                        |
| `enhanced-friend-system.ts`   | Azioni amicizia avanzate con effetti                    |
| `character-traits.ts`         | Tratti caratteriali (CK3-style) con bonus/malus         |
| `school-events.ts`            | Eventi scolastici (professore, genitori, condotta)      |
| `school-morning-events.ts`    | Eventi narrativi mattutini pre-scuola                   |
| `school-structured-events.ts` | Eventi contestuali in aula e builder per prove strutturate |
| `afternoon-events.ts`         | Eventi narrativi pomeridiani per location               |
| `phase-actions.ts`            | Mappa azioni disponibili per fase e tipo di giorno      |
| `bet-system.ts`               | Scommesse e gare motorini con importi dinamici          |
| `sound-effects.ts`            | Sintesi audio tramite Web Audio API                     |
| `data-validation.ts`          | Validazione runtime di tutti i tipi persistiti          |

---

## Componenti UI

### Componenti Applicativi

Organizzati per area funzionale:

**Core / Layout:**

| Componente           | Descrizione                                        |
| -------------------- | -------------------------------------------------- |
| `StatDisplay`        | Barra statistica singola con icona e valore         |
| `TimeDisplay`        | Data corrente, fase, azioni rimanenti               |
| `ActionButton`       | Pulsante azione con icona, label e stato disabled   |
| `ThemeSelector`      | Selettore variante tema (3 varianti)                |
| `CharacterSheet`     | Scheda personaggio con tab (profilo, tratti, relazioni) |

**Pannelli Principali (Tab):**

| Componente              | Descrizione                                         |
| ----------------------- | --------------------------------------------------- |
| `CityPanel`             | Hub principale: location e azioni disponibili       |
| `SchoolMorningPanel`    | Eventi narrativi mattutini (supporta prop `context: 'school' | 'street'` per renderizzare pool scuola o strada) |
| `EnhancedFriendsPanel`  | Gestione amici con sistema 4 assi                   |
| `RelationshipsPanel`    | Lista interessi sentimentali                        |
| `GirlfriendPanel`       | Dettaglio fidanzata corrente                        |
| `ExamsPanel`            | Verifiche programmate con countdown                 |
| `GradeProgressPanel`    | Voti per materia con pesi e stato                   |
| `StatsDashboard`        | Dashboard statistiche avanzate                      |
| `DiaryPanel`            | Diario/log giornaliero con filtri                   |
| `HealthRecordPanel`     | Condizioni di salute attive e storico               |

**Dialog:**

| Componente                | Descrizione                                      |
| ------------------------- | ------------------------------------------------ |
| `GameDialogs`             | Container di tutti i dialog di gioco              |
| `SchoolEventDialog`       | Evento scolastico con scelte                      |
| `ReportCardDialog`        | Visualizzazione pagella (promosso/bocciato)       |
| `SubjectSelectionDialog`  | Selezione materia per azione "Studia"             |
| `TeacherSelectionDialog`  | Selezione professore per corruzione/minaccia      |
| `KeyboardShortcutsDialog` | Help scorciatoie da tastiera                      |
| `SchoolSelection`         | Scelta indirizzo scolastico (onboarding)          |

### Primitivi UI (components/ui/)

Libreria di ~48 componenti wrapper basati su **Radix UI** (pattern shadcn/ui):
`button`, `card`, `dialog`, `tabs`, `badge`, `progress`, `tooltip`, `alert-dialog`, `select`, `scroll-area`, `sheet`, `drawer`, `table`, `chart`, ecc.

Tutti i primitivi seguono le convenzioni shadcn/ui:
- Composizione tramite slot pattern
- Varianti via `class-variance-authority`
- Merge classi con `clsx` + `tailwind-merge`

---

## Sistema di Temi

Tre varianti gestite tramite CSS custom properties e attributo `data-theme` su `<html>`:

| Variante   | Nome             | Palette                           |
| ---------- | ---------------- | --------------------------------- |
| `default`  | Neon Blue        | Navy + cyan/teal accents          |
| `dark`     | Black Violet     | Deep black + violet accents       |
| `green`    | Ganja Style      | Earth brown + green accents       |

**Meccanismo:**
1. `theme.json` definisce i valori per ogni variante.
2. `src/index.css` / `src/styles/theme.css` dichiarano le variabili CSS per ciascun `[data-theme]`.
3. `ThemeSelector` aggiorna `useKV('tabboz-theme')`.
4. `App.tsx` applica l'attributo `data-theme` al root HTML.

---

## Code Splitting e Lazy Loading

I pannelli raramente usati vengono caricati on-demand con `React.lazy` + `Suspense`:

```tsx
const StatsDashboard = React.lazy(() => import('./components/StatsDashboard'));
const ExamsPanel = React.lazy(() => import('./components/ExamsPanel'));
const SchoolMorningPanel = React.lazy(() => import('./components/SchoolMorningPanel'));
// ...altri pannelli lazy
```

Componenti **sempre presenti** (caricati staticamente):
- `StatDisplay`, `TimeDisplay`, `ActionButton`
- `CityPanel`, `CharacterSheet`, `EnhancedFriendsPanel`

---

## Accessibilità (a11y)

Il progetto implementa accessibilità a più livelli:

- **ARIA live regions** per annunci di cambio stato (statistiche, eventi, risultati).
- **Focus trap** nei dialog modali con `aria-modal`.
- **Scorciatoie da tastiera**: `?` per help, `Ctrl+1-8` per tab, `Space` per azione, `Escape` per chiudere dialog.
- **Screen reader**: ogni cambio significativo viene annunciato tramite `announce()` (toast + ARIA).
- **Contrasto colori**: palette progettata per ratio ≥ 9:1.
- **Navigazione Tab**: tutti i controlli raggiungibili senza mouse.

---

## Persistenza e Validazione

### Persistenza

Ogni dato di gioco è persistito in tempo reale via `useKV`:

```
Modifica stato → useKV setter → Persistenza immediata → Sopravvive a refresh
```

Non esiste un pulsante "Salva": tutto è auto-salvato.

### Validazione

Il layer di validazione (`data-validation.ts`) assicura che dati corrotti o da versioni precedenti vengano sanitizzati:

```
useKV(raw) → validate*(raw) → dato tipizzato e sicuro
```

Funzioni di validazione: `validateStats`, `validateGrades`, `validateGameTime`, `validateFriends`, `validateRelationships`, `validateScheduledExams`, `validateSchoolType`, `validatePlayerProfile`.

La migrazione da formati legacy è gestita da `migrateLegacyFriend()` che aggiunge il campo `rel` (4 assi) se mancante.

---

## Audio

Il sistema audio usa la **Web Audio API** nativa per sintetizzare effetti sonori senza file esterni:

| Effetto           | Trigger                              |
| ----------------- | ------------------------------------ |
| `statIncrease`    | Aumento statistica                    |
| `statDecrease`    | Calo statistica                       |
| `bigWin`          | Vittoria evento                       |
| `bigLoss`         | Sconfitta evento                      |
| `reputationUp`    | Aumento livello reputazione           |
| `gameOver`        | Fine partita (bocciatura/espulsione)  |
| `buttonClick`     | Click su qualsiasi pulsante azione    |

Volume contenuto (gain 0.1–0.3), durata breve (50–400 ms), nessun file audio esterno.

---

## Build e Deploy

### Script

| Comando           | Descrizione                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Dev server Vite (`127.0.0.1:5000`)       |
| `npm run build`   | Build produzione (`tsc -b && vite build`) |
| `npm run preview` | Anteprima build produzione                |
| `npm run lint`    | ESLint                                    |

### Configurazione Vite

- **Base path**: `/tabboz-simulator-202/` (per GitHub Pages)
- **Plugin**: `react-swc`, `tailwindcss`, `sparkPlugin`, `createIconImportProxy`
- **Alias**: `@/` → `src/`
- **Output**: `dist/`

---

## Flusso Dati: Esempio Completo

**Scenario: il giocatore preme "Studia" → seleziona Matematica → riceve il risultato**

```
1. Utente preme Ctrl+5 (scorciatoia "Studia")
   └─ useKeyboardShortcuts → setShowSubjectDialog(true)

2. SubjectSelectionDialog si apre (modale, focus trap)
   └─ Mostra materie con voto attuale + indicatore colore (🔴/🟡/🟢)
   └─ Utente seleziona "Matematica" → Enter per confermare

3. useGameActions.handleStudia('matematica')
   ├─ consumeAction()                    ← decrementa azioni rimanenti
   ├─ calculateStudyGradeIncrease()      ← formula con Intelligenza
   │   └─ incremento = 0.2 * (intel / 50) * mentalModifier
   ├─ setGrades({ matematica: +incremento })
   ├─ setStats({ stanchezza: +15, intelligenza: +rand(1,3) })
   ├─ getFriendStudyBonus(friends)       ← bonus amici secchioni
   ├─ addLogEntry('azione', 'Studio', 'Matematica +0.4', 'successo')
   ├─ triggerRandomEvent()               ← 10% interrogazione sorpresa
   └─ announce('Hai studiato Matematica: +0.4')  ← toast + ARIA

4. KV Storage aggiornato automaticamente
5. UI ri-renderizza con nuovi voti/stat
```
