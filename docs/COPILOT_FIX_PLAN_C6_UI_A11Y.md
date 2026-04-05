# COPILOT FIX PLAN C6 — Restyling UI Popomundo + Accessibilità Screen Reader Completa

**Repository:** Nemex81/tabboz-simulator-202 — **Ramo:** main
**Dipendenze:** Richiede C4 e C5 già applicati (verificati ✅)
**Priorità:** ALTA — questo piano include requisiti di accessibilità obbligatori

---

## CONTESTO DEL PROGETTO

Tabboz Simulator 202 è un gioco browser React+TypeScript+Vite con stile anni '90,
ambientato nella vita scolastica italiana. La UI attuale usa card fluttuanti in
dark mode neon con molto whitespace.

**Obiettivo C6:** Avvicinare la UI all'estetica di **Popomundo** (browser RPG
svedese anni 2000-2010), aggiungendo contestualmente una sezione completa di
accessibilità per screen reader (NVDA, JAWS, VoiceOver).

---

## PARTE A — ACCESSIBILITÀ SCREEN READER (OBBLIGATORIA)

> ⚠️ Questa sezione ha priorità assoluta. Va implementata PRIMA del restyling
> visivo. Ogni componente modificato nel restyling deve rispettare questi standard.

### A1 — Regione ARIA Live già presente (NON modificare)

`App.tsx` ha già una regione `aria-live="assertive"` con `ref={ariaLiveRef}` e
la funzione `announce(message)` già usata su ogni azione [cite: App.tsx linea ~95].
**Non rimuovere né modificare questo meccanismo.**

### A2 — Barre delle statistiche: attributi ARIA mancanti

**File:** `src/components/StatDisplay.tsx`

Ogni barra `<div>` che rappresenta un progress bar DEVE avere:

```tsx
<div
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max ?? 100}
  aria-label={`${label}: ${value} su ${max ?? 100}`}
  style={{ width: `${(value / (max ?? 100)) * 100}%` }}
  className="h-full bg-primary transition-all duration-300"
/>
```

Il contenitore della barra (elemento padre) deve avere:
```tsx
aria-hidden="true"
```
perché il valore è già letto dall'etichetta testuale vicina.

### A3 — Annuncio automatico dei cambiamenti di stat

**File:** `src/hooks/useGameStats.ts`

Quando una stat cambia di ±5 o più in una singola operazione, chiamare
`announce()` con un messaggio descrittivo. Esempio:

```typescript
// Dentro setStats wrapper, dopo aver calcolato il delta:
if (Math.abs(delta.coattaggine ?? 0) >= 5) {
  announce(`Coattaggine ${delta.coattaggine > 0 ? 'aumentata' : 'diminuita'} di ${Math.abs(delta.coattaggine)}. Ora: ${newStats.coattaggine}`)
}
if (Math.abs(delta.muscoli ?? 0) >= 5) {
  announce(`Muscoli ${delta.muscoli > 0 ? 'aumentati' : 'diminuiti'} di ${Math.abs(delta.muscoli)}. Ora: ${newStats.muscoli}`)
}
// ... stesso pattern per figosita, intelligenza, carisma, reputazione
// Per soldi: sempre annunciare (cambio piccolo ma importante):
if (delta.soldi !== 0) {
  announce(`Soldi: ${newStats.soldi > prevStats.soldi ? '+' : ''}${delta.soldi}€. Totale: ${newStats.soldi}€`)
}
// Per stanchezza sopra soglia critica:
if (newStats.stanchezza > 80 && prevStats.stanchezza <= 80) {
  announce('ATTENZIONE: Stanchezza critica! Devi riposare prima di poter lavorare.')
}
```

### A4 — Tooltip ritardati (help contestuale per screen reader)

**File:** `src/components/ActionButton.tsx`

Aggiungere al componente `ActionButton` un prop opzionale `helpText` (stringa).
Quando il focus è sul pulsante per più di 1.5 secondi, annunciare `helpText`
tramite la regione aria-live.

Implementazione:
```tsx
// Aggiungere al componente:
interface ActionButtonProps {
  // ... props esistenti
  helpText?: string   // testo di aiuto letto dopo 1.5s di focus
  announce?: (msg: string) => void  // callback dall'App
}

// Nel corpo del componente:
const helpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

const handleFocus = () => {
  if (helpText && announce) {
    helpTimer.current = setTimeout(() => {
      announce(helpText)
    }, 1500)
  }
}

const handleBlur = () => {
  if (helpTimer.current) clearTimeout(helpTimer.current)
}

// Nel JSX del pulsante:
onFocus={handleFocus}
onBlur={handleBlur}
```

