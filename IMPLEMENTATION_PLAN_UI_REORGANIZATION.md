# Piano di Implementazione — Riorganizzazione UI

**Scope**: Relazioni in CharacterSheet + Home Scuola + Amici Scolastici  
**Stato**: Piano corretto e ottimizzato — pronto per implementazione

---

## Analisi e correzioni rispetto al piano originale

### C1 — Icona Heart duplicata (Passo A2)

**Problema**: Il tab "Salute" in `CharacterSheet` usa già l'icona `Heart`. Usarla anche per "Relazioni" crea ambiguità visiva — due tab con la stessa icona.  
**Correzione**: Usare `UsersThree` da `@phosphor-icons/react` per il tab "Relazioni". Icona semanticamente più corretta (relazioni = persone).

### C2 — CRITICO: Pannello scuola perde TUTTA l'interattività (Passo B)

**Problema**: Il piano originale sostituisce i 4 sub-tab attuali del pannello scuola (`grades`/`exams`/`friends`/`dashboard`) con 3 tab puramente informativi (`home`/`voti`/`amici`). Questo elimina:
- Bottoni "Vai a Scuola" / "Marina la Scuola"
- `SchoolMorningPanel` (eventi mattina scolastica)
- `AfternoonEventPanel` (eventi pomeriggio/sera)
- Pagella inline con voti dettagliati per materia
- Bottoni "Corrompi Professore" / "Minaccia Professore"
- `ExamsPanel` (gestione verifiche ed esami)
- Card "Sistema Intelligenza" e "Sistema Carisma"
- `StatsDashboard` (panoramica statistiche)

**Impatto**: Il giocatore perde la capacità di interagire con la scuola — niente lezioni, verifiche, eventi. Il gameplay core è rotto.  
**Correzione**: Ristrutturare con 5 sub-tab che preservano TUTTA l'interattività:
1. `home` — Sommario scolastico + azioni scuola (Vai a Scuola/Marina) + SchoolMorningPanel + AfternoonEventPanel
2. `voti` — GradeProgressPanel + Pagella inline + gradesHistory + Corrompi/Minaccia
3. `verifiche` — ExamsPanel + Sistema Intelligenza
4. `amici` — EnhancedFriendsPanel (solo amici scolastici) + Sistema Carisma
5. `dashboard` — StatsDashboard (invariato)

### C3 — CRITICO: RelationshipsPanel non intercambiabile (Passo C)

**Problema**: Il piano tratta `RelationshipsPanel` e `RelationsPanel` come intercambiabili. Servono scopi diversi:
- `RelationshipsPanel` → gestisce `Relationship[]` (ragazze incontrabili — feature "provaci")
- `RelationsPanel` → gestisce `Friend[]` (lista amici con tab Tutti/Scuola/Extra)

**Impatto**: Eliminando `RelationshipsPanel` senza alternativa, il giocatore perde la possibilità di corteggiare attivamente le ragazze dal pool di incontri.  
**Correzione**: Spostare `RelationshipsPanel` nel tab "Relazioni" di `CharacterSheet`, sotto `RelationsPanel`. Amici e interessi romantici nella stessa vista relazioni. Aggiungere `relationships` e `onTryRelationship` alle props di CharacterSheet.

### C4 — Import Ragazza inline (Passo A1)

**Problema**: `import('@/lib/girlfriend-system').Ragazza` inline nell'interfaccia. Funziona ma non è idiomatico.  
**Correzione**: Usare `import type { Ragazza } from '@/lib/girlfriend-system'` esplicito.

### C5 — Nomi variabili errati nel sommario (Passo B2)

**Problema**: Il piano usa `{schoolYear}°` nel JSX del sommario, ma nel contesto inline di `App.tsx` non esiste una variabile `schoolYear` locale. Il valore è `gameTime.schoolYear.currentYear`.  
**Correzione**: Usare `{gameTime.schoolYear.currentYear}°` nel JSX.

### C6 — Duplicazione GradeProgressPanel (Passo B3)

