# Tabboz Simulator 2026 — Piano Tecnico UI/Accessibilità

**Repository:** `Nemex81/tabboz-simulator-202`  
**Data:** 17 aprile 2026  
**Stato documento:** Piano tecnico operativo — pronto per implementazione  
**Input:** `docs/tabboz_ui_implementation_proposal.md` (validato)  
**Screen reader target:** NVDA su Windows 11

---

## Indice

- [Blocco 1 — Modifiche immediate](#blocco-1--modifiche-immediate)
  - [1.1 ActionButton — sr-only su blockedReason](#11-actionbutton--sr-only-su-blockedreason)
  - [1.2 TimeDisplay — aria-live su interazioniRimaste](#12-timedisplay--aria-live-su-interazionirimaste)
  - [1.3 MainGameTabs — Rename label tab ambigui](#13-mainGametabs--rename-label-tab-ambigui)
  - [1.4 index.css — Glow neon adattivo ai temi](#14-indexcss--glow-neon-adattivo-ai-temi)
  - [1.5 main.css — Pulizia contenuto corrotto](#15-maincss--pulizia-contenuto-corrotto)
- [Blocco 2 — Modifiche moderate](#blocco-2--modifiche-moderate)
  - [2.1 MainGameTabs — Tab disabilitati per fase di gioco](#21-mainGametabs--tab-disabilitati-per-fase-di-gioco)
  - [2.2 AppHeader — morningChoicePending con link diretto](#22-appheader--morningchoicepending-con-link-diretto)
  - [2.3 SchoolMorningPanel — Colori categoria adattivi al tema](#23-schoolmorningpanel--colori-categoria-adattivi-al-tema)
  - [2.4 MainGameTabs — sr-only su emoji decorative mobile](#24-mainGametabs--sr-only-su-emoji-decorative-mobile)
- [Blocco 3 — Analisi preventiva](#blocco-3--analisi-preventiva)
  - [3.1 SchoolTab — Riduzione tab annidati](#31-schooltab--riduzione-tab-annidati)
  - [3.2 DailyControls — Replica contestuale](#32-dailycontrols--replica-contestuale)
  - [3.3 UI globale — Border-radius e uppercase](#33-ui-globale--border-radius-e-uppercase)
- [Ordine di implementazione consigliato](#ordine-di-implementazione-consigliato)
- [Criteri gate pre-merge](#criteri-gate-pre-merge)

---

## Convenzioni documento

- **Stato attuale**: snippet reale estratto dai file sorgente.
- **Diff proposto**: blocco `before`/`after` con context sufficiente.
- `DayPhase` reale: `'mattina' | 'pomeriggio' | 'sera' | 'notte'` — nessuna stringa inglese.
- `TabsTrigger value` reali: `'school'`, `'city'`, `'character'`, `'social'`, `'status'`.
- `useId()` va usato **internamente** in `ActionButton`; non esporre prop `id` esterno.
- `setActiveTab` non va passato ad `AppHeader`: usare callback `onGoToSchool: () => void`.

---

## Blocco 1 — Modifiche immediate

### 1.1 ActionButton — sr-only su blockedReason

**File:** `src/components/ActionButton.tsx`

#### Problema

Quando `disabled=true` e `blockedReason` è definito, il motivo del blocco è accessibile solo via hover tooltip (`TooltipContent`). NVDA non annuncia il tooltip su elementi disabilitati: il pulsante diventa un vicolo cieco per utenti non vedenti.

#### Stato attuale

```tsx
// ActionButton.tsx — riga ~85-100
if (disabled && blockedReason) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-not-allowed">{buttonContent}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-center">
          {blockedReason}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

Il `buttonContent` corrente:

```tsx
// ActionButton.tsx — riga ~46-82
const buttonContent = (
  <motion.div ...>
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      ...
      aria-label={ariaLabel || label}
    >
      <motion.div className="text-3xl" aria-hidden="true">{icon}</motion.div>
      <div className="text-sm font-bold uppercase tracking-wider">{label}</div>
      {shortcut && (
        <div className="absolute top-1 right-1 text-xs opacity-70 font-mono" aria-hidden="true">
          {shortcut}
        </div>
      )}
    </Button>
  </motion.div>
)
```

`useId()` non è importato. Non esiste prop `id`.

#### Diff proposto

```tsx
// BEFORE — imports attuali
import React, { ReactNode, useRef } from 'react'

// AFTER — aggiungere useId
import React, { ReactNode, useId, useRef } from 'react'
```

```tsx
// BEFORE — corpo del componente, prima di buttonContent
export const ActionButton = React.memo(function ActionButton({
  ...
}: ActionButtonProps) {
  const helpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

// AFTER — aggiungere useId subito dopo la destructuring
export const ActionButton = React.memo(function ActionButton({
  ...
}: ActionButtonProps) {
  const id = useId()
  const helpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
```

```tsx
// BEFORE — Button interno in buttonContent
      aria-label={ariaLabel || label}
    >
      <motion.div className="text-3xl" aria-hidden="true">{icon}</motion.div>
      <div className="text-sm font-bold uppercase tracking-wider">{label}</div>
      {shortcut && (
        <div className="absolute top-1 right-1 text-xs opacity-70 font-mono" aria-hidden="true">
          {shortcut}
        </div>
      )}
    </Button>

// AFTER — aggiungere aria-describedby e span sr-only nel Button
      aria-label={ariaLabel || label}
      aria-describedby={disabled && blockedReason ? `${id}-blocked` : undefined}
    >
      <motion.div className="text-3xl" aria-hidden="true">{icon}</motion.div>
      <div className="text-sm font-bold uppercase tracking-wider">{label}</div>
      {shortcut && (
        <div className="absolute top-1 right-1 text-xs opacity-70 font-mono" aria-hidden="true">
          {shortcut}
        </div>
      )}
      {disabled && blockedReason && (
        <span id={`${id}-blocked`} className="sr-only">
          {blockedReason}
        </span>
      )}
    </Button>
```

#### Dipendenze

- `useId` disponibile da React 18 — già soddisfatta (progetto su React 18+).
- Nessuna modifica all'interfaccia `ActionButtonProps`.
- Il `TooltipProvider/Tooltip` per la visualizzazione visiva resta invariato.

#### Ordine di esecuzione

Indipendente, può essere il primo o l'ultimo del Blocco 1.

#### Test di accettazione

1. Focalizzare con Tab un `ActionButton` disabilitato con `blockedReason` impostato.
2. NVDA annuncia: `"<label> <blockedReason>"` senza navigazione aggiuntiva.
3. NVDA non annuncia testo spazio duplicato né descrizioni vuote su pulsanti non disabilitati.
4. Il tooltip visivo continua ad apparire al hover.
5. `npx tsc --noEmit` non riporta errori.

#### Rollback

Rimuovere `useId` dall'import, rimuovere `const id = useId()`, rimuovere `aria-describedby` e lo `<span>` sr-only. Il file torna identico allo stato attuale.

---

### 1.2 TimeDisplay — aria-live su interazioniRimaste

**File:** `src/components/TimeDisplay.tsx`

#### Problema

Il contatore `interazioniRimaste` si aggiorna dopo ogni azione del giocatore ma il nodo DOM non ha `aria-live`. NVDA non notifica il cambio; l'utente deve navigare manualmente per verificare le interazioni residue.

#### Stato attuale

```tsx
// TimeDisplay.tsx — riga ~55-63
{typeof interazioniRimaste === 'number' && (
  <>
    <span className="text-border">|</span>
    <span className="flex items-center gap-1 text-muted-foreground">
      <ChatsCircle size={14} weight="fill" className="text-primary" />
      Interazioni: <strong className="text-primary">{interazioniRimaste}</strong>
    </span>
  </>
)}
```

#### Diff proposto

```tsx
// BEFORE
{typeof interazioniRimaste === 'number' && (
  <>
    <span className="text-border">|</span>
    <span className="flex items-center gap-1 text-muted-foreground">
      <ChatsCircle size={14} weight="fill" className="text-primary" />
      Interazioni: <strong className="text-primary">{interazioniRimaste}</strong>
    </span>
  </>
)}

// AFTER
{typeof interazioniRimaste === 'number' && (
  <>
    <span className="text-border">|</span>
    <span
      className="flex items-center gap-1 text-muted-foreground"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Interazioni rimanenti: ${interazioniRimaste}`}
    >
      <ChatsCircle size={14} weight="fill" className="text-primary" aria-hidden="true" />
      Interazioni: <strong className="text-primary">{interazioniRimaste}</strong>
    </span>
  </>
)}
```

#### Dipendenze

- Nessuna. Modifica additiva ad attributi ARIA.
- `ChatsCircle` riceve `aria-hidden="true"` per evitare che NVDA legga l'icona oltre all'`aria-label` del contenitore.

#### Ordine di esecuzione

Indipendente. Prima di 1.1 per semplicità.

#### Test di accettazione

1. Eseguire un'azione che consuma un'interazione.
2. NVDA annuncia automaticamente `"Interazioni rimanenti: N"` entro 1 secondo senza che l'utente sposti il focus.
3. L'annuncio non interrompe annunci assertivi già in corso (`polite`).
4. NVDA non legge il nome dell'icona `ChatsCircle`.
5. `npx tsc --noEmit` senza errori.

#### Rollback

Rimuovere `aria-live`, `aria-atomic`, `aria-label` dall'elemento `<span>` e `aria-hidden="true"` dall'icona.

---

### 1.3 MainGameTabs — Rename label tab ambigui

**File:** `src/components/MainGameTabs.tsx`

#### Problema

Il label "Attività" (value=`social`) include anche azioni come Studio e Motorino, rendendo il nome fuorviante. Il label "Controllo" (value=`status`) è un pannello impostazioni e salvataggio, non un controllo di gioco diretto.

#### Stato attuale

```tsx
// MainGameTabs.tsx — riga ~34-50
<TabsTrigger value="social" className="...">
  <Chats size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Attività</span>
  <span className="sm:hidden">Attività</span>
</TabsTrigger>
<TabsTrigger value="status" className="...">
  <ChartBar size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Controllo</span>
  <span className="sm:hidden">⚙️</span>
</TabsTrigger>
```

#### Diff proposto

```tsx
// BEFORE
  <span className="hidden sm:inline">Attività</span>
  <span className="sm:hidden">Attività</span>
// ...
  <span className="hidden sm:inline">Controllo</span>
  <span className="sm:hidden">⚙️</span>

// AFTER
  <span className="hidden sm:inline">Azioni</span>
  <span className="sm:hidden">Azioni</span>
// ...
  <span className="hidden sm:inline">Impostazioni</span>
  <span className="sm:hidden">⚙️</span>
```

**I `value` dei tab (`social`, `status`) non cambiano.**

#### Dipendenze

- Verificare che le stringhe `"Attività"` e `"Controllo"` non siano usate come chiavi di stato o routing altrove nel codebase (probabile che non lo siano, ma necessario confermare con `grep_search`).
- Nessuna dipendenza su `useKeyboardShortcuts.ts` — i shortcut usano `setActiveTab('social')`, non il label.

#### Ordine di esecuzione

Prima di 2.4 (che modificherà altri span nello stesso file).

#### Test di accettazione

1. I tab principali mostrano "Azioni" e "Impostazioni" nella barra di navigazione.
2. La navigazione Ctrl+numero e i test di stato esistenti non regrediscono.
3. NVDA annuncia `"Azioni, tab"` e `"Impostazioni, tab"` alla navigazione.
4. `npx tsc --noEmit` senza errori.
5. `npm run test` verde.

#### Rollback

Ripristinare le stringhe `"Attività"` e `"Controllo"` nei due span modificati.

---

### 1.4 index.css — Glow neon adattivo ai temi

**File:** `src/index.css`

#### Problema

Le classi `.neon-glow`, `.neon-text-glow`, `@keyframes neon-pulse` e `@keyframes glow-intense` usano il colore fisso `rgba(100, 255, 100, ...)` (verde) che non risponde al sistema di temi `oklch`. Sul tema "Dark Viola" (`--primary: oklch(0.60 0.20 300)`, viola) il glow verde è visivamente incoerente.

#### Stato attuale

```css
/* src/index.css — riga ~104-125 */
.neon-glow {
  box-shadow: 0 0 15px rgba(100, 255, 100, 0.3);
}

.neon-text-glow {
  text-shadow: 0 0 10px rgba(100, 255, 100, 0.8);
}

@keyframes neon-pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(100, 255, 100, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(100, 255, 100, 0.6);
  }
}

/* riga ~159-166 */
@keyframes glow-intense {
  0%, 100% {
    box-shadow: 0 0 15px rgba(100, 255, 100, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(100, 255, 100, 0.9), 0 0 60px rgba(100, 255, 100, 0.5);
  }
}
```

#### Diff proposto

```css
/* BEFORE */
.neon-glow {
  box-shadow: 0 0 15px rgba(100, 255, 100, 0.3);
}

.neon-text-glow {
  text-shadow: 0 0 10px rgba(100, 255, 100, 0.8);
}

@keyframes neon-pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(100, 255, 100, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(100, 255, 100, 0.6);
  }
}

/* AFTER */
.neon-glow {
  box-shadow:
    0 0 10px color-mix(in oklch, var(--primary) 40%, transparent),
    0 0 20px color-mix(in oklch, var(--primary) 20%, transparent);
}

.neon-text-glow {
  text-shadow: 0 0 10px color-mix(in oklch, var(--primary) 50%, transparent);
}

@keyframes neon-pulse {
  0%, 100% {
    box-shadow: 0 0 15px color-mix(in oklch, var(--primary) 30%, transparent);
  }
  50% {
    box-shadow: 0 0 25px color-mix(in oklch, var(--primary) 60%, transparent);
  }
}
```

```css
/* BEFORE — @keyframes glow-intense */
@keyframes glow-intense {
  0%, 100% {
    box-shadow: 0 0 15px rgba(100, 255, 100, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(100, 255, 100, 0.9), 0 0 60px rgba(100, 255, 100, 0.5);
  }
}

/* AFTER */
@keyframes glow-intense {
  0%, 100% {
    box-shadow: 0 0 15px color-mix(in oklch, var(--primary) 30%, transparent);
  }
  50% {
    box-shadow:
      0 0 40px color-mix(in oklch, var(--primary) 90%, transparent),
      0 0 60px color-mix(in oklch, var(--primary) 50%, transparent);
  }
}
```

#### Dipendenze

- `color-mix(in oklch, ...)`: supportato da Chromium 111+, Firefox 113+, Safari 16.2+. Verificare `browserslist` in `package.json`.
- La variabile `--primary` è definita in tutti e tre i blocchi tema in `src/index.css` (righe 1-68). Confermato.
- Nessuna modifica a `tailwind.config.js`.

#### Ordine di esecuzione

Primo del Blocco 1 (massima semplicità, zero dipendenze).

#### Test di accettazione

1. Tema Default: glow verde/ciano (`--primary: oklch(0.65 0.12 170)`).
2. Tema Dark (`dark`): glow viola (`--primary: oklch(0.60 0.20 300)`).
3. Tema Green: glow verde brillante (`--primary: oklch(0.60 0.18 130)`).
4. `.stat-flash` (usa `neon-pulse`) animazione visibile e coerente col tema.
5. Nessuna regressione CSS visiva su elementi con `.neon-glow` (ActionButton `hover:neon-glow`, header `neon-text-glow`).

#### Rollback

Ripristinare i quattro blocchi `rgba(100, 255, 100, ...)` originali. Nessuna logica JS coinvolta.

---

### 1.5 main.css — Pulizia contenuto corrotto

**File:** `src/main.css`

#### Problema

Il file contiene frammenti CSS spezzati, commenti tronchi e definizioni di variabili parziali dopo il marker `---break---`. È il punto di ingresso CSS importato in `main.tsx` (`import "./main.css"` a riga ~9). I tre `@import` iniziali sono critici e devono essere preservati.

#### Stato attuale

```css
/* main.css — righe 1-4 (integre, da preservare) */
@import 'tailwindcss';
@import './styles/theme.css';
@import './index.css';
  ---break---

/* Contenuto corrotto esemplificativo (righe 5-80): */
/*

  


@layer base {

  
    border-color: var(--color-gray-200, currentColor);
}

*/
  --radius-sm: calc(var(--radius) - 4px);
  
  --color-bac
  --
  --color-
  --color-p
  --color-sec
  --color-muted: var(--mut
  ...
```

#### Diff proposto

```css
/* BEFORE — file completo con contenuto corrotto */
@import 'tailwindcss';
@import './styles/theme.css';
@import './index.css';
  ---break---
/*
  [... 70+ righe di CSS corrotto ...]
*/

/* AFTER — file ripulito */
@import 'tailwindcss';
@import './styles/theme.css';
@import './index.css';

/* Contenuto precedente rimosso: frammenti CSS incompleti e corrotti.
   Stili globali, variabili tema e animazioni sono definiti in:
   - src/index.css (variabili oklch, .neon-glow, @keyframes)
   - src/styles/theme.css (sovrascritture temi aggiuntivi, se presenti) */
```

#### Dipendenze

- `main.tsx` importa `"./main.css"`: l'import deve restare attivo.
- I tre `@import` iniziali caricano Tailwind, il sistema di temi e `index.css`: nessuno di questi va rimosso.
- Verificare visivamente dopo la pulizia che font JetBrains Mono e Orbitron siano ancora caricati (definiti in `index.css` sotto `body` e headings).

#### Ordine di esecuzione

Ultimo del Blocco 1, dopo aver verificato che gli altri interventi non introducono dipendenze su `main.css`.

#### Test di accettazione

1. L'applicazione carica senza errori nella console del browser.
2. Font JetBrains Mono (body) e Orbitron (headings) sono renderizzati correttamente.
3. Il sistema di temi risponde al cambio tema.
4. Tailwind utility classes sono applicate su tutti i componenti.
5. Nessun warning CSS nella console.

#### Rollback

Ripristinare il contenuto corrotto originale (contenuto inerte — nessun effetto visivo). Oppure ripristinare da git: `git checkout src/main.css`.

---

## Blocco 2 — Modifiche moderate

### 2.1 MainGameTabs — Tab disabilitati per fase di gioco

**File:** `src/components/MainGameTabs.tsx` + `src/App.tsx`

#### Problema

Tutti i `TabsTrigger` principali sono sempre navigabili, anche quando le azioni nel tab non sono disponibili nella fase corrente. Un utente NVDA esplora strutture piene di pulsanti disabilitati senza contesto della motivazione.

#### Stato attuale

```tsx
// MainGameTabs.tsx — interfaccia props (riga ~11-18)
interface MainGameTabsProps {
  activeTab: string
  onValueChange: (value: string) => void
  statusTab: ComponentProps<typeof StatusTab>
  schoolTab: ComponentProps<typeof SchoolTab>
  characterTab: ComponentProps<typeof CharacterSheet>
  socialTab: ComponentProps<typeof SocialTab>
  cityTab: ComponentProps<typeof CityTab>
  // currentPhase NON PRESENTE
}
```

```tsx
// App.tsx — render di MainGameTabs (riga ~797-805)
<MainGameTabs
  activeTab={activeTab}
  onValueChange={setActiveTab}
  statusTab={statusTabProps}
  schoolTab={schoolTabProps}
  characterTab={characterTabProps}
  socialTab={socialTabProps}
  cityTab={cityTabProps}
  // currentPhase NON PASSATO
/>
```

```tsx
// MainGameTabs.tsx — TabsTrigger scuola (riga ~31-36)
<TabsTrigger value="school" className="data-[state=active]:bg-secondary ...">
  <GraduationCap size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Scuola</span>
  <span className="sm:hidden">Scuola</span>
</TabsTrigger>
```

#### Diff proposto

**Passo A — aggiungere `currentPhase` a `MainGameTabsProps`:**

```tsx
// BEFORE
import type { ComponentProps } from 'react'
import { Buildings, ChartBar, Chats, GraduationCap, IdentificationCard } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CharacterSheet } from '@/components/CharacterSheet'
import { CityTab } from '@/components/tabs/CityTab'
import { SchoolTab } from '@/components/tabs/SchoolTab'
import { SocialTab } from '@/components/tabs/SocialTab'
import { StatusTab } from '@/components/tabs/StatusTab'

interface MainGameTabsProps {
  activeTab: string
  onValueChange: (value: string) => void
  statusTab: ComponentProps<typeof StatusTab>
  schoolTab: ComponentProps<typeof SchoolTab>
  characterTab: ComponentProps<typeof CharacterSheet>
  socialTab: ComponentProps<typeof SocialTab>
  cityTab: ComponentProps<typeof CityTab>
}

// AFTER
import type { ComponentProps } from 'react'
import { Buildings, ChartBar, Chats, GraduationCap, IdentificationCard } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CharacterSheet } from '@/components/CharacterSheet'
import { CityTab } from '@/components/tabs/CityTab'
import { SchoolTab } from '@/components/tabs/SchoolTab'
import { SocialTab } from '@/components/tabs/SocialTab'
import { StatusTab } from '@/components/tabs/StatusTab'
import type { DayPhase } from '@/lib/types'

interface MainGameTabsProps {
  activeTab: string
  onValueChange: (value: string) => void
  currentPhase: DayPhase | null | undefined  // NUOVO
  statusTab: ComponentProps<typeof StatusTab>
  schoolTab: ComponentProps<typeof SchoolTab>
  characterTab: ComponentProps<typeof CharacterSheet>
  socialTab: ComponentProps<typeof SocialTab>
  cityTab: ComponentProps<typeof CityTab>
}
```

**Passo B — logica disponibilità tab nel corpo del componente:**

```tsx
// BEFORE — funzione MainGameTabs senza logica di fase
export function MainGameTabs({
  activeTab,
  onValueChange,
  statusTab,
  schoolTab,
  characterTab,
  socialTab,
  cityTab,
}: MainGameTabsProps) {
  return (

// AFTER — aggiungere logica di disponibilità e redirect
export function MainGameTabs({
  activeTab,
  onValueChange,
  currentPhase,
  statusTab,
  schoolTab,
  characterTab,
  socialTab,
  cityTab,
}: MainGameTabsProps) {
  // DayPhase reale: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
  const isSchoolAvailable = currentPhase === 'mattina'
  const isCityAvailable = currentPhase === 'pomeriggio' || currentPhase === 'sera'
  const isSocialAvailable =
    currentPhase === 'pomeriggio' ||
    currentPhase === 'sera' ||
    currentPhase === 'notte'
  // character e status sempre disponibili

  // Redirect automatico se il tab attivo diventa disabilitato
  React.useEffect(() => {
    if (activeTab === 'school' && !isSchoolAvailable) {
      onValueChange('social')
    } else if (activeTab === 'city' && !isCityAvailable) {
      onValueChange('social')
    }
  }, [activeTab, isSchoolAvailable, isCityAvailable, onValueChange])

  return (
```

**Passo C — applicare `disabled` e `aria-label` ai TabsTrigger:**

```tsx
// BEFORE — tab Scuola
<TabsTrigger value="school" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
  <GraduationCap size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Scuola</span>
  <span className="sm:hidden">Scuola</span>
</TabsTrigger>

// AFTER — tab Scuola
<TabsTrigger
  value="school"
  disabled={!isSchoolAvailable}
  aria-label={!isSchoolAvailable ? 'Scuola: disponibile solo al mattino' : 'Scuola'}
  className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
>
  <GraduationCap size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline" aria-hidden="true">Scuola</span>
  <span className="sm:hidden" aria-hidden="true">Scuola</span>
</TabsTrigger>
```

```tsx
// BEFORE — tab Città
<TabsTrigger value="city" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
  <Buildings size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Città</span>
  <span className="sm:hidden">Roma</span>
</TabsTrigger>

// AFTER — tab Città
<TabsTrigger
  value="city"
  disabled={!isCityAvailable}
  aria-label={!isCityAvailable ? 'Città: disponibile dal pomeriggio' : 'Città'}
  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
>
  <Buildings size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline" aria-hidden="true">Città</span>
  <span className="sm:hidden" aria-hidden="true">Roma</span>
</TabsTrigger>
```

```tsx
// BEFORE — tab Azioni (dopo rename da 1.3)
<TabsTrigger value="social" className="...">
  ...
  <span className="hidden sm:inline">Azioni</span>
  <span className="sm:hidden">Azioni</span>
</TabsTrigger>

// AFTER — tab Azioni (sempre disponibile, ma con aria-label per coerenza)
<TabsTrigger
  value="social"
  disabled={!isSocialAvailable}
  aria-label={!isSocialAvailable ? 'Azioni: non disponibili di notte' : 'Azioni'}
  className="..."
>
  ...
  <span className="hidden sm:inline" aria-hidden="true">Azioni</span>
  <span className="sm:hidden" aria-hidden="true">Azioni</span>
</TabsTrigger>
```

**Passo D — passare `currentPhase` da `App.tsx`:**

```tsx
// BEFORE — App.tsx render MainGameTabs
<MainGameTabs
  activeTab={activeTab}
  onValueChange={setActiveTab}
  statusTab={statusTabProps}
  schoolTab={schoolTabProps}
  characterTab={characterTabProps}
  socialTab={socialTabProps}
  cityTab={cityTabProps}
/>

// AFTER
<MainGameTabs
  activeTab={activeTab}
  onValueChange={setActiveTab}
  currentPhase={currentPhase}
  statusTab={statusTabProps}
  schoolTab={schoolTabProps}
  characterTab={characterTabProps}
  socialTab={socialTabProps}
  cityTab={cityTabProps}
/>
```

#### Dipendenze

- `DayPhase` da `src/lib/types.ts` — già importato in `App.tsx`, aggiungere solo in `MainGameTabs.tsx`.
- `currentPhase` in `App.tsx` è il return di `useGameTime()` (riga ~188). È già passato ad `AppHeader`.
- Dipende da 1.3 (rename "Azioni"/"Impostazioni") se si vuole consistenza nei label.
- Aggiungere `import React from 'react'` in `MainGameTabs.tsx` se non presente (per `React.useEffect`).

#### Ordine di esecuzione

Dopo 1.3. È il più complesso del Blocco 2; eseguire per ultimo nel blocco.

#### Test di accettazione

1. Fase mattina: tab Scuola abilitato; Città disabilitato con `aria-label` "disponibile dal pomeriggio".
2. Fase pomeriggio: tab Città abilitato; tab Scuola disabilitato con `aria-label` "disponibile solo al mattino".
3. Cambio fase da mattina a pomeriggio con tab Scuola attivo: redirect automatico al tab Azioni.
4. NVDA legge l'`aria-label` di motivazione sui tab disabilitati senza navigazione aggiuntiva.
5. `character` e `status` sempre navigabili in tutte le fasi.
6. `npx tsc --noEmit` e `npm run test` verdi.

#### Rollback

Rimuovere `currentPhase` da `MainGameTabsProps` e dalla destructuring, rimuovere le variabili `isSchoolAvailable`/`isCityAvailable`/`isSocialAvailable`, rimuovere `React.useEffect`, rimuovere `disabled` e `aria-label` dai `TabsTrigger`, rimuovere il prop `currentPhase` dal render in `App.tsx`.

---

### 2.2 AppHeader — morningChoicePending con link diretto

**File:** `src/components/AppHeader.tsx` + `src/App.tsx` + `src/hooks/useKeyboardShortcuts.ts` + `src/components/KeyboardShortcutsDialog.tsx`

#### Problema

Il banner `morningChoicePending` notifica l'utente con `role="alert"` e `animate-pulse` ma non offre un percorso diretto all'azione richiesta. L'utente deve navigare manualmente verso il tab Scuola. Per NVDA questo significa esplorazione libera senza orientamento.

#### Stato attuale

```tsx
// AppHeader.tsx — interfaccia (riga ~7-21)
interface AppHeaderProps {
  playerProfile: PlayerProfile | null
  gameTime: GameTime
  currentPhase: DayPhase | null | undefined
  dayType: DayType | null | undefined
  phaseActionsRemaining: number
  interazioniRimaste: number
  isSchoolMorningSequenceInProgress: boolean
  morningChoicePending: boolean
  onOpenKeyboardHelp: () => void
  handleRiposa: () => void
  handleDormi: () => void
  handleAdvancePhaseGuarded: () => void
  // onGoToSchool NON PRESENTE
}
```

```tsx
// AppHeader.tsx — banner morningChoicePending (riga ~93-104)
{morningChoicePending && (
  <div
    role="alert"
    className="mb-4 p-4 bg-destructive/20 border-2 border-destructive rounded-lg text-center animate-pulse"
  >
    <p className="text-destructive font-bold text-lg">
      🏫 È mattina! Prima devi scegliere: vai a scuola o la marini?
    </p>
    <p className="text-sm text-muted-foreground mt-1">
      Vai al tab <strong>Scuola → Voti</strong> e fai la tua scelta per sbloccare tutte le altre attività.
    </p>
  </div>
)}
```

#### Diff proposto

**Passo A — aggiungere `onGoToSchool` a `AppHeaderProps`:**

```tsx
// BEFORE — AppHeaderProps
interface AppHeaderProps {
  ...
  handleAdvancePhaseGuarded: () => void
}

// AFTER
interface AppHeaderProps {
  ...
  handleAdvancePhaseGuarded: () => void
  onGoToSchool: () => void  // NUOVO
}
```

```tsx
// BEFORE — destructuring
export function AppHeader({
  ...
  handleAdvancePhaseGuarded,
}: AppHeaderProps) {

// AFTER
export function AppHeader({
  ...
  handleAdvancePhaseGuarded,
  onGoToSchool,
}: AppHeaderProps) {
```

**Passo B — aggiungere pulsante nel banner:**

```tsx
// BEFORE
{morningChoicePending && (
  <div
    role="alert"
    className="mb-4 p-4 bg-destructive/20 border-2 border-destructive rounded-lg text-center animate-pulse"
  >
    <p className="text-destructive font-bold text-lg">
      🏫 È mattina! Prima devi scegliere: vai a scuola o la marini?
    </p>
    <p className="text-sm text-muted-foreground mt-1">
      Vai al tab <strong>Scuola → Voti</strong> e fai la tua scelta per sbloccare tutte le altre attività.
    </p>
  </div>
)}

// AFTER
{morningChoicePending && (
  <div
    role="alert"
    className="mb-4 p-4 bg-destructive/20 border-2 border-destructive rounded-lg text-center animate-pulse"
  >
    <p className="text-destructive font-bold text-lg">
      🏫 È mattina! Prima devi scegliere: vai a scuola o la marini?
    </p>
    <p className="text-sm text-muted-foreground mt-1">
      Vai al tab <strong>Scuola → Voti</strong> e fai la tua scelta per sbloccare tutte le altre attività.
    </p>
    <Button
      variant="outline"
      size="sm"
      onClick={onGoToSchool}
      className="mt-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-[3px]"
      aria-label="Vai al tab Scuola per fare la scelta mattutina"
    >
      Vai a Scuola ora
    </Button>
  </div>
)}
```

**Passo C — passare la callback da `App.tsx`:**

```tsx
// BEFORE — App.tsx render AppHeader
<AppHeader
  playerProfile={playerProfile ?? null}
  gameTime={gameTime}
  currentPhase={currentPhase}
  dayType={dayType}
  phaseActionsRemaining={phaseActionsRemaining ?? 0}
  interazioniRimaste={interazioniRimaste ?? 0}
  isSchoolMorningSequenceInProgress={isSchoolMorningSequenceInProgress}
  morningChoicePending={morningChoicePending}
  onOpenKeyboardHelp={() => setShowKeyboardHelp(true)}
  handleRiposa={handleRiposa}
  handleDormi={handleDormi}
  handleAdvancePhaseGuarded={handleAdvancePhaseGuarded}
/>

// AFTER
<AppHeader
  playerProfile={playerProfile ?? null}
  gameTime={gameTime}
  currentPhase={currentPhase}
  dayType={dayType}
  phaseActionsRemaining={phaseActionsRemaining ?? 0}
  interazioniRimaste={interazioniRimaste ?? 0}
  isSchoolMorningSequenceInProgress={isSchoolMorningSequenceInProgress}
  morningChoicePending={morningChoicePending}
  onOpenKeyboardHelp={() => setShowKeyboardHelp(true)}
  onGoToSchool={() => setActiveTab('school')}
  handleRiposa={handleRiposa}
  handleDormi={handleDormi}
  handleAdvancePhaseGuarded={handleAdvancePhaseGuarded}
/>
```

**Passo D — shortcut `Alt+S` in `useKeyboardShortcuts.ts`:**

```ts
// BEFORE — nell'useEffect handleKeyPress, blocco altKey
if (e.altKey && key === 'h') {
  e.preventDefault()
  setShowKeyboardHelp(true)
  announce('Aiuto scorciatoie da tastiera aperto')
  return
}

// AFTER — aggiungere dopo il blocco Alt+H
if (e.altKey && key === 'h') {
  e.preventDefault()
  setShowKeyboardHelp(true)
  announce('Aiuto scorciatoie da tastiera aperto')
  return
}
if (e.altKey && key === 's') {
  e.preventDefault()
  setActiveTab('school')
  announce('Tab Scuola aperto')
  return
}
```

**Passo E — documentare `Alt+S` in `KeyboardShortcutsDialog.tsx`:**

```tsx
// BEFORE — categoria 'Generale'
{ category: 'Generale', shortcuts: [
  { keys: 'Ctrl + N', action: 'Avanza alla prossima fase della giornata' },
  { keys: 'Ctrl + R', action: 'Reset gioco' },
  { keys: 'Alt + H', action: 'Mostra questo aiuto' },
  { keys: 'Esc', action: 'Chiudi dialogo senza consumare azioni' },
  { keys: 'Enter', action: 'Conferma selezione (nei pannelli)' }
]},

// AFTER
{ category: 'Generale', shortcuts: [
  { keys: 'Ctrl + N', action: 'Avanza alla prossima fase della giornata' },
  { keys: 'Ctrl + R', action: 'Reset gioco' },
  { keys: 'Alt + H', action: 'Mostra questo aiuto' },
  { keys: 'Alt + S', action: 'Vai al tab Scuola (scelta mattutina)' },
  { keys: 'Esc', action: 'Chiudi dialogo senza consumare azioni' },
  { keys: 'Enter', action: 'Conferma selezione (nei pannelli)' }
]},
```

#### Dipendenze

- `Button` è già importato in `AppHeader.tsx` — nessun import aggiuntivo.
- `setActiveTab` è già disponibile in `App.tsx` come `useState` locale. NON va passato ad `AppHeader`.
- `Alt+S` non ha conflitti: `Ctrl+S` è già `handleShoppingMall`, ma `Alt+S` è libero.
- Dipende logicamente da 2.1 (tab Scuola abilitato di mattina).

#### Ordine di esecuzione

Dopo 2.1, prima di 2.3 e 2.4.

#### Test di accettazione

1. Con `morningChoicePending=true`: il banner mostra il pulsante "Vai a Scuola ora".
2. Click sul pulsante: `activeTab` diventa `'school'`, il tab Scuola è focussato.
3. `Alt+S`: `activeTab` diventa `'school'` e NVDA annuncia `"Tab Scuola aperto"`.
4. `KeyboardShortcutsDialog` mostra `"Alt + S"` nella sezione Generale.
5. `npx tsc --noEmit` senza errori.

#### Rollback

Rimuovere `onGoToSchool` da `AppHeaderProps` e destructuring, rimuovere il `Button` nel banner, rimuovere la prop `onGoToSchool` dal render in `App.tsx`, rimuovere il blocco `Alt+S` da `useKeyboardShortcuts.ts`, rimuovere la riga da `KeyboardShortcutsDialog.tsx`.

---

### 2.3 SchoolMorningPanel — Colori categoria adattivi al tema

**File:** `src/components/SchoolMorningPanel.tsx`

#### Problema

`categoryColor` usa classi Tailwind con colori fissi (`bg-blue-100 text-blue-800`, ecc.) che non fanno parte del sistema di temi. Su temi scuri il contrasto è insufficiente e la palette verde/blu/arancio è incoerente con i token `oklch` del progetto.

#### Stato attuale

```tsx
// SchoolMorningPanel.tsx — riga ~47-55
// 7 categorie reali del tipo MorningEventCategory in src/lib/types.ts
const categoryColor: Record<MorningEventCategory, string> = {
  didattica: 'bg-blue-100 text-blue-800',
  sociale: 'bg-green-100 text-green-800',
  istituto: 'bg-orange-100 text-orange-800',
  strada: 'bg-gray-100 text-gray-800',
  casa: 'bg-yellow-100 text-yellow-800',
  citta: 'bg-purple-100 text-purple-800',
  amici: 'bg-pink-100 text-pink-800',
}
```

#### Diff proposto

```tsx
// BEFORE
const categoryColor: Record<MorningEventCategory, string> = {
  didattica: 'bg-blue-100 text-blue-800',
  sociale: 'bg-green-100 text-green-800',
  istituto: 'bg-orange-100 text-orange-800',
  strada: 'bg-gray-100 text-gray-800',
  casa: 'bg-yellow-100 text-yellow-800',
  citta: 'bg-purple-100 text-purple-800',
  amici: 'bg-pink-100 text-pink-800',
}

// AFTER — token adattativi al tema, con border per WCAG 1.4.1
const categoryColor: Record<MorningEventCategory, string> = {
  didattica: 'bg-primary/10 text-primary border border-primary/30',
  sociale:   'bg-secondary/10 text-secondary border border-secondary/30',
  istituto:  'bg-accent/10 text-accent border border-accent/30',
  strada:    'bg-muted text-muted-foreground',
  casa:      'bg-secondary/10 text-secondary border border-secondary/30',
  citta:     'bg-accent/10 text-accent border border-accent/30',
  amici:     'bg-primary/10 text-primary border border-primary/30',
}
```

#### Dipendenze

- Token `primary`, `secondary`, `accent`, `muted`, `muted-foreground` definiti in tutti e tre i temi in `src/index.css` — confermato.
- Il `border` aggiuntivo garantisce distinzione non solo cromatica (WCAG 1.4.1).
- Nessuna modifica all'interfaccia del componente o ai tipi.

#### Ordine di esecuzione

Prima di 2.4 (non dipendente, ma più semplice).

#### Test di accettazione

1. Tema Default: badge categoria con colore verde/ciano primario su sfondo scuro — contrasto visivo WCAG AA verificato a occhio.
2. Tema Dark: badge viola — contrasto verificato.
3. Tema Green: badge verde brillante — contrasto verificato.
4. Il border visivo è presente e distingue le badge anche in assenza di colore (test in modalità contrasto elevato Windows).
5. `npm run test` verde (nessun test sul colore, ma snapshot se presenti).

#### Rollback

Ripristinare i 7 valori originali in `categoryColor`. Modifica CSS/Tailwind pura.

---

### 2.4 MainGameTabs — sr-only su emoji decorative mobile

**File:** `src/components/MainGameTabs.tsx`

#### Problema

I `TabsTrigger` per `character` e `status` usano emoji come testo nei dispositivi mobile (`sm:hidden`) senza alternativa testuale esplicita. NVDA legge le emoji con il loro nome Unicode completo (es. "uomo in busto silhouette"), incoerente con il contesto.

I tab con questo pattern nel codebase reale sono **solo due**: `character` (`👤`) e `status` (`⚙️`). Gli altri tab usano testo sia nel `hidden sm:inline` che nell'`sm:hidden`.

#### Stato attuale

```tsx
// MainGameTabs.tsx — TabsTrigger character (riga ~37-42)
<TabsTrigger value="character" className="...">
  <IdentificationCard size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Personaggio</span>
  <span className="sm:hidden">👤</span>
</TabsTrigger>

// MainGameTabs.tsx — TabsTrigger status (riga ~47-52)
<TabsTrigger value="status" className="...">
  <ChartBar size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Impostazioni</span>  {/* dopo rename 1.3 */}
  <span className="sm:hidden">⚙️</span>
</TabsTrigger>
```

#### Diff proposto

```tsx
// BEFORE — TabsTrigger character
<TabsTrigger value="character" className="...">
  <IdentificationCard size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Personaggio</span>
  <span className="sm:hidden">👤</span>
</TabsTrigger>

// AFTER — aggiungere aria-label al trigger, nascondere contenuti agli SR
<TabsTrigger
  value="character"
  aria-label="Personaggio"
  className="..."
>
  <IdentificationCard size={20} className="mr-2" weight="fill" aria-hidden="true" />
  <span className="hidden sm:inline" aria-hidden="true">Personaggio</span>
  <span className="sm:hidden" aria-hidden="true">👤</span>
</TabsTrigger>
```

```tsx
// BEFORE — TabsTrigger status
<TabsTrigger value="status" className="...">
  <ChartBar size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Impostazioni</span>
  <span className="sm:hidden">⚙️</span>
</TabsTrigger>

// AFTER
<TabsTrigger
  value="status"
  aria-label="Impostazioni"
  className="..."
>
  <ChartBar size={20} className="mr-2" weight="fill" aria-hidden="true" />
  <span className="hidden sm:inline" aria-hidden="true">Impostazioni</span>
  <span className="sm:hidden" aria-hidden="true">⚙️</span>
</TabsTrigger>
```

**Nota:** si usa `aria-label` direttamente sul `TabsTrigger` anziché `<span className="sr-only">` — pattern più pulito per Radix UI `TabsTrigger` che espone già il ruolo `tab`.

#### Dipendenze

- Dipende da 1.3 (i label aggiornati "Impostazioni" devono essere coerenti con l'`aria-label`).
- Dipende da 2.1 (se 2.1 aggiunge `aria-label` contestuale sui trigger, evitare sovrapposizioni — la prop `disabled` in 2.1 usa `aria-label` condizionale; in 2.4 si può usare `aria-label` statico quando non disabilitato, oppure consolidare i due aria-label in un unico diff combinato).

#### Ordine di esecuzione

Dopo 1.3 e 2.1. Può essere l'ultimo del Blocco 2.

#### Test di accettazione

1. Su viewport mobile (< 640px): NVDA annuncia `"Personaggio, tab"` e `"Impostazioni, tab"` (non il nome Unicode dell'emoji).
2. Su viewport desktop: NVDA annuncia il testo visibile dei tab coerentemente.
3. Gli altri tab (school, city, social) non sono modificati e funzionano invariati.
4. `npx tsc --noEmit` senza errori.

#### Rollback

Rimuovere `aria-label` dal `TabsTrigger` e `aria-hidden="true"` dalle icone e span interni.

---

## Blocco 3 — Analisi preventiva

> I tre interventi seguenti **non devono essere implementati** senza completare l'analisi preventiva descritta. Nessun diff di codice è incluso intenzionalmente.

---

### 3.1 SchoolTab — Riduzione tab annidati

**File:** `src/components/tabs/SchoolTab.tsx`

**Categoria:** Refactor strutturale, alto rischio, richede piano separato.

#### Domande aperte

1. Quanti sotto-tab ha `SchoolTab` realmente? Dal codice: `home`, `voti`, `verifiche`, `amici`, `dashboard` (5 sub-tab interni con icone `GraduationCap`, `GraduationCap`, `Brain`, `UserCircle`, `Trophy`). Confermare se il quinto è `dashboard` o un altro valore.
2. Quali sotto-tab sono condizionali rispetto a `morningChoicePending`, `hasActiveSchoolSequence`, `marinatoOggi`?
3. `SchoolHomePanel` e il pannello voti condividono stato? Possono essere resi in pagine separate (scroll) invece di tab?
4. Qual è l'impatto di `hasActiveSchoolSequence` (calcolato localmente in `SchoolTab`) sulla visibilità dei sotto-tab?
5. Come si comporta `defaultValue="home"` quando l'utente torna al tab Scuola dopo un cambio fase?

#### Punti da investigare prima dell'implementazione

- Mappare la macchina a stati completa: per ogni combinazione `(dayType, currentPhase, isSchoolPeriod, morningChoicePending, marinatoOggi, hasActiveSchoolSequence)` documentare quali sotto-pannelli sono visibili/attivi.
- Verificare se `SchoolBreakPanel` e `SchoolMorningPanel` (già presenti come componenti lazy/diretti in `SchoolTab`) si sovrappongono visivamente ai 5 sotto-tab o li sostituiscono.
- Valutare UX alternativa: accordion verticale invece di tab annidati per `home` + `voti`; mantenere tab per `verifiche`, `amici`, `dashboard`.
- Verificare compatibilità NVDA con tab annidati nel pattern Radix UI — se il comportamento di navigazione `ArrowLeft`/`ArrowRight` è confine a ciascun livello di tab, il problema SR potrebbe essere meno grave di quanto stimato.

#### Criterio di uscita dall'analisi

Prima di aprire una PR di implementazione: diagramma di flusso degli stati `SchoolTab` approvato, mockup (anche testuale) del layout alternativo documentato, test di regressione SR definiti.

---

### 3.2 DailyControls — Replica contestuale

**File:** `src/components/DailyControls.tsx`, `src/components/AppHeader.tsx`

**Categoria:** Refactor layout, rischio medio.

#### Domande aperte

1. `DailyControls` riceve `currentPhase`, `dayType`, `phaseActionsRemaining`, `isSchoolMorningSequenceInProgress`, `isSchoolPeriod` da `AppHeader`. Se replicato in più tab, queste prop devono essere propagate anche ai tab — aumenta coupling o si estrae uno shared hook?
2. La logica di abilitazione/disabilitazione dei pulsanti (es. "Riposa" solo se non è notte) è nel componente o nell'hook `useGameTime`? Va estratta prima della replica per evitare duplicazioni.
3. Il footer replicato deve essere identico all'originale o ridotto (es. solo "Avanza fase" senza "Riposa")?
4. Come gestire il caso in cui l'utente interagisce col footer replicato durante l'animazione di transizione fase (debounce necessario)?

#### Punti da investigare

- Leggere il codice completo di `DailyControls.tsx` e identificare dove risiede la logica di guard (es. `handleAdvancePhaseGuarded` è in `App.tsx`).
- Valutare se creare un `useDailyControlsState()` hook che restituisce lo stato calcolato (abilitazione pulsanti, label contestuali) senza dipendenza dal componente di rendering.
- Stimare se la replica aumenta il bundle size in modo significativo (componente pesante con motion?).

---

### 3.3 UI globale — Border-radius e uppercase

**File:** `tailwind.config.js`, vari componenti

**Categoria:** Modifica globale di stile, rischio medio-alto.

#### Domande aperte

1. Cambiare `--radius: 0.25rem` in `0.5rem` in `src/index.css` è sufficiente, oppure va modificato anche `tailwind.config.js` per il mapping `borderRadius`?
2. Quali componenti Shadcn/ui usano `--radius` direttamente (via `var(--radius)` in CSS) vs classi Tailwind `rounded-*`? Una modifica a `--radius` copre entrambi i casi?
3. Esiste già un test visuale (snapshot) dei componenti che verrebbe invalidato?
4. Per l'uppercase: quante occorrenze di `uppercase tracking-wider` esistono nel codebase? Quante sono su label di sezione vs badge/shortcut (dove uppercase è appropriato)?

#### Punti da investigare

- `grep_search` di `uppercase` nei file `.tsx` e `.css` per quantificare l'impatto.
- Verificare se Shadcn/ui usa `--radius` anche per `border-radius` nei componenti Dialog, Sheet, Popover — una modifica globale deve essere testata su tutti questi.
- Definire la soglia di "testo grande" (WCAG 3:1) vs "testo normale" (4.5:1) per guidare la scelta di `capitalize` vs `uppercase` case per case.

---

## Ordine di implementazione consigliato

```
Blocco 1 — Sessione singola (stima totale < 1h)
  1. 1.4  index.css glow adattivo        — 5 min, zero rischio
  2. 1.3  MainGameTabs rename label      — 5 min, zero rischio
  3. 1.2  TimeDisplay aria-live          — 10 min, zero rischio
  4. 1.1  ActionButton sr-only           — 20 min, basso rischio
  5. 1.5  main.css pulizia               — 10 min, zero rischio (dopo verifica import)

Blocco 2 — Sessione separata (stima totale 2-4h)
  6. 2.3  SchoolMorningPanel colori tema — 15 min, basso rischio
  7. 1.3→2.4  MainGameTabs sr-only emoji — 20 min, zero rischio
  8. 2.2  AppHeader onGoToSchool         — 45 min, basso-medio rischio
  9. 2.1  MainGameTabs tab contestuali   — 90 min, medio rischio (test edge case fase)

Blocco 3 — Pianificazione separata (non stimabile senza analisi)
  Completare analisi macchina a stati SchoolTab
  Estrarre useDailyControlsState hook
  Test visivo border-radius su tutti i temi
```

---

## Criteri gate pre-merge

### Blocco 1

| # | Criterio | Verifica |
|---|----------|---------|
| B1-1 | NVDA annuncia `blockedReason` su `ActionButton` disabilitato senza navigazione aggiuntiva | Manuale NVDA |
| B1-2 | NVDA annuncia cambio `interazioniRimaste` dopo ogni azione senza spostamento focus | Manuale NVDA |
| B1-3 | `.neon-glow` corrisponde al colore primario del tema attivo su tutti e 3 i temi | Visuale |
| B1-4 | Tab "Azioni" e "Impostazioni" visibili; `value` tab invariati; `npm run test` verde | Automatico |
| B1-5 | `main.css`: font JetBrains Mono e Orbitron caricati; nessun errore console CSS | Browser DevTools |
| B1-6 | `npx tsc --noEmit` senza errori di tipo | Automatico |

### Blocco 2

| # | Criterio | Verifica |
|---|----------|---------|
| B2-1 | Tab disabilitati annunciati da NVDA con motivazione leggibile | Manuale NVDA |
| B2-2 | Redirect automatico al tab Azioni se tab attivo disabilitato per cambio fase | Manuale |
| B2-3 | Banner `morningChoicePending` include pulsante funzionante verso tab Scuola | Manuale |
| B2-4 | `Alt+S` porta al tab Scuola e NVDA annuncia la navigazione | Manuale NVDA |
| B2-5 | `KeyboardShortcutsDialog` mostra `Alt+S` nella sezione Generale | Visuale |
| B2-6 | Badge categoria in `SchoolMorningPanel` hanno contrasto adeguato su tutti e 3 i temi | Visuale WCAG |
| B2-7 | Tab `character` e `status`: NVDA legge "Personaggio" e "Impostazioni", non nome emoji | Manuale NVDA |
| B2-8 | `npx tsc --noEmit` e `npm run test` verdi | Automatico |

---

*Piano tecnico generato il 17/04/2026 — basato su lettura diretta dei file sorgente.*  
*Prima di aprire una PR, validare con `npx tsc --noEmit` e `npm run test` da root di workspace.*