**In `App.tsx`**, passare `announce={announce}` e `helpText` a ogni `ActionButton`:

Esempi:
```tsx
<ActionButton
  label="Palestra"
  helpText="Costa 20 euro, aumenta i muscoli di 5-10 punti e aumenta la stanchezza. Richiede almeno 20 euro e stanchezza sotto 80."
  announce={announce}
  ...
/>
<ActionButton
  label="Corrompi"
  helpText="Corrompi un professore con 100 euro. Aumenta i voti di 0.5 punti in una materia casuale. Rischio basso. Richiede periodo scolastico."
  announce={announce}
  ...
/>
<ActionButton
  label="Minaccia"
  helpText="Minaccia un professore. Rischio del 30% di essere espulso dal gioco! Se riesce, aumenta molto i voti e la coattaggine. Usare con cautela."
  announce={announce}
  ...
/>
```
Aggiungere `helpText` a TUTTI i pulsanti azione in `App.tsx`. Contenuto del
testo: effetti dell'azione, costo, rischi, requisiti.

### A5 — Tab principali: annuncio del cambio pannello

**File:** `src/App.tsx`

Sul componente `<Tabs>` principale, aggiungere `onValueChange`:

```tsx
<Tabs
  defaultValue="status"
  onValueChange={(value) => {
    const labels: Record<string, string> = {
      status:    'Pannello Profilo aperto',
      school:    'Pannello Scuola aperto. Voti scolastici e metodi alternativi.',
      exams:     'Pannello Verifiche aperto. Gestione esami programmati.',
      friends:   'Pannello Amici aperto. Gestione amicizie e fidanzata.',
      social:    'Pannello Vita Sociale aperto. Azioni, lavoro e svago.',
      dashboard: 'Dashboard statistiche aperta. Grafici andamento personaggio.',
    }
    announce(labels[value] ?? `Pannello ${value} aperto`)
  }}
>
```

### A6 — Voti scolastici: lettura accessibile della griglia

**File:** `src/App.tsx` — sezione `TabsContent value="school"`

La griglia dei voti deve usare `role="table"` con intestazioni:

```tsx
<div
  role="table"
  aria-label="Voti scolastici"
  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
>
  {Object.entries(grades).map(([subject, grade]) => (
    <div
      key={subject}
      role="row"
      aria-label={`${getSubjectDisplayName(subject)}: ${grade.toFixed(1)} su 10${grade < 6 ? ' — INSUFFICIENTE' : ''}`}
    >
      {/* contenuto visivo invariato */}
    </div>
  ))}
</div>
```

### A7 — Dialog eventi: focus automatico e chiusura accessibile

**File:** tutti i componenti `AlertDialog` in `App.tsx`

Ogni `AlertDialogTitle` deve descrivere sinteticamente la situazione.
Ogni `AlertDialogDescription` deve essere leggibile come testo autonomo
(già soddisfatto parzialmente con `{currentEvent}`).

Aggiungere `aria-describedby` collegato alla descrizione:
```tsx
<AlertDialogContent aria-describedby="event-description">
  <AlertDialogDescription id="event-description">
    {currentEvent}
  </AlertDialogDescription>
```

### A8 — Sezione "Gestione Giornata": stato azioni leggibile

**File:** `src/App.tsx` — riquadro "Gestione Giornata"

Il badge con le azioni rimaste deve avere un `aria-live="polite"` autonomo
per aggiornamenti non urgenti (diverso dall'`assertive` globale):

```tsx
<span
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className={`text-xs font-semibold px-2 py-0.5 rounded-full ...`}
>
  {canAdvance ? 'Pronto ad avanzare alla prossima fase' : `${phaseActionsRemaining} azioni rimaste in questa fase`}
</span>
```

### A9 — Scheda Personaggio (subtab Tratti): barra stress accessibile

**File:** `src/App.tsx` — subtab "tratti" nel pannello Profilo

La barra `psychStress` deve avere:
```tsx
<div
  role="progressbar"
  aria-valuenow={stats.psychStress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Stress psicologico: ${stats.psychStress} su 100${stats.psychStress > 70 ? ' — livello elevato' : ''}`}
  className="h-full bg-purple-500 transition-all duration-300"
  style={{ width: `${stats.psychStress}%` }}