**Nota**: Il tab `scuola` di CharacterSheet mostra già `GradeProgressPanel` + `gradesHistory`. Il piano crea la stessa vista nel tab `voti` del pannello scuola. Questa duplicazione è **intenzionale** (vista di riferimento in CharacterSheet vs vista operativa nel pannello scuola) e viene mantenuta.

---

## Piano corretto

### File coinvolti (ordine di modifica)

| # | File | Azione |
|---|------|--------|
| 1 | `src/components/CharacterSheet.tsx` | Aggiunta tab Relazioni + import + props |
| 2 | `src/App.tsx` | Props CharacterSheet + ristrutturazione pannello scuola + pulizia import |

### Vincoli

- **Non modificare**: `EnhancedFriendsPanel.tsx`, `RelationsPanel.tsx`, `RelationshipsPanel.tsx`, `GradeProgressPanel.tsx`, `relation-system.ts`, tutti i file in `src/lib/`
- Eseguire `npx tsc --noEmit` dopo ogni passo
- Commit finale: `feat(ui): relazioni in CharacterSheet, home scuola con sommario, tab amici scolastici`

---

## PASSO A — Tab "Relazioni" in CharacterSheet

**Target**: `src/components/CharacterSheet.tsx`

### A1. Aggiungi import

```typescript
// Aggiungere agli import già esistenti
import { UsersThree } from '@phosphor-icons/react'             // nuova icona
import { RelationsPanel } from '@/components/RelationsPanel'
import { RelationshipsPanel } from '@/components/RelationshipsPanel'
import type { Ragazza } from '@/lib/girlfriend-system'

// In cima, aggiungere Friend e Relationship all'import da @/lib/types (già presente):
import { GameStats, SchoolType, SchoolRecord, GameLogEntry, HealthRecord, SubjectGrades, Friend, Relationship } from '@/lib/types'
```

### A2. Estendi CharacterSheetProps

```typescript
interface CharacterSheetProps {
  // ... props esistenti invariate ...
  playerProfile: { name: string; gender: 'maschio' | 'femmina' } | null
  stats: GameStats
  schoolType: SchoolType | null
  schoolYear: number
  age: number
  schoolRecord: SchoolRecord
  currentMedia: number
  gameLog: GameLogEntry[]
  healthRecord: HealthRecord
  grades: SubjectGrades
  gradesHistory: Record<number, SubjectGrades>
  // --- NUOVE PROPS ---
  friends: Friend[]
  relationships: Relationship[]
  actionsRemaining: number
  onFriendAction: (friendId: string, actionId: string) => void
  onRelationInteraction?: (friendId: string, interactionId: string) => void
  girlfriend: Ragazza | null
  onGirlfriendAction: (action: string) => void
  onGirlfriendBreakup: () => void
  onTryRelationship: (relationshipId: string) => void
}
```

Aggiornare la destrutturazione del componente di conseguenza.

### A3. Sostituisci TabsTrigger "aspetto" con "relazioni"

Rimuovere il trigger disabled:
```tsx
{/* RIMUOVERE QUESTO: */}
<TabsTrigger value="aspetto" disabled aria-label="Aspetto: non ancora disponibile">
  <span className="hidden sm:inline">Aspetto</span>
  <span className="sm:hidden">👕</span>
  <span className="ml-1 text-xs opacity-50">🔜</span>
</TabsTrigger>
```

Inserire al suo posto (seconda posizione — tra `profilo` e `scuola`):
```tsx
<TabsTrigger value="relazioni" aria-label="Relazioni e amicizie">
  <UsersThree size={18} className="mr-1" weight="fill" aria-hidden="true" />
  <span className="hidden sm:inline">Relazioni</span>
  <span className="sm:hidden">👥</span>
</TabsTrigger>
```

**Ordine finale TabsList**: profilo → **relazioni** → scuola → diario → salute → obiettivi(disabled)  
La griglia rimane `grid-cols-6`.

### A4. Rimuovi TabsContent "aspetto"

Attualmente non esiste un `<TabsContent value="aspetto">` (il tab era disabled senza body). **Nessuna azione necessaria.**

### A5. Aggiungi TabsContent "relazioni"

Inserire dopo la chiusura `</TabsContent>` di `value="profilo"` e prima di `<TabsContent value="diario">`:

