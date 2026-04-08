# Piano di Completamento — Fasi 9 e 10

<!-- status: READY -->
<!-- linked-todo: docs/TODO.md -->
<!-- generato: 08 Apr 2026 -->
<!-- base: analisi codebase diretta + Piano Correttivo v3 originale -->

---

## 0. Contesto e Baseline

Stato al momento della generazione di questo piano:

| Metrica | Valore | Target |
|---------|--------|--------|
| App.tsx righe | 1197 | < 800 |
| useGameActions.ts righe | 1045 | < 200 (facciata) |
| GameDialogs.tsx righe | 334 | < 100 (orchestratore) |
| `npx tsc --noEmit` | zero errori | zero errori |

**STEP 1–8**: completati e verificati.

**STEP 9** (avviato, non completato):
- I 4 tab (`SchoolTab`, `CityTab`, `SocialTab`, `StatusTab`) esistono e sono integrati in App.tsx.
- Le funzioni pure `buildSchoolDayState`, `computeEventGradeChange`, `computeReportCardVerdict` esistono in `school-actions.ts` e `school-event-handlers.ts`.
- **Mancano**: riduzione App.tsx < 800, memoizzazione `gameDialogsProps`, test funzioni pure.

**STEP 10** (non iniziato):
- `useGameActions.ts` = 1045 righe, da dividere in 4 sotto-hook.
- `GameDialogs.tsx` = 334 righe, da dividere in dialog individuali.

**STEP 11** (futuro, invariato): da pianificare separatamente.

Item residuo da STEP 4:
- `generateRandomFriend` in `social-system.ts` NON marcato `@deprecated`.

---

## 1. Nota su item residui pre-STEP 9

Prima di procedere con STEP 9, applicare questi due interventi rapidi (< 5 min):

### 1A — @deprecated su generateRandomFriend

**File**: `src/lib/social-system.ts` riga ~15
**Azione**: aggiungere JSDoc `@deprecated` prima della funzione:
```typescript
/**
 * @deprecated Usare invece le funzioni di `enhanced-friend-system.ts`.
 * Mantenuta per compatibilità con `useEventEngine.ts`.
 */
export const generateRandomFriend = ...
```

### 1B — Commenti scala obsoleta

**File**: `src/lib/types.ts` (righe ~520, ~548), `src/components/TeachersPanel.tsx` (righe ~19, ~33),
`src/components/SchoolHomePanel.tsx` (~36), `src/lib/classmate-relations.ts` (~77)
**Azione**: aggiornare commenti inline da `[-100,+100]` a `[0,100]` dove i commenti si riferiscono
al sistema attuale (non a porzioni legacy o range di selezione).

---

## 2. STEP 9 — Completamento (target: App.tsx < 800 righe)

Il piano suddivide il completamento in 4 sotto-sessioni indipendenti e ordinabili.

### STEP 9.1 — Memoizzazione gameDialogsProps   [~30 min | Rischio: Basso]

**File**: `src/App.tsx`

Obiettivo: sostituire il singolo oggetto `gameDialogsProps` con 3 const memoizzate.
Non riduce il numero di righe, ma elimina i re-render di `GameDialogs` ad ogni render di App.
È il prerequisito dichiarato del piano originale.

