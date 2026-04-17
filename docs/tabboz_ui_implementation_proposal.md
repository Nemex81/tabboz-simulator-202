# Tabboz Simulator 2026 — Proposta Implementativa UI/Accessibilità

**Repository:** `Nemex81/tabboz-simulator-202`  
**Data:** 17 aprile 2026  
**Stato documento:** Validato — pronto per pianificazione tecnica  
**Autore:** Analisi combinata — report Copilot + revisione progettista

---

## Executive Summary

Il presente documento definisce un piano implementativo in tre blocchi per risolvere i problemi identificati nell'analisi congiunta dell'interfaccia utente e dell'accessibilità del progetto Tabboz Simulator 2026. La base accessibile è già solida (ARIA, live regions, keyboard shortcuts). Le criticità riguardano principalmente: tooltip dei pulsanti disabilitati non annunciati da screen reader, coerenza visiva del sistema di temi, e assenza di feedback contestuale per la navigazione tra tab in relazione alla fase di gioco attiva.

**Impatto stimato per blocco:**

| Blocco | Modifiche | Complessità | Impatto UX | Impatto SR |
|--------|-----------|-------------|------------|------------|
| Blocco 1 | 5 interventi | Bassa (< 1h) | Alto | Critico |
| Blocco 2 | 4 interventi | Media (2-4h) | Alto | Alto |
| Blocco 3 | 3 interventi | Alta (pianificare) | Medio | Basso |

---

## Contesto tecnico

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS v3 + variabili CSS `oklch` (3 temi: Default, Dark Viola, Dark Ciano)
- **Componenti UI:** Shadcn/ui (Button, Tabs, Card, Dialog, Badge, Progress, ScrollArea)
- **Icone:** `@phosphor-icons/react` con `weight="fill"` e `aria-hidden="true"` sulle decorative
- **Screen reader target:** NVDA su Windows 11
- **Accessibilità esistente:** `aria-live`, `role="alert"`, `role="region"`, `role="progressbar"`, focus rings, keyboard shortcuts (`Alt+H`)

---

## Blocco 1 — Modifiche immediate (nessun refactor strutturale)

### 1.1 ActionButton — Tooltip SR su pulsanti disabilitati

**File:** `src/components/ActionButton.tsx`

**Problema:** Quando un `ActionButton` è disabilitato, il motivo del blocco (`blockedReason`) è disponibile solo via hover tooltip (componente `TooltipProvider`). NVDA non annuncia il tooltip su elementi disabilitati, rendendo il pulsante un vicolo cieco per l'utente non vedente.

**Soluzione:** Aggiungere uno `<span className="sr-only">` sempre presente nel DOM quando il pulsante è disabilitato e `blockedReason` è definito. Questo approccio è coerente con il pattern già usato in `DiaryPanel.tsx`.

**Modifica da applicare:**

```tsx
// Prima (stato attuale)
<Button
  disabled={disabled}
  aria-label={ariaLabel}
  onClick={onClick}
  className={cn(buttonClasses)}
>
  {/* contenuto pulsante */}
</Button>

// Dopo (modifica proposta)
<Button
  disabled={disabled}
  aria-label={ariaLabel}
  aria-describedby={disabled && blockedReason ? `${id}-blocked-reason` : undefined}
  onClick={onClick}
  className={cn(buttonClasses)}
>
  {/* contenuto pulsante */}
  {disabled && blockedReason && (
    <span
      id={`${id}-blocked-reason`}
      className="sr-only"
    >
      {blockedReason}
    </span>
  )}
</Button>
```

**Note per Copilot:**
- Il componente `ActionButton` non ha un prop `id`. Aggiungere `const id = useId()` all'interno del corpo del componente (React 18+, import da `react`). Non esporre un prop `id` esterno.
- Il `TooltipProvider` esistente per la visualizzazione visiva del tooltip resta invariato.
- Il `<span className="sr-only">` deve essere dentro il `<Button>` per garantire che il contenuto venga letto da NVDA quando il focus è sul pulsante.

