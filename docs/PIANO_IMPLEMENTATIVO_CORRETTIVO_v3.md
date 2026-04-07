# Piano Implementativo Correttivo v3 - Validato

> Generato: 08 Apr 2026
> Stato: VALIDATO contro il codice sorgente corrente
> Base: Piano Correttivo Definitivo v3 (fusione v1 Opus + v2 Claude + verifica diretta)

> Aggiornamento validazione patch: 08 Apr 2026

Patch review successiva al piano:
- PATCH 1: respinta. `migrateLegacyFriend()` non usa `schemaVersion`; il discriminante `relation < 0` resta sufficiente per distinguere il legacy `[-100,+100]` dalla nuova scala `[0,100]`.
- PATCH 2: respinta. `ISTERESI` e' un delta proporzionale al range; nella migrazione tecnica va mantenuta l'equivalenza di comportamento, quindi `20 -> 10` resta corretto.
- PATCH 3: accolta. `classmateRelationToFriendship()` e' usata anche in `src/lib/school-roster-transitions.ts` e il piano e' stato aggiornato.
- PATCH 4: accolta con correzione. `gameDialogsProps` contiene 51 props reali, non ~30; la strategia corretta e' spezzarlo in sotto-oggetti memoizzati per dominio.

---

## Esito Validazione

| Item | Esito | Nota |
|------|-------|------|
| R1 | CONFERMATO | `girlfriend={null}` hardcoded riga ~1650 App.tsx (tab amici) |
| R2 | CONFERMATO | FriendsPanel.tsx: zero import, dead code |
| R3 | CONFERMATO | SUBJECT_WEIGHTS in types.ts: `@deprecated`, zero utilizzi |
| R17 | RIMOSSO | ErrorBoundary GIA' attivo in main.tsx riga 12 con ErrorFallback.tsx |
| R4a-d | CONFERMATO | classmate/teacher usano [-100,+100], Friend usa [0,100]. Formula conversione `(r+100)/2` |
| R5 | CONFERMATO | Nessun file costanti centralizzato. Costanti sparse in 12+ file |
| R7 | CONFERMATO | 14 inline clamp, 20+ clampStat(). Inconsistente |
| R4e-g | CONFERMATO | useGameRelations ha solo doInteraction. TeachersPanel e SchoolBreakPanel bypassano l'hub |
| R6 | CONFERMATO | Due booleani separati (showSchoolMorning, showStreetMorning) in useAppDialogs |
| R16 | CONFERMATO | 6 ActionButton con pattern disabled/blockedReason ripetuto in CityPanel |
| R8 | CONFERMATO | Zero React.memo su CharacterSheet, GameDialogs, GirlfriendPanel. gameDialogsProps non memoizzato |
| R12 | CONFERMATO | RelationsPanel (amici) vs RelationshipsPanel (romantico): naming confuso |
| R14 | CONFERMATO | aria-label/role mancanti su GradeProgressPanel, CityPanel, RelationshipsPanel, SchoolEventDialog |
| R15 | PARZIALE | RelationshipsPanel HA GIA' stato vuoto. Solo GradeProgressPanel e TeacherSelectionDialog da fixare |
| R13 | CONFERMATO | Nessun useSoundFeedback. GirlfriendPanel e EnhancedFriendsPanel sono muti |
| R19 | CONFERMATO | Formula `Math.min(soldi/10, 100)` con 6 pesi hardcoded inline (game-utils.ts L122-138) |
| R9 | CONFERMATO | App.tsx = 1843 righe, 3 handler inline (72+80+70 righe) |
| R10 | CONFERMATO | useGameActions.ts = 1046 righe, 23 handler |
| R11 | CONFERMATO | GameDialogs.tsx = ~500 righe, 11 dialog renderizzati |

---

## STEP 1 - Quick Win (Rischio Zero)

**Effort**: ~20 min | **Sessioni**: 1 | **Rischio**: Nullo

### R1 - Fix girlfriend prop hardcoded

**File**: `src/App.tsx` riga ~1650
**Problema**: Nel tab "amici", `<EnhancedFriendsPanel>` riceve `girlfriend={null}` hardcoded
**Soluzione**: Sostituire con `girlfriend={girlfriend ?? null}`

```tsx
// PRIMA (riga ~1650)
girlfriend={null}

// DOPO
girlfriend={girlfriend ?? null}
```

**Verifica**: Il tab "amici" mostrera' correttamente lo stato fidanzata se presente.

---

### R2 - Elimina FriendsPanel.tsx (dead code)

**File**: `src/components/FriendsPanel.tsx`
**Problema**: Mai importato da nessun file. Sostituito da EnhancedFriendsPanel.
**Azione**: Eliminare il file.
**Verifica**: `grep -r "FriendsPanel" src/` deve restituire zero risultati (escluso EnhancedFriendsPanel).