```tsx
const schoolDialogProps = useMemo(() => ({
  showReportCard, grades, currentMedia, reportCardPassed,
  schoolYear: gameTime.schoolYear.currentYear,
  handleReportCardContinue, condotta: schoolRecord.condotta,
  assenze: schoolRecord.assenze, showSchoolEvent, schoolEvent,
  handleSchoolEventChoice, setShowSchoolEvent,
  showSubjectDialog, setShowSubjectDialog, handleStudySubject,
  showTeacherDialog, setShowTeacherDialog, handleTeacherSelection,
  teacherActionType,
}), [showReportCard, grades, currentMedia, reportCardPassed,
     gameTime.schoolYear.currentYear, handleReportCardContinue,
     schoolRecord.condotta, schoolRecord.assenze, showSchoolEvent,
     schoolEvent, handleSchoolEventChoice, showSubjectDialog,
     handleStudySubject, showTeacherDialog, handleTeacherSelection,
     teacherActionType])

const cityDialogProps = useMemo(() => ({
  showMetallariEvent, setShowMetallariEvent, currentEvent,
  handleMetallariScappa, handleMetallariCombatti,
  showPoliceEvent, setShowPoliceEvent, handlePoliceScappa, handlePoliceCollabora,
  showStreetRaceEvent, setShowStreetRaceEvent, raceWinChance,
  handleStreetRaceRifiuta, handleStreetRaceAccetta,
  soldi: stats.soldi,
}), [showMetallariEvent, currentEvent, handleMetallariScappa,
     handleMetallariCombatti, showPoliceEvent, handlePoliceScappa,
     handlePoliceCollabora, showStreetRaceEvent, raceWinChance,
     handleStreetRaceRifiuta, handleStreetRaceAccetta, stats.soldi])

const socialDialogProps = useMemo(() => ({
  showAtipaEvent, setShowAtipaEvent, atipaSuccessChance,
  handleAtipaRinuncia, handleAtipaProva,
  showBulliEvent, setShowBulliEvent, handleBulliCedi, handleBulliResisti,
  showKeyboardHelp, setShowKeyboardHelp,
  stanchezza: stats.stanchezza,
  gameOver, gameOverReason, handleReset,
  showResetDialog, setShowResetDialog,
}), [showAtipaEvent, atipaSuccessChance, handleAtipaRinuncia, handleAtipaProva,
     showBulliEvent, handleBulliCedi, handleBulliResisti,
     showKeyboardHelp, stats.stanchezza, gameOver, gameOverReason,
     handleReset, showResetDialog])
```

Il componente `<GameDialogs>` riceverà allora:
```tsx
<GameDialogs
  {...schoolDialogProps}
  {...cityDialogProps}
  {...socialDialogProps}
/>
```

---

### STEP 9.2 — Estrazione useSchoolHandlers   [~2h | Rischio: Medio]

**Nuovo file**: `src/hooks/useSchoolHandlers.ts`
**Righe stimate**: ~240 righe
**Risparmio in App.tsx**: ~260 righe

Questo hook estrae tutti i handler scolastici che restano inline in App.tsx:

| Handler | Righe circa | Dipendenze chiave |
|---------|-------------|-------------------|
| `handleVaiAScuola` | 50 | stats, schoolRecord, consumeAllMorningActions, buildSchoolDayState, announce, addLogEntry |
| `handleMarina` | 20 | schoolRecord, drawStreetMorningEvents, handleMarinaFromHook |
| `handleSchoolEventChoice` | 55 | schoolEvent, setStats, setGrades, setSchoolRecord, announce, addLogEntry, computeEventGradeChange |
| `handleReportCardContinue` | 45 | grades, schoolType, schoolRecord, computeReportCardVerdict, archiveYearGrades, applyYearTransition |
| `handleOpenCorrompiDialog` | 10 | stats, phaseActionsRemaining |
| `handleOpenMinacciaDialog` | 8 | phaseActionsRemaining |
| `handleTeacherSelection` | 6 | teacherActionType |
| `handleSchoolSelection` | 8 | setSchoolType, setPlayerProfile, etc. |
| `handlePromoteToFriend` | 18 | classRoster, promoteToFriend |
| Callback SchoolTab (6x) | 50 | setTeachers, setSchoolDayState, setClassRoster, setRawFriends |