**Rischio:** Nessuno. Modifica additiva, zero breaking changes.

---

### 1.2 TimeDisplay — `aria-live` su contatore interazioni rimanenti

**File:** `src/components/TimeDisplay.tsx`

**Problema:** Il valore `interazioniRimaste` (o `phaseActionsRemaining`) si aggiorna dopo ogni azione del giocatore ma non è avvolto in un elemento con `aria-live`. NVDA non notifica il cambiamento, costringendo l'utente a navigare manualmente per verificare lo stato.

**Soluzione:** Avvolgere il valore numerico del contatore in un elemento con `aria-live="polite"` e `aria-atomic="true"`.

**Modifica da applicare:**

```tsx
// Prima (stato attuale — esempio struttura)
<span className="text-sm font-mono">
  {interazioniRimaste}
</span>

// Dopo (modifica proposta)
<span
  aria-live="polite"
  aria-atomic="true"
  aria-label={`Interazioni rimanenti: ${interazioniRimaste}`}
  className="text-sm font-mono"
>
  {interazioniRimaste}
</span>
```

**Note per Copilot:**
- Usare `aria-live="polite"` (non `assertive`) per evitare interruzione di annunci già in corso.
- `aria-atomic="true"` garantisce che NVDA legga l'intero contenuto dell'elemento, non solo le parti modificate.
- Verificare la struttura attuale del componente per identificare il nodo corretto su cui applicare l'attributo.

**Rischio:** Nessuno. Modifica additiva.

---

### 1.3 MainGameTabs — Rename tab ambigui

**File:** `src/components/MainGameTabs.tsx` (o dove definiti i label dei `TabsTrigger` principali)

**Problema:** Il tab "Attività" contiene anche Studio e Motorino, rendendo il nome fuorviante. Il tab "Controllo" è un pannello impostazioni, non un controllo di gioco — un utente che cerca "salva" o "reset" non intuisce di doverlo aprire.

**Modifica da applicare:**

```tsx
// Prima
<TabsTrigger value="attivita">Attività</TabsTrigger>
<TabsTrigger value="controllo">Controllo</TabsTrigger>

// Dopo
<TabsTrigger value="attivita">Azioni</TabsTrigger>
<TabsTrigger value="controllo">Impostazioni</TabsTrigger>
```

**Note per Copilot:**
- Verificare che le stringhe `"Attività"` e `"Controllo"` non siano usate come identificatori di stato (`value` del tab) ma solo come label visualizzate. Il `value` del tab non deve cambiare per evitare rotture nella logica di stato.
- Aggiornare anche gli `aria-label` corrispondenti se presenti.
- Se i label sono definiti tramite costanti o file di configurazione/localizzazione separati, modificare lì.

**Rischio:** Basso. Solo stringhe UI, nessuna logica di stato coinvolta se il `value` rimane invariato.

---

### 1.4 index.css — Glow neon adattivo ai temi

**File:** `src/index.css`

**Problema:** Le classi `.neon-glow` e `.neon-text-glow` usano colore verde fisso `rgba(100, 255, 100, ...)` che non risponde al sistema di temi `oklch`. Sul tema "Dark Viola" il glow verde è visivamente incoerente.

**Modifica da applicare:**

```css
/* Prima (stato attuale) */
.neon-glow {
  box-shadow: 0 0 10px rgba(100, 255, 100, 0.3), 0 0 20px rgba(100, 255, 100, 0.15);
}

.neon-text-glow {
  text-shadow: 0 0 10px rgba(100, 255, 100, 0.5);
}

/* Dopo (modifica proposta) */
.neon-glow {
  box-shadow:
    0 0 10px color-mix(in oklch, var(--primary) 40%, transparent),
    0 0 20px color-mix(in oklch, var(--primary) 20%, transparent);
}

.neon-text-glow {
  text-shadow: 0 0 10px color-mix(in oklch, var(--primary) 50%, transparent);
}
```