---

### R3 - Elimina SUBJECT_WEIGHTS deprecato

**File**: `src/lib/types.ts` riga ~111
**Problema**: Costante marcata `@deprecated`, zero utilizzi nel codice.
**Azione**: Rimuovere l'intero blocco `export const SUBJECT_WEIGHTS`.
**Verifica**: Build deve passare senza errori. `grep -r "SUBJECT_WEIGHTS" src/` deve restituire 0.

---

### ~~R17~~ - RIMOSSO (gia' implementato)

ErrorBoundary e' gia' attivo in `src/main.tsx` riga 12:
```tsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
  <Toaster position="top-center" richColors />
</ErrorBoundary>
```

---

## STEP 2 - Scala Relazioni (Priorita' Anticipata)

**Effort**: ~2h | **Sessioni**: 1 | **Rischio**: Medio (tocca sistema relazioni)

### R4a - classmate-relations.ts: scala [0,100]

**File**: `src/lib/classmate-relations.ts`
**Stato attuale**:
- Righe 8-9: `RELATION_MIN = -100`, `RELATION_MAX = 100`
- Riga 11: `PROMOTION_THRESHOLD = 30`
- Riga 91: clamp con `Math.max(RELATION_MIN, Math.min(RELATION_MAX, ...))`
- Riga 77-79: formula conversione `(relation + 100) / 2`

**Modifiche**:
1. Cambiare `RELATION_MIN = 0`, `RELATION_MAX = 100`
2. Valore neutro iniziale: `50` (era `0` su scala [-100,+100])
3. `PROMOTION_THRESHOLD = 65` (equivalente del vecchio 30 sulla nuova scala: `(30+100)/2 = 65`)
4. Aggiornare tutti i delta delle interazioni (righe ~52-60):
   - I delta restano invariati come valori assoluti
   - Il clamp ora opera su [0,100]