```tsx
<TabsContent value="relazioni">
  <div className="mt-2 space-y-6">
    <RelationsPanel
      friends={friends}
      stats={stats}
      actionsRemaining={actionsRemaining}
      onFriendAction={onFriendAction}
      onRelationInteraction={onRelationInteraction}
      girlfriend={girlfriend}
      onGirlfriendAction={onGirlfriendAction}
      onGirlfriendBreakup={onGirlfriendBreakup}
    />
    <RelationshipsPanel
      relationships={relationships}
      stats={stats}
      onTryRelationship={onTryRelationship}
      actionsRemaining={actionsRemaining}
    />
  </div>
</TabsContent>
```

### A6. Aggiorna props di CharacterSheet in App.tsx

In `src/App.tsx`, trovare il render di `<CharacterSheet>` (~riga 1361) e aggiungere le nuove prop:

```tsx
<CharacterSheet
  playerProfile={playerProfile ?? null}
  stats={stats}
  schoolType={schoolType}
  schoolYear={gameTime.schoolYear.currentYear}
  age={gameTime.age}
  schoolRecord={schoolRecord}
  currentMedia={currentMedia}
  gameLog={gameLog}
  healthRecord={healthRecord ?? DEFAULT_HEALTH_RECORD}
  grades={grades}
  gradesHistory={rawGradesHistory ?? {}}
  {/* NUOVE PROPS: */}
  friends={friends}
  relationships={relationships}
  actionsRemaining={phaseActionsRemaining ?? 0}
  onFriendAction={handleFriendAction}
  onRelationInteraction={doInteraction}
  girlfriend={girlfriend ?? null}
  onGirlfriendAction={handleGirlfriendAction}
  onGirlfriendBreakup={handleGirlfriendBreakup}
  onTryRelationship={handleTryRelationship}
/>
```

**Verifica**: `npx tsc --noEmit` — nessun errore prima di proseguire con Passo B.

---

## PASSO B — Pannello Scuola: Home + Voti + Verifiche + Amici + Dashboard

**Target**: `src/App.tsx` — blocco inline dentro `<TabsContent value="school">`

Il pannello scuola attualmente ha 4 sub-tab (`grades`/`exams`/`friends`/`dashboard`) con `grid-cols-2 md:grid-cols-4`. Ristrutturiamo in 5 sub-tab preservando tutta l'interattività.

### B1. Sostituisci TabsList

Trovare:
```tsx
<Tabs defaultValue="grades" className="w-full">
  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-card/50 p-1">
    <TabsTrigger value="grades" ...>Voti</TabsTrigger>
    <TabsTrigger value="exams" ...>Verifiche</TabsTrigger>
    <TabsTrigger value="friends" ...>Amici</TabsTrigger>
    <TabsTrigger value="dashboard" ...>Dashboard</TabsTrigger>
  </TabsList>
```

Sostituire con:
```tsx
<Tabs defaultValue="home" className="w-full">
  <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 bg-card/50 p-1">
    <TabsTrigger value="home" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
      <GraduationCap size={18} className="mr-2" weight="fill" />
      Home
    </TabsTrigger>
    <TabsTrigger value="voti" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
      <GraduationCap size={18} className="mr-2" weight="fill" />
      Voti
    </TabsTrigger>
    <TabsTrigger value="verifiche" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
      <Brain size={18} className="mr-2" weight="fill" />
      Verifiche
    </TabsTrigger>
    <TabsTrigger value="amici" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
      <UserCircle size={18} className="mr-2" weight="fill" />
      Amici
    </TabsTrigger>
    <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
      <Trophy size={18} className="mr-2" weight="fill" />
      Dashboard
    </TabsTrigger>
  </TabsList>
```

### B2. Tab "home" — Sommario + Azioni scuola + Events

Questo tab contiene il **nuovo sommario scolastico** in cima, seguito dalle **azioni interattive esistenti** (Vai a Scuola, Marina, SchoolMorningPanel, AfternoonEventPanel).