**Note per Copilot:**
- `color-mix(in oklch, ...)` è supportato da tutti i browser moderni (Chromium 111+, Firefox 113+, Safari 16.2+). Verificare la compatibility target del progetto.
- Se il progetto usa Tailwind JIT, le classi `.neon-glow` e `.neon-text-glow` sono definite in CSS puro in `index.css` e non richiedono modifiche a `tailwind.config.js`.
- La variabile CSS corretta è `--primary` (confermato via ispezione del codebase — usata già nei componenti Shadcn/ui).
- **Aggiornare anche `@keyframes neon-pulse`** che usa lo stesso verde fisso `rgba(100, 255, 100, ...)` e viene usata dalla classe `.stat-flash`. Snippet da sostituire:
  ```css
  @keyframes neon-pulse {
    0%, 100% { box-shadow: 0 0 15px color-mix(in oklch, var(--primary) 30%, transparent); }
    50%       { box-shadow: 0 0 25px color-mix(in oklch, var(--primary) 60%, transparent); }
  }
  ```

**Rischio:** Molto basso. Modifica CSS pura, nessuna logica JS coinvolta.

---

### 1.5 main.css — Pulizia file corrotto

**File:** `src/main.css`

**Problema:** Il file contiene frammenti CSS spezzati, commenti tronchi e definizioni parziali di variabili. È visualmente inerte ma rappresenta un rischio di regressione e confonde l'analisi del codebase.

**Azione da eseguire:**

1. `main.css` **è importato** in `main.tsx` riga 9: `import "./main.css"` — non va eliminato né svuotato.
2. Il file è il punto di ingresso CSS dell'app: contiene in cima tre `@import` critici:
   ```css
   @import 'tailwindcss';
   @import './styles/theme.css';
   @import './index.css';
   ```
   Svuotare il file causerebbe la perdita di Tailwind, del sistema di temi e di tutti gli stili globali.
3. **Azione corretta:** rimuovere solo il contenuto corrotto che segue i tre `@import`, lasciando il file con i soli import e un commento di chiarimento:

```css
@import 'tailwindcss';
@import './styles/theme.css';
@import './index.css';

/* Tutto il contenuto seguente era corrotto (frammenti CSS incompleti).
   Stili globali e variabili tema sono definiti in src/index.css e src/styles/theme.css. */
```

**Note per Copilot:**
- Non eseguire ricerche prima di procedere: la verifica è già stata effettuata — il file è importato e contiene gli `@import` di bootstrap dell'app.
- Verificare visivamente dopo la pulizia che il tema e i font (JetBrains Mono, Orbitron) siano ancora caricati.

**Rischio:** Nessuno se si conservano i tre `@import` iniziali.

---

## Blocco 2 — Modifiche moderate (settimana prossima)

### 2.1 MainGameTabs — Tab disabilitati contestualmente per fase di gioco

**File:** `src/components/MainGameTabs.tsx`

**Problema:** Tutti i tab principali sono sempre visibili e navigabili, anche quando le azioni in essi contenute non sono disponibili nella fase corrente del gioco. Per un utente NVDA, questo significa esplorare strutture piene di pulsanti disabilitati senza capire il motivo contestuale.

**Soluzione:** Disabilitare contestualmente i `TabsTrigger` con `aria-label` esplicativo della motivazione, coerente con il pattern già usato nei `TabsTrigger` con `disabled` in `CharacterSheet.tsx`.

**Modifica da applicare (esempio per tab Scuola):**