/>
```

---

## PARTE B — RESTYLING UI STILE POPOMUNDO

> **Cos'è Popomundo:** browser RPG svedese degli anni 2000-2010. UI densa,
> layout a tabelle/sezioni con bordi sottili visibili, poco whitespace, barre stat
> sottili con valore testuale affiancato, schede di navigazione "a raccoglitore".
> Sfondo dark-navy, colori sobri con accenti precisi, niente "neon aggressivo".

### B1 — Aggiorna variabili CSS del tema

**File:** `src/index.css` (o `src/main.css` se contiene le variabili `:root`)

Sostituire/aggiornare le variabili nel blocco `.dark` o `:root`:

```css
:root {
  /* Dark Navy come sfondo base */
  --background: 222 30% 8%;           /* #0f1120 — dark navy profondo */
  --foreground: 220 20% 88%;          /* #d8ddf0 — testo principale grigio-azzurro */

  --card: 222 28% 12%;                /* #161a2e — card leggermente più chiaro */
  --card-foreground: 220 20% 88%;

  --muted: 222 25% 18%;               /* #222640 — sfondo secondario sezioni */
  --muted-foreground: 220 15% 55%;    /* #7a8099 — label e testo secondario */

  --border: 222 25% 22%;              /* #2a3050 — bordi sezioni */
  --input: 222 25% 18%;

  /* Accent primario: manteniamo il verde-teal ma meno saturo */
  --primary: 165 60% 48%;             /* #2ec4a0 — verde-teal sobrio */
  --primary-foreground: 222 30% 8%;

  --secondary: 200 55% 52%;           /* #3aa0cc — azzurro */
  --secondary-foreground: 222 30% 8%;

  --accent: 38 80% 58%;               /* #e8a83a — giallo-oro per soldi/eventi */
  --accent-foreground: 222 30% 8%;

  --destructive: 0 65% 55%;           /* #cc3333 — rosso pericolo */
  --destructive-foreground: 220 20% 90%;

  /* Ridurre border-radius globale: stile tabella, non "bubble" */
  --radius: 0.25rem;                  /* era 0.5rem o più — ridurre a 4px */
}
```

### B2 — Aggiorna `StatDisplay.tsx` — formato riga compatta

**File:** `src/components/StatDisplay.tsx`

Il componente deve passare da "card grande con barra grossa" a "riga compatta
stile RPG" con barra sottile (5px) e valore testuale affiancato:

```tsx
// Struttura target:
// [⚡] Coattaggine ············· 75/100 [████████░░]

export const StatDisplay = ({ icon, label, value, max = 100 }: StatDisplayProps) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 border-b border-border last:border-0">
      {/* Icona piccola */}
      <span className="text-primary flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement, { size: 16 })}
      </span>

      {/* Label */}
      <span className="text-xs text-muted-foreground font-semibold flex-1 min-w-0 truncate">
        {label}
      </span>

      {/* Valore numerico */}
      <span className="text-sm font-bold text-foreground w-12 text-right flex-shrink-0">
        {typeof value === 'number' && !Number.isInteger(value)
          ? value.toFixed(1)
          : value}
        <span className="text-xs text-muted-foreground font-normal">/{max}</span>
      </span>

      {/* Barra sottile */}
      <div
        className="w-20 flex-shrink-0 h-1.5 bg-muted rounded-sm overflow-hidden"
        aria-hidden="true"
      >
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${value} su ${max}`}
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

### B3 — Pannello stat rapide in header: da grid a lista compatta

**File:** `src/App.tsx` — sezione `<section aria-labelledby="quick-stats">`

Sostituire la griglia con un contenitore a singola colonna (o due colonne su
desktop) con bordo esterno, stile "tabella RPG":

```tsx
<section aria-labelledby="quick-stats">
  <h2 id="quick-stats" className="sr-only">Panoramica Statistiche</h2>
  <div className="border border-border rounded-sm bg-card divide-y divide-border
                  grid grid-cols-2 md:grid-cols-4">
    {/* ogni StatDisplay già nel formato riga dal punto B2 */}
    <StatDisplay icon={...} label="Coattaggine" value={stats.coattaggine} />
    ...
  </div>