```tsx
<TabsContent value="home" className="space-y-6 mt-6">
  {/* NUOVO: Sommario scolastico rapido */}
  <Card className="p-4 border-2 border-secondary bg-card">
    <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
      <GraduationCap size={20} weight="fill" aria-hidden="true" />
      SITUAZIONE SCOLASTICA
    </h3>
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt className="text-muted-foreground">Media voti</dt>
        <dd className={`text-2xl font-bold ${currentMedia < 6 ? 'text-destructive' : 'text-secondary'}`}>
          {currentMedia.toFixed(1)}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Condotta</dt>
        <dd className={`text-2xl font-bold ${schoolRecord.condotta < 6 ? 'text-destructive' : 'text-primary'}`}>
          {schoolRecord.condotta.toFixed(1)}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Assenze</dt>
        <dd className={`text-2xl font-bold ${schoolRecord.assenze >= 25 ? 'text-destructive' : 'text-foreground'}`}>
          {schoolRecord.assenze}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Note disciplinari</dt>
        <dd className="text-2xl font-bold text-foreground">{schoolRecord.note}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Compagni di classe</dt>
        <dd className="text-2xl font-bold text-accent">
          {friends.filter(f => f.originType === 'compagno_classe').length}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Anno scolastico</dt>
        <dd className="text-2xl font-bold text-foreground">{gameTime.schoolYear.currentYear}°</dd>
      </div>
    </dl>
  </Card>

  {/* NUOVO: Messaggio contestuale */}
  {(() => {
    if (schoolRecord.assenze >= 20) return (
      <Card className="p-3 border border-destructive bg-destructive/5">
        <p className="text-sm text-destructive font-medium">⚠️ Attenzione: stai accumulando troppe assenze.</p>
      </Card>
    )
    if (currentMedia < 6) return (
      <Card className="p-3 border border-destructive bg-destructive/5">
        <p className="text-sm text-destructive font-medium">⚠️ La tua media è insufficiente. Studia di più!</p>
      </Card>
    )
    if (currentMedia >= 8) return (
      <Card className="p-3 border border-secondary bg-secondary/5">
        <p className="text-sm text-secondary font-medium">⭐ Ottima media! Continua così.</p>
      </Card>
    )
    return (
      <Card className="p-3 border border-muted bg-muted/20">
        <p className="text-sm text-muted-foreground">📚 Settimana nella norma. Niente di urgente.</p>
      </Card>
    )
  })()}

  {/* ESISTENTE — spostato da grades: Bottoni Vai a Scuola / Marina (condizionati) */}
  {currentPhase === 'mattina' && dayType === 'feriale' && gameTime.schoolYear.isSchoolPeriod && (
  <>
    <Card className="p-3 border-2 border-primary bg-card">
      {/* ... Vai a Scuola — JSX identico all'attuale, invariato ... */}
    </Card>

    {!schoolRecord.wentToSchoolToday && !marinatoOggi && (
      <Card className="p-3 border-2 border-destructive bg-card">
        {/* ... Marina! — JSX identico all'attuale, invariato ... */}
      </Card>
    )}
  </>
  )}

  {/* ESISTENTE — spostato da grades: SchoolMorningPanel */}
  {showSchoolMorning && dayType === 'feriale' && currentPhase === 'mattina' && gameTime.schoolYear.isSchoolPeriod && schoolRecord.wentToSchoolToday && (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento mattina scolastica...</div>}>
      <SchoolMorningPanel
        events={schoolMorningEvents}
        stats={stats}
        onStatChange={setStats}
        onGainExtraAction={gainExtraAction}
        onConsumeAction={consumeAction}
        announce={announce}
        onNewFriend={(f) => setFriends((current) => [...current, f])}
        addLogEntry={addLogEntry}
        currentDate={gameTime.currentDate}
      />
    </Suspense>
  )}

  {/* ESISTENTE — spostato da grades: AfternoonEventPanel */}
  {afternoonEvent && (currentPhase === 'pomeriggio' || currentPhase === 'sera') && (
    <Suspense fallback={null}>
      <AfternoonEventPanel
        event={afternoonEvent}
        onChoice={handleAfternoonChoice}
      />
    </Suspense>
  )}
</TabsContent>
```

### B3. Tab "voti" — GradeProgressPanel + Pagella + Metodi alternativi