```tsx
// Tipo DayPhase reale: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
// Valori `value` reali nei TabsTrigger: 'school', 'city', 'character', 'social', 'status'
// currentPhase va aggiunto a MainGameTabsProps e propagato da App.tsx

const isSchoolPhase = currentPhase === 'mattina';
const isCityAvailable = currentPhase === 'pomeriggio' || currentPhase === 'sera';
const isSocialAvailable = currentPhase === 'pomeriggio' || currentPhase === 'sera' || currentPhase === 'notte';

// Applicare ai TabsTrigger (i value reali sono in inglese)
<TabsTrigger
  value="school"
  disabled={!isSchoolPhase}
  aria-label={
    !isSchoolPhase
      ? "Scuola: non disponibile in questa fase del giorno"
      : "Scuola"
  }
>
  <GraduationCap size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Scuola</span>
  <span className="sm:hidden" aria-hidden="true">Scuola</span>
</TabsTrigger>

<TabsTrigger
  value="city"
  disabled={!isCityAvailable}
  aria-label={
    !isCityAvailable
      ? "Città: disponibile dal pomeriggio"
      : "Città"
  }
>
  <Buildings size={20} className="mr-2" weight="fill" />
  <span className="hidden sm:inline">Città</span>
  <span className="sm:hidden" aria-hidden="true">Roma</span>
</TabsTrigger>
```