</section>
```

### B4 — `TimeDisplay.tsx`: layout compatto su riga singola

**File:** `src/components/TimeDisplay.tsx`

Sostituire il layout a due colonne con padding generoso con un banner orizzontale
compatto, stile "barra di stato":

```tsx
<div className="flex flex-wrap items-center gap-4 px-3 py-2
                border border-border rounded-sm bg-card text-sm">

  {/* Data */}
  <span className="flex items-center gap-1 text-muted-foreground">
    <Calendar size={14} weight="fill" className="text-accent" />
    <strong className="text-foreground">{formatDate(gameTime.currentDate)}</strong>
  </span>

  <span className="text-border">|</span>

  {/* Età */}
  <span className="text-muted-foreground">
    Età: <strong className="text-foreground">{gameTime.age}</strong>
  </span>

  <span className="text-border">|</span>

  {/* Anno scolastico */}
  <span className="text-muted-foreground">
    Anno: <strong className="text-primary">{getSchoolYearName(gameTime.schoolYear.currentYear)}</strong>
  </span>

  {/* Fascia oraria */}
  {currentPhase && dayType && (
    <>
      <span className="text-border">|</span>
      <span className="text-muted-foreground">
        Fase: <strong className="text-secondary">
          {DAY_PHASE_CONFIG[dayType][currentPhase].label}
        </strong>
        <span className="ml-1 text-xs text-muted-foreground">
          {DAY_PHASE_CONFIG[dayType][currentPhase].timeRange}
        </span>
      </span>
    </>
  )}

  {/* Countdown pagella */}
  {gameTime.schoolYear.isSchoolPeriod && (
    <>
      <span className="text-border">|</span>
      <span className="text-xs text-muted-foreground">
        Pagella tra{' '}
        <strong className="text-accent">
          {getDaysUntilReportCard(gameTime.currentDate, gameTime.schoolYear.reportCardDate)} gg
        </strong>
      </span>
    </>
  )}

  {!gameTime.schoolYear.isSchoolPeriod && (
    <>
      <span className="text-border">|</span>
      <span className="text-xs text-accent font-bold">🌴 VACANZE ESTIVE</span>
    </>
  )}
</div>
```

### B5 — Card principali: ridurre padding e border-radius

**File:** `src/App.tsx` — tutti i `<Card className="p-6 ...">` nei tab

Sostituire `p-6` con `p-3` (o `p-4` massimo).
Sostituire `rounded-xl` con `rounded-sm` ovunque presente.
Rimuovere `shadow-xl` e `bg-card/50` (usare `bg-card` pieno).
Mantenere i bordi colorati (`border-2 border-primary` ecc.) — sono fondamentali
per l'identità visiva del gioco e aiutano anche la navigazione screen reader.

### B6 — Tab principali: stile "scheda raccoglitore"

**File:** `src/App.tsx` — `<TabsList>`

```tsx
<TabsList className="flex w-full gap-0 bg-transparent border-b border-border
                     rounded-none p-0 h-auto overflow-x-auto">
  <TabsTrigger
    value="status"
    className="rounded-none rounded-t-sm border border-b-0 border-border
               data-[state=active]:bg-card data-[state=active]:border-primary
               data-[state=active]:text-primary data-[state=inactive]:bg-muted/30
               data-[state=inactive]:text-muted-foreground
               px-3 py-2 text-xs font-semibold"
  >
    <ChartBar size={14} className="mr-1" weight="fill" />
    Profilo
  </TabsTrigger>
  {/* ... stesso stile per tutti i tab */}
</TabsList>
```

### B7 — Stile "barre voto" nella griglia scolastica

**File:** `src/App.tsx` — `TabsContent value="school"`, griglia voti

Ogni cella voto deve usare il formato compatto:
```tsx
<div
  key={subject}
  className="flex items-center gap-2 py-1.5 px-2 border-b border-border"
  role="row"
  aria-label={`${getSubjectDisplayName(subject)}: ${grade.toFixed(1)}${grade < 6 ? ' insufficiente' : ''}`}