**Firma del hook**:
```typescript
export interface UseSchoolHandlersParams {
  stats: GameStats
  setStats: React.Dispatch<React.SetStateAction<GameStats>>
  grades: SubjectGrades
  setGrades: ...
  schoolRecord: SchoolRecord
  setSchoolRecord: ...
  schoolType: SchoolType | null
  schoolEvent: SchoolEvent | null
  gameTime: GameTime
  timetable: WeeklyTimetable | null
  teachers: Teacher[]
  setTeachers: ...
  classRoster: Classmate[]
  setClassRoster: ...
  friends: Friend[]
  setRawFriends: ...
  gameWon: boolean
  phaseActionsRemaining: number
  currentPhase: Phase | null
  dayType: DayType | null
  teacherActionType: TeacherActionType
  setTeacherActionType: ...
  setShowTeacherDialog: ...
  setShowSchoolMorning: ...
  setSchoolMorningEvents: ...
  setShowStreetMorning: ...
  setStreetMorningEvents: ...
  setShowSchoolEvent: ...
  setSchoolEvent: ...
  setShowReportCard: ...
  setGameOver: ...
  setGameOverReason: ...
  rawGradesHistory: Record<number, SubjectGrades>
  setRawGradesHistory: ...
  setSchoolType: ...
  setPlayerProfile: ...
  setCurrentTheme: ...
  setGrades: ...
  consumeAllMorningActions: () => void
  consumeAction: () => void
  getTodaySchedule: (day: number) => TimetableSlot[]
  canAttendSchool: () => boolean
  handleMarinaFromHook: () => void
  handleCorrompiSubject: (subject: string) => void
  handleMinacciaSubject: (subject: string) => void
  handleStudySubject: (subject: string) => void
  applyTeacherRelationChange: typeof import('@/lib/teacher-relations').applyTeacherRelationChange
  setMorningChoicePending: React.Dispatch<React.SetStateAction<boolean>>
  setMarinatoOggi: React.Dispatch<React.SetStateAction<boolean>>
  setSchoolDayState: ...
  gainExtraAction: () => void
  announce: (msg: string) => void
  addLogEntry: (...) => void
  playSound: ...
}

export function useSchoolHandlers(params: UseSchoolHandlersParams) {
  // Tutti gli handler come useCallback con deps corretti
  return {
    handleVaiAScuola,
    handleMarina,
    handleSchoolEventChoice,
    handleReportCardContinue,
    handleOpenCorrompiDialog,
    handleOpenMinacciaDialog,
    handleTeacherSelection,
    handleSchoolSelection,
    handlePromoteToFriend,
    onTeacherInteraction,
    onSlotComplete,
    onBreakComplete,
    onTeacherChange,
    onClassmateChange,
    onNewFriend,
  }
}
```

> Nota importante: `handleSchoolEventChoice` e `handleReportCardContinue` usano già le funzioni pure di
> `school-event-handlers.ts`. L'hook non elimina queste dipendenze, le centralizza.

---

### STEP 9.3 — Estrazione DailyControls   [~45 min | Rischio: Basso]

**Nuovo file**: `src/components/DailyControls.tsx`
**Righe stimate**: ~120 righe
**Risparmio in App.tsx**: ~95 righe

Il blocco IIFE "Gestione Giornata" nel JSX di App.tsx (attualmente ~100 righe, compreso il codice
di calcolo label e il rendering di 3 pulsanti condizionali) diventa un componente dedicato.

**Props**:
```typescript
interface DailyControlsProps {
  phaseActionsRemaining: number
  isSchoolMorningSequenceInProgress: boolean
  currentPhase: Phase | null
  dayType: DayType | null
  isSchoolPeriod: boolean
  onRiposa: () => void
  onDormi: () => void
  onAdvancePhase: () => void
}
```

In App.tsx rimane solo:
```tsx
<DailyControls
  phaseActionsRemaining={phaseActionsRemaining ?? 0}
  isSchoolMorningSequenceInProgress={isSchoolMorningSequenceInProgress}
  currentPhase={currentPhase}
  dayType={dayType}
  isSchoolPeriod={gameTime.schoolYear.isSchoolPeriod}
  onRiposa={handleRiposa}
  onDormi={handleDormi}
  onAdvancePhase={handleAdvancePhaseGuarded}
/>
```