Contiene: GradeProgressPanel, gradesHistory, Pagella inline (tabella voti per materia + condotta/assenze/note/sospensioni), card "Corrompi/Minaccia Professore".

```tsx
<TabsContent value="voti" className="space-y-6 mt-6">
  {/* ESISTENTE — spostato da grades: Pagella con media, tabella voti, condotta etc */}
  <Card className="p-6 border-2 border-secondary bg-card">
    {/* ... PAGELLA JSX identico all'attuale — tabella voti per materia,
        media totale, condotta, assenze, note, sospensioni ... */}
  </Card>

  {/* ESISTENTE — attualmente in CharacterSheet > scuola: GradeProgressPanel */}
  {schoolType ? (
    <>
      <GradeProgressPanel
        grades={grades}
        schoolType={schoolType}
        schoolYear={gameTime.schoolYear.currentYear}
      />
      {Object.keys(rawGradesHistory ?? {}).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Storico anni precedenti
          </h4>
          {Object.entries(rawGradesHistory ?? {})
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, histGrades]) => {
              const avg = Object.values(histGrades).length
                ? (Object.values(histGrades).reduce((s, v) => s + v, 0) /
                    Object.values(histGrades).length).toFixed(1)
                : '—'
              return (
                <div key={year} className="flex items-center justify-between px-2 py-1.5 rounded bg-muted/20 text-sm">
                  <span className="text-muted-foreground">Anno {year}°</span>
                  <span className="font-semibold">{avg}</span>
                </div>
              )
            })}
        </div>
      )}
    </>
  ) : (
    <p className="text-center text-muted-foreground py-8">
      Seleziona prima un indirizzo scolastico.
    </p>
  )}

  {/* ESISTENTE — spostato da grades: Corrompi/Minaccia */}
  <Card className="p-3 border-2 border-destructive bg-card">
    {/* ... Metodi Alternativi JSX identico all'attuale ... */}
  </Card>
</TabsContent>
```

### B4. Tab "verifiche" — ExamsPanel + Sistema Intelligenza

Contenuto identico all'attuale tab `exams`. **Nessuna modifica al JSX interno**, solo rinomina del TabsContent value.

```tsx
<TabsContent value="verifiche" className="space-y-6 mt-6">
  {/* ESISTENTE — invariato da exams: ExamsPanel */}
  <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento...</div>}>
    <ExamsPanel
      exams={scheduledExams}
      onPrepareExam={handlePrepareExam}
      actionsRemaining={phaseActionsRemaining ?? 0}
      stanchezza={stats.stanchezza}
    />
  </Suspense>

  {/* ESISTENTE — invariato da exams: Sistema Intelligenza */}
  <Card className="p-3 border-2 border-accent bg-card">
    {/* ... Sistema Intelligenza JSX identico all'attuale ... */}
  </Card>
</TabsContent>
```

### B5. Tab "amici" — EnhancedFriendsPanel filtrato + Sistema Carisma

Mostra **solo amici scolastici** (`compagno_classe` + `compagno_istituto`). La fidanzata NON appare qui (è in CharacterSheet > Relazioni).

```tsx
<TabsContent value="amici" className="space-y-6 mt-6">
  <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento...</div>}>
    <EnhancedFriendsPanel
      friends={friends.filter(f =>
        f.originType === 'compagno_classe' || f.originType === 'compagno_istituto'
      )}
      stats={stats}
      actionsRemaining={phaseActionsRemaining ?? 0}
      onFriendAction={handleFriendAction}
      onRelationInteraction={doInteraction}
      girlfriend={null}
      onGirlfriendAction={handleGirlfriendAction}
      onGirlfriendBreakup={handleGirlfriendBreakup}
    />
  </Suspense>

  {/* ESISTENTE — spostato da friends: Sistema Carisma */}
  <Card className="p-3 border-2 border-accent bg-card">
    {/* ... Sistema Carisma JSX identico all'attuale ... */}
  </Card>
</TabsContent>
```

**Nota**: `girlfriend={null}` impedisce la visualizzazione della sezione fidanzata nel tab amici scolastici. La fidanzata è visualizzata in CharacterSheet > Relazioni (tramite `RelationsPanel` → `EnhancedFriendsPanel`).