>
  <span className="text-xs text-muted-foreground flex-1">
    {getSubjectDisplayName(subject)}
  </span>
  <span className={`text-sm font-bold w-8 text-right ${grade < 6 ? 'text-destructive' : 'text-secondary'}`}>
    {grade.toFixed(1)}
  </span>
  <div className="w-16 h-1.5 bg-muted rounded-sm overflow-hidden" aria-hidden="true">
    <div
      className={`h-full ${grade < 6 ? 'bg-destructive' : 'bg-secondary'}`}
      style={{ width: `${(grade / 10) * 100}%` }}
    />
  </div>
</div>
```
La card "VOTI SCOLASTICI" diventa un contenitore a lista verticale invece
che una griglia a celle quadrate.

---

## PARTE C — FILE E VINCOLI

### File da modificare (in ordine di priorità)

| Priorità | File | Motivo |
|----------|------|--------|
| 1 | `src/index.css` | Variabili colore + border-radius globale |
| 2 | `src/components/StatDisplay.tsx` | Formato riga compatta + ARIA |
| 3 | `src/components/ActionButton.tsx` | `helpText` + `announce` + focus timer |
| 4 | `src/App.tsx` | ARIA su tab/barre/dialog + restyling card e layout |
| 5 | `src/components/TimeDisplay.tsx` | Banner compatto |
| 6 | `src/hooks/useGameStats.ts` | Annuncio automatico cambi stat |

### File da NON toccare

- Tutta la cartella `src/lib/` — nessuna modifica
- `src/hooks/` ad eccezione di `useGameStats.ts` (solo punto A3)
- `src/components/ui/` — non toccare i componenti shadcn base
- `src/components/GirlfriendPanel.tsx`, `EnhancedFriendsPanel.tsx`,
  `RelationshipsPanel.tsx`, `ExamsPanel.tsx` — non modificare

---

## CHECKLIST TEST C6

### Accessibilità (A)

| # | Verifica |
|---|---------|
| A-1 | `StatDisplay` ha `role="progressbar"` con `aria-valuenow/min/max/label` |
| A-2 | `ActionButton` ha prop `helpText` e annuncia dopo 1.5s di focus |
| A-3 | Cambio stat ≥5 punti viene annunciato via `announce()` |
| A-4 | Cambio tab principale viene annunciato via `announce()` |
| A-5 | Griglia voti ha `role="table"` e ogni riga ha `aria-label` leggibile |
| A-6 | Badge azioni rimaste ha `role="status" aria-live="polite"` |
| A-7 | Barra `psychStress` ha `role="progressbar"` con `aria-label` |
| A-8 | Dialog eventi hanno `aria-describedby` collegato alla descrizione |
| A-9 | Test con NVDA: ogni pulsante azione letto correttamente al focus |
| A-10 | Test con NVDA: ogni cambio stat annunciato automaticamente |

### Visivo (B)

| # | Verifica |
|---|---------|
| B-1 | Sfondo dark-navy (#0f1120 o simile), niente nero pieno |
| B-2 | `StatDisplay` in formato riga con barra ≤6px e valore testuale |
| B-3 | `TimeDisplay` su una riga orizzontale compatta |
| B-4 | Card con `p-3` o `p-4`, niente `p-6` |
| B-5 | Tab principali stile "scheda raccoglitore" con bordo visibile |
| B-6 | Voti scolastici in lista verticale compatta, non griglia quadrata |
| B-7 | Nessuna ombra `shadow-xl` sui pannelli principali |

### Build

| # | Verifica |
|---|---------|
| Z-1 | `npm run build` — zero errori TypeScript |
| Z-2 | Zero prop mancanti su `ActionButton` dopo aggiunta `helpText`/`announce` |

---

## NOTE IMPLEMENTATIVE

**Screen reader testati:** NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS).
Il sistema `aria-live="assertive"` già presente in `App.tsx` è compatibile con
tutti e tre. Il `aria-live="polite"` sul badge azioni è necessario per non
interrompere la lettura quando il giocatore naviga con il tab.

**Tooltip ritardati:** 1500ms è il valore raccomandato per non essere troppo
aggressivo durante la navigazione rapida, ma abbastanza veloce da essere utile
quando si "esplora" un pulsante sconosciuto.

**Compatibilità con piani futuri:** Il prop `announce` su `ActionButton` è
riutilizzabile per C4-v2 (assegnazione tratti) e qualsiasi futuro sistema di
eventi. Mantenerlo nell'interfaccia anche se inizialmente non tutti i bottoni
hanno `helpText`.