---

### STEP 9.4 — Estrazione useSchoolEffects   [~30 min | Rischio: Basso]

**Nuovo file**: `src/hooks/useSchoolEffects.ts`
**Righe stimate**: ~75 righe
**Risparmio in App.tsx**: ~58 righe

Estrae i 4 useEffect scolastici che rimangono in App.tsx dopo le estrazioni precedenti:

1. **Effect reset giornaliero** (F6: marinatoOggi, showStreetMorning, ecc. al cambio data)
2. **Effect nascondi SchoolMorning** quando si esce dalla mattina
3. **Effect morningChoicePending** (aggiorna il flag in base a fase/dayType/isSchoolPeriod)
4. **Effect assenze** (F4: soglie 15/25/35 con toast e game-over)
5. **Effect condotta** (F5: warning < 5, game-over < 1)

**Firma del hook**:
```typescript
export function useSchoolEffects(params: {
  gameTime: GameTime
  currentPhase: Phase | null
  dayType: DayType | null
  schoolRecord: SchoolRecord
  gameOver: boolean
  grades: SubjectGrades
  stats: GameStats
  marinatoOggi: boolean
  setMarinatoOggi: ...
  setMorningChoicePending: ...
  setShowSchoolMorning: ...
  setShowStreetMorning: ...
  setStreetMorningEvents: ...
  setSchoolMorningEvents: ...
  setStats: ...
  setSchoolRecord: ...
  setGameOver: ...
  setGameOverReason: ...
  setSchoolEvent: ...
  setShowSchoolEvent: ...
  announce: (msg: string) => void
  addLogEntry: (...) => void
}): void
```

---

### STEP 9.5 — Test funzioni pure   [~1h | Rischio: Nullo]

**Nuovi file**:
- `src/lib/__tests__/school-actions.test.ts`
- `src/lib/__tests__/school-event-handlers.test.ts`

**Test per `buildSchoolDayState`**:
```typescript
describe('buildSchoolDayState', () => {
  it('restituisce legacy quando timetable è null', () => { ... })
  it('restituisce legacy quando daySchedule ha < 6 slot', () => { ... })
  it('restituisce sequence con timetable completo', () => { ... })
})
```

**Test per `computeEventGradeChange`**:
```typescript
describe('computeEventGradeChange', () => {
  it('restituisce null se outcome senza gradeChanges', () => { ... })
  it('calcola correttamente il delta voto e la deltaMsg', () => { ... })
  it('clamp impedisce voti fuori [0,10]', () => { ... })
})
```

**Test per `computeReportCardVerdict`**:
```typescript
describe('computeReportCardVerdict', () => {
  it('game_won se gameWon è true', () => { ... })
  it('too_many_absences se assenze >= 35', () => { ... })
  it('bad_conduct se condotta < 6', () => { ... })
  it('passed se media >= soglia con condotta alta', () => { ... })
  it('failed se media < soglia', () => { ... })
})
```

> Nota: il progetto non ha ancora una configurazione test (nessun `vitest` o `jest`).
> Prima di scrivere i test verificare con `cat package.json | grep -i test` se è configurato.
> Se non c'è runner, configurare vitest (già usato negli step precedenti di questo tipo di progetto).

---

### STEP 9.6 — Verifica finale STEP 9

- `npx tsc --noEmit` → zero errori
- Contare righe App.tsx: deve essere < 800
- Smoke test manuale: navigare i 5 tab, vai a scuola, marina, avanza giornata

---

## 3. STEP 10 — Decomposizione useGameActions e GameDialogs

> Pre-condizioni: STEP 9 completato.

### STEP 10.1 — Split useGameActions in 4 hook   [~3h | Rischio: Medio]