### B6. Tab "dashboard" — StatsDashboard (invariato)

```tsx
<TabsContent value="dashboard" className="space-y-6 mt-6">
  <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento dashboard...</div>}>
    <StatsDashboard stats={stats} grades={grades} />
  </Suspense>
</TabsContent>
```

**Verifica**: `npx tsc --noEmit` — nessun errore prima di proseguire con Passo C.

---

## PASSO C — Pulizia dead code in App.tsx

### C1. Rimuovi lazy import inutilizzati

In `src/App.tsx`, rimuovere le righe:
```typescript
// RIMUOVERE — ora importati direttamente in CharacterSheet.tsx:
const RelationsPanel = lazy(() => import('@/components/RelationsPanel').then(m => ({ default: m.RelationsPanel })))
const RelationshipsPanel = lazy(() => import('@/components/RelationshipsPanel').then(m => ({ default: m.RelationshipsPanel })))
```

Verificare anche se `FriendsPanel` (lazy import) è ancora usato. Se non lo è, rimuovere anche quello.

### C2. Mantieni EnhancedFriendsPanel

Il lazy import di `EnhancedFriendsPanel` in `App.tsx` resta — è usato in Passo B5 (tab "amici" nel pannello scuola).

### C3. NON eliminare file componenti

- `RelationshipsPanel.tsx` — **NON eliminare**, ora usato in CharacterSheet > Relazioni (Passo A5)
- `RelationsPanel.tsx` — **NON eliminare**, ora usato in CharacterSheet > Relazioni (Passo A5)

**Verifica finale**: `npx tsc --noEmit` — build pulito.

---

## Riepilogo cambiamenti per file

### `src/components/CharacterSheet.tsx`
- **Import**: aggiungere `UsersThree`, `RelationsPanel`, `RelationshipsPanel`, `Friend`, `Relationship`, `Ragazza`
- **Props**: aggiungere 9 nuove prop all'interfaccia e alla destrutturazione
- **TabsList**: rimuovere trigger `aspetto` (disabled), inserire trigger `relazioni` in 2ª posizione
- **TabsContent**: aggiungere `value="relazioni"` con `RelationsPanel` + `RelationshipsPanel`

### `src/App.tsx`
- **CharacterSheet render**: aggiungere 9 nuove prop
- **Pannello scuola**: ristrutturare sub-tab da `grades/exams/friends/dashboard` a `home/voti/verifiche/amici/dashboard`
- **Tab home**: nuovo sommario scolastico + spostare azioni scuola/events da grades
- **Tab voti**: spostare pagella + aggiungere GradeProgressPanel + gradesHistory + corrompi/minaccia
- **Tab verifiche**: rinomina di `exams`, contenuto invariato
- **Tab amici**: nuovo — EnhancedFriendsPanel filtrato solo scolastici + sistema carisma
- **Tab dashboard**: invariato
- **Import**: rimuovere lazy `RelationsPanel` e `RelationshipsPanel`

### File NON modificati
- `EnhancedFriendsPanel.tsx`, `RelationsPanel.tsx`, `RelationshipsPanel.tsx`
- `GradeProgressPanel.tsx`, `StatsDashboard.tsx`, `ExamsPanel.tsx`
- Tutti i file in `src/lib/`
- Tutti gli hook in `src/hooks/`

---

## Istruzioni operative

1. Leggere ogni file PRIMA di modificarlo
2. Eseguire `npx tsc --noEmit` dopo OGNI passo (A, B, C)
3. NON spostare o rinominare JSX esistente — fare copia + rimozione dell'originale per evitare regressioni
4. Verificare che le card "Sistema Intelligenza" e "Sistema Carisma" mantengano il JSX esatto (inclusi i confronti con `{'>'}`)
5. Il messaggio contestuale in B2 usa IIFE `(() => { ... })()` — assicurarsi che i return JSX siano corretti

**Commit**: `feat(ui): relazioni in CharacterSheet, home scuola con sommario, tab amici scolastici`  
**Conferma finale**: `✅ Riorganizzazione UI completata — build pulito`