5. Rimuovere `classmateRelationToFriendship()` (la formula diventa identita')

**Interazioni da ricalcolare** (riga 52-60):
```
chiacchiera: [3, 8]    -> invariato
studia_insieme: [2, 5]  -> invariato
litiga: [-20, -10]       -> invariato (clamp impedisce < 0)
aiuta: [5, 10]           -> invariato
ignora: [-3, -1]         -> invariato
scherzo: [-5, 5]         -> invariato
```

---

### R4b - Reset KV al posto della migrazione lazy

**Non serve nessuna funzione migrateClassmate().**

Il progetto non e' distribuito: l'unico tester e' lo sviluppatore.
Non esistono salvataggi legacy da preservare.

**Procedura operativa per Step 2**:
Prima di eseguire le modifiche a classmate-relations.ts e teacher-relations.ts,
cancellare il localStorage dal browser (DevTools -> Application -> Local Storage -> Clear All).
Il gioco ripartira' con tutti i valori relazioni gia' sulla nuova scala [0,100].

Eliminare anche migrateTeacher() dalla sezione R4c per lo stesso motivo.

---

### R4c - teacher-relations.ts: scala [0,100]

**File**: `src/lib/teacher-relations.ts`
**Stato attuale**:
- Righe 8-9: `RELATION_MIN = -100`, `RELATION_MAX = 100`
- Riga 11: `ISTERESI = 20`
- Riga 18-23: `sogliaRottura` con isteresi

**Modifiche**:
1. Cambiare `RELATION_MIN = 0`, `RELATION_MAX = 100`
2. Valore neutro iniziale: `50`
3. `sogliaRottura` iniziale: aggiornare da range [-100,+100] a [0,100]
   - Es: se prima era `-30`, ora sara' `(−30+100)/2 = 35`
4. `ISTERESI` resta `20` (e' un delta, non un valore assoluto) ma va aggiustato proporzionalmente: sulla nuova scala il range e' meta', quindi `ISTERESI = 10`
5. Funzione `clamp()` privata (riga 19-21) va aggiornata per [0,100]
6. `CORRUPTION_CHANCE_MIN/MAX` e `THREAT_CHANCE_MIN/MAX` sono gia' in percentuale, non cambiano.
7. `MAX_MEMORIA = 20` non cambia (e' un contatore, non un valore scala)

**Nota di validazione**: il dimezzamento di `ISTERESI` non e' una scelta di bilanciamento separata ma un riallineamento tecnico del delta rispetto al nuovo range. Mantenere `20` su scala `[0,100]` raddoppierebbe l'inerzia del sistema rispetto al comportamento attuale.

---

### R4d - promoteToFriend(): mappatura diretta

**File**: `src/lib/classmate-relations.ts` riga ~107
**Stato attuale**: Crea Friend con `amicizia = classmateRelationToFriendship(classmate)`
**Dopo R4a**: `classmateRelationToFriendship` non serve piu': `amicizia = classmate.relation` direttamente.

```typescript
// PRIMA
rel: {
  amicizia: classmateRelationToFriendship(classmate),
  ...
}

// DOPO
rel: {
  amicizia: classmate.relation,  // Scala gia' [0,100]
  romantico: 0,
  amore: 0,
  odio: 0,
}
```

**Nota**: Dopo la promozione, il Friend entra nel sistema 4-assi di `useGameRelations.doInteraction`.

**Aggiornamento necessario anche in `src/lib/school-roster-transitions.ts`**:
- Rimuovere import di `classmateRelationToFriendship`
- Sostituire ogni chiamata con accesso diretto a `classmate.relation`
- Accesso diretto a `.relation` nei punti di transizione roster (dopo reset localStorage)

---

## STEP 3 - Fondamenta Centralizzazione

**Effort**: ~2h | **Sessioni**: 1 | **Rischio**: Basso

### R5 - game-balance.constants.ts

**Nuovo file**: `src/lib/game-balance.constants.ts`

**Contenuto** (estratto dalle costanti trovate in validazione):

```typescript
// Limiti statistiche
export const STAT_CAPS = {
  default: { min: 0, max: 100 },
  soldi:   { min: 0, max: 1000 },
  media:   { min: 0, max: 10 },
} as const

// Relazioni (nuova scala unificata)
export const RELATION = {
  MIN: 0,
  MAX: 100,
  NEUTRAL: 50,
  CLASSMATE_PROMOTION_THRESHOLD: 65,
  TEACHER_ISTERESI: 10,
} as const

// Economia
export const ECONOMY = {
  PAGHETTA_SETTIMANALE: 50,
  PALESTRA_COSTO: 20,
  LAMPADA_COSTO: 30,
  CORRUZIONE_COSTO: 50,
  BAR_COSTO: 2,
  DISCO_COSTO: 30,
  CINEMA_COSTO: 15,
  SHOPPING_COSTO: 40,
} as const

// Scuola
export const SCHOOL = {
  ASSENZE_SCANDALO: 35,
  ASSENZE_WARNING: 25,
  ASSENZE_MULTA: 15,
  MULTA_IMPORTO: 50,
  CONDOTTA_BONUS_INTERVALLO: 5,  // ogni N giorni
  CONDOTTA_BONUS_VALORE: 0.3,
  EXAM_CHANCE_PER_DAY: 0.30,
  MAX_SCHEDULED_EXAMS: 3,
} as const

// Formula reputazione
export const REPUTATION_WEIGHTS = {
  coattaggine: 0.25,
  muscoli: 0.15,
  figosita: 0.20,
  soldi: 0.10,
  media: 0.10,
  carisma: 0.20,
} as const

// Scommesse
export const BET = {
  BASE_AMOUNT: 10,
  REP_MULTIPLIER: 5,
  REP_DIVISOR: 20,
  DIFF_MULTIPLIER: 5,
  MAX_BET: 60,
} as const
```

**Impatto**: I file consumer importeranno da qui invece di hardcodare.

---

### R7 - Sostituzione inline clamp con clampStat()

**File interessati** (14 istanze trovate):

| File | Riga | Pattern inline | Sostituzione |
|------|------|----------------|-------------|
| `data-validation.ts` | 130 | `Math.max(0, Math.min(...))` | `clampStat(val, 0, max)` |
| `data-validation.ts` | 170 | `Math.min(100, Math.max(0, ...))` | `clampStat(val)` |
| `data-validation.ts` | 172 | `Math.min(100, Math.max(0, ...))` | `clampStat(val)` |
| `classmate-relations.ts` | 91 | `Math.max(MIN, Math.min(MAX, ...))` | `clampStat(val, RELATION.MIN, RELATION.MAX)` |
| `relation-system.ts` | 431-435 | 5x `Math.max(0, Math.min(100, ...))` | 5x `clampStat(Math.round(val))` |
| `relation-system.ts` | 529 | `Math.max(0, Math.min(100, ...))` | `clampStat(val)` |
| `girlfriend-system.ts` | 533 | `Math.max(0, Math.min(100, ...))` | `clampStat(val)` |
| `enhanced-friend-system.ts` | 294, 298 | 2x `Math.max(0, Math.min(100, ...))` | 2x `clampStat(val)` |
| `school-timetable.ts` | 137 | `Math.max(0, Math.min(4, ...))` | `clampStat(val, 0, 4)` |

**Nota**: `teacher-relations.ts` ha un `clamp()` privato (riga 19-21) che sara' sostituito dall'import di `clampStat`.

---

### R7b - clampStat() esteso con STAT_CAPS

**File**: `src/lib/game-utils.ts` riga 3-5

```typescript
// PRIMA
export const clampStat = (value: number, min: number = 0, max: number = 100): number => {
  return Math.max(min, Math.min(max, value))
}

// DOPO (retrocompatibile)
import { STAT_CAPS } from './game-balance.constants'

export const clampStat = (
  value: number,
  minOrKey?: number | keyof typeof STAT_CAPS,
  max?: number
): number => {
  if (typeof minOrKey === 'string') {
    const caps = STAT_CAPS[minOrKey] ?? STAT_CAPS.default
    return Math.max(caps.min, Math.min(caps.max, value))
  }
  return Math.max(minOrKey ?? 0, Math.min(max ?? 100, value))
}
```

---

## STEP 4 - useGameRelations come Hub Unico

**Effort**: ~1.5h | **Sessioni**: 1 | **Rischio**: Medio

### R4e - doClassmateInteraction()

**File**: `src/hooks/useGameRelations.ts`
**Azione**: Aggiungere metodo seguendo il pattern di `doInteraction` (riga 36-103):

```typescript
const doClassmateInteraction = useCallback((
  classmateId: string,
  interactionKey: string
) => {
  // 1. Trova classmate nel roster
  // 2. Applica interazione via applyClassmateRelation()
  // 3. Aggiorna roster
  // 4. Se supera soglia promozione, segnala
  // 5. Ritorna risultato
}, [/* deps */])
```

---

### R4f - doTeacherInteraction()

**File**: `src/hooks/useGameRelations.ts`
**Azione**: Aggiungere metodo per interazioni insegnante:

```typescript
const doTeacherInteraction = useCallback((
  teacherId: string,
  interactionKey: string
) => {
  // 1. Trova teacher nel roster
  // 2. Applica via applyTeacherRelationChange()
  // 3. Aggiorna roster
  // 4. Controlla ostilita' (isteresi)
  // 5. Ritorna risultato
}, [/* deps */])
```

---

### R4g - Pannelli passano per l'hub

**File coinvolti**:
- `src/components/TeachersPanel.tsx` riga 16: rimuovere import diretto di `applyTeacherRelationChange`
- `src/components/SchoolBreakPanel.tsx`: rimuovere import diretti
- `src/lib/school-break-actions.ts` riga 144: le funzioni pure del dominio continuano a usare le funzioni di lib; l'hub e' a livello hook/componente

**Pattern**:
```tsx
// PRIMA (TeachersPanel.tsx)
import { applyTeacherRelationChange } from '@/lib/teacher-relations'
const updated = applyTeacherRelationChange(teacher, delta, 'conversazione', currentDate)

// DOPO
// TeachersPanel riceve doTeacherInteraction come prop da App.tsx
onTeacherInteraction(teacher.id, 'conversazione')
```

**Deprecazione social-system.ts**: Marcare `generateRandomFriend` come `@deprecated` con JSDoc che rimanda a `enhanced-friend-system.ts`. Non eliminare ancora (usata in useEventEngine).

---

## STEP 5 - Stato App e UI Core

**Effort**: ~1.5h | **Sessioni**: 1 | **Rischio**: Basso

### R6 - morningDisplay enum

**File**: `src/hooks/useAppDialogs.ts` righe 15-18

```typescript
// PRIMA
const [showSchoolMorning, setShowSchoolMorning] = useState(false)
const [showStreetMorning, setShowStreetMorning] = useState(false)

// DOPO
type MorningDisplay = 'school' | 'street' | null
const [morningDisplay, setMorningDisplay] = useState<MorningDisplay>(null)
```

**Impatto su App.tsx** (riga ~148-151): Aggiornare destructuring e tutti i punti dove si usano i due booleani separati. Pattern:
- `showSchoolMorning` diventa `morningDisplay === 'school'`
- `setShowSchoolMorning(true)` diventa `setMorningDisplay('school')`
- `setShowSchoolMorning(false)` diventa `setMorningDisplay(null)`

---

### R16 - Helper cityActionDisabled()

**File**: `src/components/CityPanel.tsx`
**Stato attuale**: 6 ActionButton con pattern disabled/blockedReason ripetuto (righe 62-163)

**Soluzione**: Creare helper locale nel file:

```typescript
type CostCheck = { type: 'money'; min: number } | { type: 'energy'; max: number }

function getActionState(
  morningChoicePending: boolean,
  actionsRemaining: number,
  stats: GameStats,
  cost?: CostCheck
): { disabled: boolean; blockedReason: string } {
  if (morningChoicePending) return {
    disabled: true,
    blockedReason: 'Scegli prima se andare a scuola o marinare!'
  }
  if (actionsRemaining <= 0) return {
    disabled: true,
    blockedReason: 'Nessuna azione per questa fascia oraria'
  }
  if (cost?.type === 'money' && stats.soldi < cost.min) return {
    disabled: true,
    blockedReason: `Servono almeno ${cost.min} euro`
  }
  if (cost?.type === 'energy' && stats.stanchezza > cost.max) return {
    disabled: true,
    blockedReason: 'Sei troppo stanco!'
  }
  return { disabled: false, blockedReason: '' }
}
```

---

### R8 - React.memo e useMemo

**File coinvolti**:

1. `src/components/CharacterSheet.tsx` riga ~38:
   ```tsx
   export const CharacterSheet = React.memo(function CharacterSheet(props: Props) { ... })
   ```

2. `src/components/GameDialogs.tsx` riga ~67:
   ```tsx
   export const GameDialogs = React.memo(function GameDialogs(props: Props) { ... })
   ```

3. `src/components/GirlfriendPanel.tsx` riga ~40:
   ```tsx
   export const GirlfriendPanel = React.memo(function GirlfriendPanel(props: Props) { ... })
   ```

4. `src/App.tsx` riga ~860-920 — gameDialogsProps:
   ```tsx
   const schoolDialogProps = useMemo(() => ({
     showReportCard,
     grades,
     currentMedia,
     reportCardPassed,
     schoolYear: gameTime.schoolYear.currentYear,
     handleReportCardContinue,
     condotta: schoolRecord.condotta,
     assenze: schoolRecord.assenze,
     showSchoolEvent,
     schoolEvent,
     handleSchoolEventChoice,
     setShowSchoolEvent,
     showSubjectDialog,
     setShowSubjectDialog,
     handleStudySubject,
     showTeacherDialog,
     setShowTeacherDialog,
     handleTeacherSelection,
     teacherActionType,
   }), [/* deps scuola */])

   const cityDialogProps = useMemo(() => ({
     showMetallariEvent,
     setShowMetallariEvent,
     currentEvent,
     handleMetallariScappa,
     handleMetallariCombatti,
     showPoliceEvent,
     setShowPoliceEvent,
     handlePoliceScappa,
     handlePoliceCollabora,
     showStreetRaceEvent,
     setShowStreetRaceEvent,
     raceWinChance,
     handleStreetRaceRifiuta,
     handleStreetRaceAccetta,
     soldi: stats.soldi,
   }), [/* deps citta' */])

   const socialDialogProps = useMemo(() => ({
     showAtipaEvent,
     setShowAtipaEvent,
     atipaSuccessChance,
     handleAtipaRinuncia,
     handleAtipaProva,
     showBulliEvent,
     setShowBulliEvent,
     handleBulliCedi,
     handleBulliResisti,
     showKeyboardHelp,
     setShowKeyboardHelp,
     stanchezza: stats.stanchezza,
     gameOver,
     gameOverReason,
     handleReset,
     showResetDialog,
     setShowResetDialog,
   }), [/* deps social */])
   ```

**Nota**: `gameDialogsProps` non ha ~30 dipendenze ma 51 props reali. Un singolo `useMemo` monolitico ha scarso valore pratico; la soluzione compatibile con lo split dei tab in Step 9 e' spezzare il wiring in sotto-oggetti memoizzati per dominio. `GameDialogs` ricevera' `school={...}` `city={...}` `social={...}` invece di una superficie piatta.

---

## STEP 6 - Naming, Stati Vuoti e Accessibilita'

**Effort**: ~2h | **Sessioni**: 1 | **Rischio**: Basso

### R12 - Rinomina RelationsPanel

**File**: `src/components/RelationsPanel.tsx`
**Azione**: Rinominare file e componente in `FriendshipsPanel.tsx`
**Impatto**: Aggiornare import in App.tsx e qualsiasi altro importatore.
**JSDoc**: Aggiungere header documentazione a tutti i pannelli relazionali:
- `FriendshipsPanel` (ex RelationsPanel): gestione amicizie filtrate per origine
- `RelationshipsPanel`: sistema conquista romantica
- `EnhancedFriendsPanel`: dettaglio amicizia con sistema 4-assi

---

### R15 - Stati vuoti mancanti

**File 1**: `src/components/GradeProgressPanel.tsx`
- Aggiungere check `if (gpaSubjects.length === 0)` con messaggio "Nessuna materia disponibile"
- Includere icona e testo accessibile

**File 2**: `src/components/TeacherSelectionDialog.tsx`
- Aggiungere check per `subjects.length === 0` (edge case difensivo)
- Messaggio: "Nessuna materia disponibile per questa azione"

**Nota**: `RelationshipsPanel.tsx` ha GIA' lo stato vuoto (righe 95-102). Non serve intervento.

---

### R14 - aria-label e role mancanti

| File | Elemento | Aggiunta |
|------|----------|----------|
| `GradeProgressPanel.tsx` | `<div>` root | `role="region" aria-label="Progresso voti"` |
| `CityPanel.tsx` | `<div>` root | `role="region" aria-label="Pannello citta'"` |
| `RelationshipsPanel.tsx` | `<div>` root | `role="region" aria-label="Relazioni sentimentali"` |
| `SchoolEventDialog.tsx` | `<AlertDialogContent>` | `aria-label="Evento scolastico"` (verificare se Radix lo fornisce gia') |

---

## STEP 7 - Audio Unificato

**Effort**: ~1h | **Sessioni**: 1 | **Rischio**: Basso

### R13 - useSoundFeedback hook

**Nuovo file**: `src/hooks/useSoundFeedback.ts`

```typescript
import { playSound } from '@/lib/sound-effects'

type SoundAction =
  | 'success' | 'failure'
  | 'statUp' | 'statDown'
  | 'moneySpent' | 'moneyEarned'
  | 'bigWin' | 'bigLoss'
  | 'event' | 'danger'
  | 'reputationUp' | 'gameOver'
  | 'click' | 'reset'

const ACTION_SOUND_MAP: Record<SoundAction, () => void> = {
  success: playSound.success,
  failure: playSound.failure,
  statUp: playSound.statIncrease,
  statDown: playSound.statDecrease,
  moneySpent: playSound.moneySpent,
  moneyEarned: playSound.moneyEarned,
  bigWin: playSound.bigWin,
  bigLoss: playSound.bigLoss,
  event: playSound.eventTrigger,
  danger: playSound.dangerAlert,
  reputationUp: playSound.reputationUp,
  gameOver: playSound.gameOver,
  click: playSound.buttonClick,
  reset: playSound.reset,
}

export function useSoundFeedback() {
  const play = useCallback((action: SoundAction) => {
    ACTION_SOUND_MAP[action]?.()
  }, [])

  return { play }
}
```

### R13b - Aggiornamento pannelli muti

**GirlfriendPanel.tsx**: Aggiungere import e uso di `useSoundFeedback`:
- Azione riuscita -> `play('success')`
- Azione fallita -> `play('failure')`
- Dichiarazione -> `play('bigWin')` / `play('bigLoss')`

**EnhancedFriendsPanel.tsx**: Analogo pattern per interazioni amicizia.

### R13c - CityPanel allineamento

**CityPanel.tsx**: Attualmente delega suoni agli handler di App.tsx. Valutare se aggiungere feedback sonoro diretto per azioni UI (click su bottone) tramite `play('click')`.

---

## STEP 8 - Bilanciamento Formula Reputazione

**Effort**: ~1h | **Sessioni**: 1 | **Rischio**: Medio (gameplay)

### R19 - Correzione formula

**File**: `src/lib/game-utils.ts` righe 122-138

```typescript
// PRIMA (riga 134)
(Math.min(stats.soldi / 10, 100) * soldiWeight)

// DOPO — scala lineare su range reale [0, 1000]
(clampStat(stats.soldi, 'soldi') / 10 * REPUTATION_WEIGHTS.soldi)
```

**Spiegazione**: `clampStat(soldi, 'soldi')` limita a [0,1000], poi `/10` mappa a [0,100]. Il `Math.min(..., 100)` era ridondante se soldi e' gia' capped, ma aggiungeva un cap implicito. Ora il cap e' esplicito via `STAT_CAPS.soldi.max`.

Per la media:
```typescript
// PRIMA (riga 135)
(Math.min(stats.media * 10, 100) * mediaWeight)

// DOPO
(clampStat(stats.media, 'media') * 10 * REPUTATION_WEIGHTS.media)
```

### R19b - Pesi in costanti

**File**: `src/lib/game-balance.constants.ts` (gia' definito in R5)
I 6 pesi sono gia' previsti nella sezione `REPUTATION_WEIGHTS`.

**File**: `src/lib/game-utils.ts` righe 123-128
Sostituire i 6 `const *Weight` locali con import da `REPUTATION_WEIGHTS`.

---

## STEP 9 - Decomposizione App.tsx

**Effort**: ~12-16h | **Sessioni**: 4+ | **Rischio**: Alto (file centrale)

### R9a - SchoolTab.tsx (Sessione 1)

**Da App.tsx**: Estrarre l'intero `<TabsContent value="school">` (righe ~1188-1670)
**Nuovo file**: `src/components/tabs/SchoolTab.tsx`
**Props necessarie**: stats, grades, schoolType, schoolYear, schoolRecord, friends, teachers, classmates, schoolDayState, gameTime, handlers (handleVaiAScuola, handleSchoolEventChoice, ecc.)
**Complessita'**: Alta — contiene tab annidati e logica condizionale complessa.

### R9b - CityTab.tsx (Sessione 2)

**Da App.tsx**: Estrarre `<TabsContent value="city">` (righe ~1822-fine)
**Nuovo file**: `src/components/tabs/CityTab.tsx`
**Props necessarie**: stats, actionsRemaining, morningDisplay, handlers azioni citta'

### R9c - SocialTab.tsx + StatusTab.tsx (Sessione 3)

**Da App.tsx**: Estrarre `<TabsContent value="social">` e `<TabsContent value="status">`
**Nuovi file**: `src/components/tabs/SocialTab.tsx`, `src/components/tabs/StatusTab.tsx`

### R9d - Estrazione handler lunghi (Sessione 4)

**Da App.tsx**: Estrarre in funzioni pure testabili:

| Handler | Righe | Destinazione |
|---------|-------|-------------|
| `handleVaiAScuola` | L448-L520 (72 righe) | `src/lib/school-actions.ts` |
| `handleSchoolEventChoice` | L663-L742 (80 righe) | `src/lib/school-event-handlers.ts` |
| `handleReportCardContinue` | L742-L800+ (70 righe) | `src/lib/school-event-handlers.ts` |

**Pattern**: Estrarre la logica pura (calcoli, decisioni) in funzioni pure. Mantenere in App.tsx solo il wiring (chiamata funzione pura + setState).

---

## STEP 10 - Decomposizione useGameActions e GameDialogs

**Effort**: ~8h | **Sessioni**: 3-4 | **Rischio**: Alto

### R10a-d - Split useGameActions

**File**: `src/hooks/useGameActions.ts` (1046 righe, 23 handler)
**Strategia**: Estrarre hook tematici, useGameActions diventa orchestratore:

| Nuovo hook | Handler estratti | Righe stimate |
|-----------|-----------------|---------------|
| `useStudyActions.ts` | handleStudia, handleStudySubject, handleCorrompi*, handleMinaccia*, handlePrepareExam | ~170 |
| `useSocialActions.ts` | handleDisco, handleCinema, handleChiacchiera, handleParco, handleTelefona, handleTryRelationship | ~270 |
| `useGirlfriendActions.ts` | handleGirlfriendAction, handleGirlfriendBreakup | ~80 |
| `useEconomyActions.ts` | handleLavoro, handleShoppingMall, handleMotorino | ~120 |

`useGameActions` rimane come facciata che compone i sotto-hook e espone l'interfaccia pubblica invariata.

### R11 - Split GameDialogs

**File**: `src/components/GameDialogs.tsx` (~500 righe, 11 dialog)
**Strategia**: Ogni AlertDialog inline diventa componente autonomo:

| Nuovo file | Dialog |
|-----------|--------|
| `MetallariDialog.tsx` | Evento metallari |
| `AtipaEventDialog.tsx` | Evento Atipa |
| `PoliceDialog.tsx` | Evento polizia |
| `StreetRaceDialog.tsx` | Gara motorini |
| `BulliDialog.tsx` | Evento bulli |
| `GameOverDialog.tsx` | Fine partita |
| `ResetDialog.tsx` | Reset gioco |
| `AfternoonEventDialog.tsx` | Evento pomeridiano (se inline) |

`GameDialogs.tsx` rimane come orchestratore che importa e renderizza i sotto-dialog.

---

## STEP 11 - Architettura Relazioni (Futuro)

**Effort**: Da pianificare separatamente | **Rischio**: Alto

### R18 - girlfriendToRelation() adapter

Integrare la fidanzata nel sistema 4-assi:
```typescript
function girlfriendToRelation(girlfriend: Ragazza): RelationStats {
  return {
    amicizia: girlfriend.stats.fiducia ?? 30,
    romantico: girlfriend.interessePerTe,
    amore: girlfriend.stats.amore ?? 0,
    odio: 0,
  }
}
```

### R4h - Deprecazione formale social-system.ts

Dopo che tutti i consumer usano `enhanced-friend-system.ts`:
1. Marcare tutte le export di `social-system.ts` come `@deprecated`
2. Migrare `useEventEngine.ts` (ultimo consumer) a `enhanced-friend-system`
3. Eliminare `social-system.ts`

---

## Mappa dipendenze tra step

```
STEP 1 (quick win) ─── indipendente, eseguibile subito
  |
STEP 2 (scale) ──────── prerequisito per STEP 4
  |
STEP 3 (constants) ──── prerequisito per STEP 4, 8
  |
STEP 4 (hub) ────────── dipende da STEP 2 + 3
  |
STEP 5 (state/UI) ───── indipendente (parallelizzabile con 3-4)
  |
STEP 6 (naming/a11y) ── indipendente (parallelizzabile con 5)
  |
STEP 7 (audio) ──────── indipendente
  |
STEP 8 (reputation) ─── dipende da STEP 3 (constants)
  |
STEP 9 (App split) ──── dipende da STEP 4, 5, 6
  |
STEP 10 (hooks/dialog) ─ dipende da STEP 7, 9
  |
STEP 11 (futuro) ────── dipende da STEP 4
```

---

## Riepilogo effort

| Priorita' | Step | Sessioni | Effort stimato |
|-----------|------|----------|---------------|
| URGENTE | 1 | 1 | ~20 min |
| ALTA | 2-3 | 2 | ~4h |
| ALTA | 4 | 1 | ~1.5h |
| MEDIA | 5-6 | 2 | ~3.5h |
| MEDIA | 7-8 | 2 | ~2h |
| PATCH | 2, 5 | - | incluso nell'effort esistente |
| STRUTTURALE | 9-10 | 7-8 | ~20-24h |
| FUTURO | 11 | TBD | Da pianificare |
| **TOTALE** | **1-10** | **~15-16** | **~31-35h** |

---

## Pre-condizioni per ogni step

- **STEP 1**: Nessuna. Eseguibile immediatamente.
- **STEP 2**: Build funzionante. Test manuali su interazioni compagni/professori.
- **STEP 3**: STEP 2 completato (le costanti relazioni usano la nuova scala).
- **STEP 4**: STEP 2 e 3 completati. I pannelli devono poter importare dal nuovo hub.
- **STEP 5**: Nessuna dipendenza critica. Puo' partire in parallelo a STEP 3.
- **STEP 6**: Nessuna dipendenza critica. Puo' partire in parallelo a STEP 5.
- **STEP 7**: Nessuna dipendenza critica.
- **STEP 8**: STEP 3 completato (pesi da game-balance.constants.ts).
- **STEP 9**: STEP 4, 5, 6 completati. Senza il hub e la pulizia stato, lo split riprodurrebbe i problemi.
- **STEP 10**: STEP 7 e 9 completati. I sotto-hook devono poter usare useSoundFeedback.
- **STEP 11**: Sistema relazioni stabile (STEP 4 completato, rodaggio).

---

## Criteri di accettazione per step

### STEP 1
- [ ] Build passa senza errori TypeScript
- [ ] `girlfriend` dinamica visibile nel tab amici

### STEP 2
- [ ] Classmate relation inizia a 50 (non 0)
- [ ] Promozione avviene a soglia 65
- [ ] Dopo reset localStorage, relation compagno inizia a 50
- [ ] Teacher isteresi funziona su scala [0,100]

### STEP 3
- [ ] Tutte le costanti estratte importate da game-balance.constants.ts
- [ ] clampStat('soldi') ritorna [0,1000]
- [ ] Zero occorrenze di Math.max(0, Math.min(100,...)) non giustificate

### STEP 4
- [ ] TeachersPanel e SchoolBreakPanel non importano direttamente da lib/
- [ ] doClassmateInteraction e doTeacherInteraction ritornano risultati coerenti con doInteraction

### STEP 5
- [ ] morningDisplay e' un singolo state enum
- [ ] CityPanel ha zero ripetizione nel pattern disabled
- [ ] gameDialogsProps memoizzato (useMemo)

### STEP 6
- [ ] FriendshipsPanel.tsx esiste, RelationsPanel.tsx eliminato
- [ ] GradeProgressPanel mostra stato vuoto se nessuna materia
- [ ] 4 componenti hanno aria-label/role

### STEP 7
- [ ] useSoundFeedback hook esiste e mappa tutte le azioni
- [ ] GirlfriendPanel e EnhancedFriendsPanel producono feedback sonoro

### STEP 8
- [ ] Formula reputazione usa REPUTATION_WEIGHTS
- [ ] soldi/media scalano linearmente senza cap implicito

### STEP 9
- [ ] App.tsx < 800 righe
- [ ] SchoolTab, CityTab, SocialTab, StatusTab funzionano come prima
- [ ] Handler estratti sono funzioni pure con test

### STEP 10
- [ ] useGameActions.ts < 200 righe (facciata)
- [ ] GameDialogs.tsx < 100 righe (orchestratore)
- [ ] Ogni sotto-hook e sotto-dialog ha singola responsabilita'