**Nuovo file**: `src/hooks/useStudyActions.ts`
Handler da estrarre:
- `handleStudia`, `handleStudySubject`, `handleCorrompi`, `handleMinaccia`,
  `handleCorrompiSubject`, `handleMinacciaSubject`, `handlePrepareExam`

**Nuovo file**: `src/hooks/useSocialActions.ts`
Handler da estrarre:
- `handleDisco`, `handleCinema`, `handleChiacchiera`, `handleParco`,
  `handleTelefona`, `handleTryRelationship`, `handleProvarciConAtipa`

**Nuovo file**: `src/hooks/useGirlfriendActions.ts`
Handler da estrarre:
- `handleGirlfriendAction`, `handleGirlfriendBreakup`

**Nuovo file**: `src/hooks/useEconomyActions.ts`
Handler da estrarre:
- `handleLavoro`, `handleShoppingMall`, `handleMotorino`,
  `handlePalestra`, `handleLampada`, `handleRiposa`

**useGameActions.ts** diventa facciata < 200 righe:
```typescript
export function useGameActions(params) {
  const studyActions = useStudyActions(params)
  const socialActions = useSocialActions(params)
  const girlfriendActions = useGirlfriendActions(params)
  const economyActions = useEconomyActions(params)
  return { ...studyActions, ...socialActions, ...girlfriendActions, ...economyActions }
}
```

---

### STEP 10.2 — Split GameDialogs in dialog individuali   [~2h | Rischio: Basso]

**Nuovi file** in `src/components/dialogs/`:
- `MetallariDialog.tsx`
- `PoliceDialog.tsx`
- `StreetRaceDialog.tsx`
- `AtipaEventDialog.tsx`
- `BulliDialog.tsx`
- `GameOverDialog.tsx`
- `ResetDialog.tsx`
- `ReportCardDialog.tsx` (verificare se già esiste)
- `SchoolEventDialog.tsx` (verificare se già esiste)
- `SubjectSelectionDialog.tsx` (verificare se già esiste)
- `TeacherSelectionDialog.tsx` (verificare se già esiste)

**GameDialogs.tsx** diventa orchestratore < 100 righe:
```tsx
export const GameDialogs = memo(function GameDialogs(props: GameDialogsProps) {
  return (
    <>
      <MetallariDialog {...pick(props, metKeys)} />
      <PoliceDialog {...pick(props, policeKeys)} />
      {/* ... */}
    </>
  )
})
```

---

### STEP 10.3 — Verifica finale STEP 10

- `npx tsc --noEmit` → zero errori
- `useGameActions.ts` < 200 righe
- `GameDialogs.tsx` < 100 righe
- Ogni sotto-hook e sotto-dialog ha singola responsabilità
- Smoke test manuale completo

---

## 4. Ordine di esecuzione raccomandato

```
Items residui (1A + 1B)        → ~10 min
STEP 9.1 (gameDialogsProps)    → ~30 min
STEP 9.2 (useSchoolHandlers)   → ~120 min
STEP 9.3 (DailyControls)       → ~45 min
STEP 9.4 (useSchoolEffects)    → ~30 min
STEP 9.5 (test funzioni pure)  → ~60 min
STEP 9.6 (verifica)            → ~15 min
─────────────────────────────────────────
STEP 9 totale                  → ~5.5h

STEP 10.1 (split useGameActions) → ~180 min
STEP 10.2 (split GameDialogs)    → ~120 min
STEP 10.3 (verifica)             → ~20 min
─────────────────────────────────────────
STEP 10 totale                   → ~5.5h
```

## 5. Stima risparmio righe STEP 9

| Estrazione | Righe risparmiate in App.tsx |
|------------|------------------------------|
| useSchoolHandlers | ~260 |
| DailyControls | ~95 |
| useSchoolEffects | ~58 |
| Totale | **~413 righe** |

Da 1197 → ~784 righe. Target < 800 raggiunto. ✓