**Note per Copilot:**
- Il tipo `DayPhase` è `'mattina' | 'pomeriggio' | 'sera' | 'notte'` (definito in `src/lib/types.ts`). Non usare valori inglesi come `'morning'`/`'afternoon'`: non esistono nel codebase.
- I `value` reali dei tab in `MainGameTabs.tsx` sono `'school'`, `'city'`, `'character'`, `'social'`, `'status'` — non i nomi italiani usati come label.
- `currentPhase` non è attualmente in `MainGameTabsProps`: va aggiunto all'interfaccia e passato da `App.tsx` dove è già disponibile.
- Non nascondere i tab (`hidden`) ma disabilitarli: la struttura di navigazione deve restare visibile per orientamento.
- Verificare che il tab attivo non venga disabilitato durante una transizione di fase (edge case: l'utente è nel tab Scuola e la fase cambia a `pomeriggio`).
- Se l'utente è su un tab che viene disabilitato per cambio fase, implementare un redirect automatico al tab `'social'` (tab Azioni, sempre disponibile).

**Rischio:** Medio. Richiede aggiunta di `currentPhase` a `MainGameTabsProps` e mappatura fasi per ogni tab.

---

### 2.2 AppHeader — morningChoicePending con link diretto all'azione

**File:** `src/components/AppHeader.tsx`

**Problema:** Il banner `morningChoicePending` mostra un `role="alert"` con `animate-pulse` ma non porta il giocatore direttamente all'azione richiesta. L'utente deve navigare manualmente verso il tab Scuola.

**Soluzione:** Aggiungere un pulsante nel banner che chiama una callback `onGoToSchool` per impostare il tab attivo su `'school'`, e aggiungere uno shortcut tastiera dedicato documentato in `KeyboardShortcutsDialog`.

**Modifica da applicare:**

```tsx
// 1. Aggiungere onGoToSchool all'interfaccia AppHeaderProps
interface AppHeaderProps {
  // ... props esistenti ...
  onGoToSchool: () => void  // nuovo
}

// 2. Nel banner morningChoicePending (valore tab corretto: 'school')
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

// 3. In App.tsx passare la callback
<AppHeader
  {/* ... props esistenti ... */}
  onGoToSchool={() => setActiveTab('school')}
/>
```

**Shortcut da aggiungere in `useKeyboardShortcuts.ts`:**

```ts
// Nel blocco if (e.altKey)
if (e.altKey && key === 's') {
  e.preventDefault()
  setActiveTab('school')
  announce('Tab Scuola aperto')
  return
}
```

**Note per Copilot:**
- `setActiveTab` è in `App.tsx` (stato locale, riga 137). Non è e non va passato direttamente ad `AppHeader`: usare la callback `onGoToSchool: () => void` come da pattern già usato per `onOpenKeyboardHelp`.
- Il `value` corretto del tab scuola è `'school'` (stringa inglese) — non `'scuola'`.
- Il pulsante usa il componente `Button` di Shadcn/ui per rispettare il sistema di focus-ring del progetto (`focus-visible:ring-[3px]`).
- `Alt+S` è libero: `Ctrl+S` è già mappato a `handleShoppingMall`, ma `Alt+S` non ha conflitti.
- Documentare il nuovo shortcut in `KeyboardShortcutsDialog.tsx` nella stessa lista degli shortcut esistenti.

**Rischio:** Basso. Richiede solo aggiunta di una prop callback a `AppHeaderProps`.

---

### 2.3 SchoolMorningPanel — Colori hardcoded sostituiti con variabili tema

**File:** `src/components/SchoolMorningPanel.tsx`

**Problema:** La funzione `categoryColor` usa classi Tailwind con colori fissi (`bg-blue-100 text-blue-800`, `bg-green-100 text-green-800`) che non fanno parte del sistema di temi. Su temi scuri il contrasto è insufficiente.

**Modifica da applicare:**

Le categorie reali nel codebase sono 7 (tipo `MorningEventCategory` in `src/lib/types.ts`): `didattica`, `sociale`, `istituto`, `strada`, `casa`, `citta`, `amici`. L'oggetto `categoryColor` è un `Record`, non una funzione con switch.

```tsx
// Prima (stato attuale in SchoolMorningPanel.tsx)
const categoryColor: Record<MorningEventCategory, string> = {
  didattica: 'bg-blue-100 text-blue-800',
  sociale: 'bg-green-100 text-green-800',
  istituto: 'bg-orange-100 text-orange-800',
  strada: 'bg-gray-100 text-gray-800',
  casa: 'bg-yellow-100 text-yellow-800',
  citta: 'bg-purple-100 text-purple-800',
  amici: 'bg-pink-100 text-pink-800',
}

// Dopo (variabili tema adattive)
const categoryColor: Record<MorningEventCategory, string> = {
  didattica: 'bg-primary/10 text-primary border border-primary/20',
  sociale:   'bg-secondary/10 text-secondary border border-secondary/20',
  istituto:  'bg-accent/10 text-accent border border-accent/20',
  strada:    'bg-muted text-muted-foreground',
  casa:      'bg-secondary/10 text-secondary border border-secondary/20',
  citta:     'bg-accent/10 text-accent border border-accent/20',
  amici:     'bg-primary/10 text-primary border border-primary/20',
}
```

**Note per Copilot:**
- I token `primary`, `secondary`, `accent`, `muted`, `muted-foreground` sono definiti nel sistema Shadcn/ui e rispondono ai temi.
- Verificare il contrasto risultante su tutti e 3 i temi (Default, Dark Viola, Dark Ciano) — in particolare `text-primary` su `bg-primary/10` deve rispettare WCAG AA (4.5:1 per testo normale, 3:1 per testo grande).
- Il `border` aggiuntivo aiuta la distinzione visiva senza dipendere solo dal colore (principio WCAG 1.4.1 — uso del colore non come unico mezzo di trasmissione informazioni).

**Rischio:** Basso. Modifica CSS/Tailwind pura.

---

### 2.4 MainGameTabs — sr-only su emoji decorative nei tab trigger mobile

**File:** `src/components/MainGameTabs.tsx`

**Problema:** I tab trigger usano emoji come fallback per mobile (`<span className="sm:hidden">👤</span>`) senza alternativa testuale esplicita per screen reader. Le emoji vengono lette da NVDA con il loro nome Unicode completo, che può risultare verboso o incoerente.

**Modifica da applicare:**

```tsx
// Prima
<TabsTrigger value="profilo">
  <span className="hidden sm:inline">Profilo</span>
  <span className="sm:hidden">👤</span>
</TabsTrigger>

// Dopo
<TabsTrigger value="profilo">
  <span className="hidden sm:inline" aria-hidden="true">Profilo</span>
  <span className="sm:hidden" aria-hidden="true">👤</span>
  <span className="sr-only">Profilo</span>
</TabsTrigger>
```

**Note per Copilot:**
- Lo `<span className="sr-only">` con il testo del tab deve essere presente in tutti i `TabsTrigger` che usano questo pattern emoji/testo.
- L'`aria-label` sul `TabsTrigger` stesso è un'alternativa valida se preferita rispetto allo span:
  ```tsx
  <TabsTrigger value="profilo" aria-label="Profilo">
    <span className="hidden sm:inline" aria-hidden="true">Profilo</span>
    <span className="sm:hidden" aria-hidden="true">👤</span>
  </TabsTrigger>
  ```
- Applicare sistematicamente a tutti i tab che usano questo pattern, non solo a uno.

**Rischio:** Nessuno. Modifica additiva pura.

---

## Blocco 3 — Pianificazione (non implementare senza analisi preventiva)

### 3.1 SchoolTab — Riduzione tab annidati

**File:** `src/components/tabs/SchoolTab.tsx`

**Problema:** `SchoolTab` contiene 5 sotto-tab interni (Home, Voti, Verifiche, Amici, Relazioni) all'interno di un tab già figlio del tab principale. La navigazione a 2 livelli di tab annidati crea disorientamento, specialmente per utenti SR.

**Analisi preventiva richiesta prima dell'implementazione:**

1. Mappare tutti gli stati condizionali in `SchoolTab.tsx`:
   - `morningChoicePending` → mostra `SchoolMorningPanel`
   - `schoolBreak` → mostra `SchoolBreakPanel`
   - orario scolastico attivo → mostra pannello standard con sotto-tab
   - fuori orario scolastico → stato disabilitato o messaggio
2. Identificare quali sotto-tab hanno dipendenze di stato tra loro.
3. Valutare se `Home` e `Voti` possono essere consolidati in un pannello unico con sezioni verticali (scroll) invece di tab separati.

> **Nota di correzione (post-validazione):** I sotto-tab reali in `SchoolTab.tsx` sono `home`, `voti`, `verifiche`, `amici`, `dashboard` (5 tab, non `relazioni`). Il sotto-tab precedentemente denominato "Relazioni" nella bozza non esiste: il quinto tab è `Dashboard` (value=`"dashboard"`, icona `Trophy`).

**Approccio suggerito (da validare):**

- Mantenere `Verifiche`, `Amici`, `Dashboard` come sotto-tab (funzioni distinte).
- Unificare `Home` e `Voti` in un unico pannello con layout a sezioni.
- Non implementare senza aver disegnato prima lo stato completo della macchina a stati di `SchoolTab`.

**Rischio:** Alto se non preceduto dall'analisi. Non pianificare prima di mappare la logica condizionale.

---

### 3.2 DailyControls — Riposizionamento o replica contestuale

**File:** `src/components/DailyControls.tsx`, `src/components/AppHeader.tsx`

**Problema:** I controlli di avanzamento fase (Riposa / Prossima fase / Dormi) sono nell'header, fisicamente distanti dal contesto in cui si eseguono le azioni. Questo crea un flusso cognitivo discontinuo.

**Approccio suggerito:**

Replicare (non spostare) i pulsanti di avanzamento fase in fondo a ciascun tab di azione (SocialTab, CityTab, SchoolTab) come footer contestuale. I controlli nell'header restano come riferimento globale.

**Note:** Valutare l'impatto sulla duplicazione dello stato — i pulsanti replicati devono condividere la stessa logica di abilitazione/disabilitazione dell'originale.

**Rischio:** Medio. Richiede gestione della duplicazione senza duplicare la logica.

---

### 3.3 UI — Border-radius e uppercase sulle sezioni

**File:** `tailwind.config.js`, vari componenti

**Problema:** `--radius: 0.25rem` (quasi zero) rende le card indistinguibili dai contenitori. Il testo in `UPPERCASE` su tutte le label di sezione affatica la lettura in sessioni lunghe.

**Modifiche suggerite:**

```js
// tailwind.config.js
theme: {
  extend: {
    borderRadius: {
      DEFAULT: '0.5rem',    // da 0.25rem
      lg: '0.75rem',        // card principali
      xl: '1rem',           // dialog e modal
    }
  }
}
```

Per il typography uppercase: riservare `uppercase tracking-wide` solo a badge, shortcut e label stato. Sostituire con `font-semibold capitalize` per titoli sezione.

**Rischio:** Medio. Cambiare `--radius` globalmente può alterare l'aspetto di tutti i componenti Shadcn/ui. Test visivo approfondito richiesto su tutti i temi.

---

## Ordine di esecuzione consigliato

```
Blocco 1 (oggi, sessione singola):
  1.4 index.css glow adattivo            ← 5 min, zero rischio
  1.3 MainGameTabs rename tab            ← 5 min, zero rischio
  1.2 TimeDisplay aria-live              ← 10 min, zero rischio
  1.1 ActionButton tooltip SR            ← 20 min, basso rischio
  1.5 main.css pulizia                   ← 10 min dopo verifica import

Blocco 2 (sessione separata):
  2.3 SchoolMorningPanel colori tema     ← 15 min, basso rischio
  2.4 Tab trigger sr-only emoji          ← 20 min, zero rischio
  2.2 AppHeader morningChoicePending     ← 30 min, basso-medio rischio
  2.1 Tab contestuali per fase           ← 60-90 min, richiede analisi fasi

Blocco 3 (pianificazione separata):
  Analisi macchina a stati SchoolTab prima di scrivere codice
  Prototipo DailyControls replica
  Test visivo approfondito border-radius
```

---

## File coinvolti — Riepilogo

| File | Blocco | Interventi |
|------|--------|------------|
| `src/components/ActionButton.tsx` | 1 | `sr-only` su `blockedReason` |
| `src/components/TimeDisplay.tsx` | 1 | `aria-live` su contatore azioni |
| `src/components/MainGameTabs.tsx` | 1, 2 | Rename tab + SR emoji + tab contestuali |
| `src/index.css` | 1 | Glow neon adattivo |
| `src/main.css` | 1 | Pulizia/eliminazione |
| `src/components/AppHeader.tsx` | 2 | Link diretto da alert |
| `src/components/SchoolMorningPanel.tsx` | 2 | Colori hardcoded → variabili tema |
| `src/components/KeyboardShortcutsDialog.tsx` | 2 | Nuovo shortcut Alt+S |
| `src/components/tabs/SchoolTab.tsx` | 3 | Refactor tab annidati (solo dopo analisi) |
| `src/components/DailyControls.tsx` | 3 | Replica contestuale |
| `tailwind.config.js` | 3 | Border-radius globale |

---

## Criteri di accettazione

### Blocco 1 — Test obbligatori prima di merge

- [ ] NVDA annuncia il motivo del blocco quando il focus è su un `ActionButton` disabilitato
- [ ] NVDA annuncia il cambio del contatore interazioni rimanenti dopo ogni azione senza navigazione manuale
- [ ] Il glow degli elementi con classe `.neon-glow` corrisponde al colore primario del tema attivo su tutti e 3 i temi
- [ ] I tab "Azioni" e "Impostazioni" sono nominati correttamente e il `value` dei tab non è cambiato
- [ ] `main.css` è pulito o rimosso senza regressioni visive

### Blocco 2 — Test obbligatori prima di merge

- [ ] I tab disabilitati per fase vengono annunciati da NVDA con la motivazione (`"non disponibile in questa fase"`)
- [ ] Il banner `morningChoicePending` include un pulsante funzionante che porta al tab Scuola
- [ ] I badge categoria in `SchoolMorningPanel` hanno contrasto sufficiente su tutti e 3 i temi (verifica manuale)
- [ ] Tutti i tab trigger con emoji hanno alternativa `sr-only` o `aria-label` esplicito

---

*Documento generato il 17/04/2026 — Revisione e validazione richiesta a Copilot prima dell'implementazione.*
