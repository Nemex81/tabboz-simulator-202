# IMPLEMENTATION PLAN — STEP 9: Sistema Salute

> **Target**: `tabboz-simulator-202`
> **Prerequisiti**: STEP 1-8 completati (log system, DiaryPanel, SchoolMorningPanel, GameTime logging)
> **Vincoli**: zero errori TypeScript, nessuna modifica logica esistente (solo aggiunge), accessibilità NVDA, persistenza `useKV`, nessuna dipendenza npm aggiuntiva

---

## Analisi e Valutazione

### Compatibilità verificata

| File analizzato | Stato | Note |
|---|---|---|
| `src/lib/types.ts` | ✅ Compatibile | `salute` non esiste in `GameStats`; `'health'` non in `LogEntryType`; nessun tipo `HealthCondition` |
| `src/hooks/useGameTime.ts` | ✅ Compatibile | `advanceToNextDay` e `advancePhaseOnly` accettano callback extra (pattern `addLogEntry`) |
| `src/hooks/useGameActions.ts` | ✅ Compatibile | Aggiunta `applyCondition` analoga ad `addLogEntry` (callback param) |
| `src/App.tsx` | ✅ Compatibile | Pattern di montaggio hook identico a `useGameLog` / `useGameStats` |
| `src/components/CharacterSheet.tsx` | ✅ Compatibile | Aggiunta 5° tab e prop `healthRecord` non invasiva |
| `src/components/DiaryPanel.tsx` | ✅ Compatibile | Nessuna modifica necessaria; pattern da replicare per `HealthRecordPanel` |

### Conflitti verificati

| Check | Risultato |
|---|---|
| Nome `salute` in `GameStats` | ❌ Non esiste → sicuro da aggiungere |
| Nome `HealthCondition` nel codebase | ❌ Non esiste → sicuro |
| Nome `HealthRecord` nel codebase | ❌ Non esiste → sicuro |
| Tipo `'health'` in `LogEntryType` | ❌ Non presente (9 tipi attuali) → sicuro |
| Chiave `useKV` `tabboz-health-record` | ❌ Non in uso (chiavi attuali: `tabboz-time`, `-exams`, `-phase`, `-day-type`, `-phase-actions`, `-school-type`, `-player-profile`, `-grades`, `-friends`, `-relationships`, `-girlfriend`, `-theme`, `-school-record`) → sicuro |
| Dipendenze circolari | ❌ Nessuna — `useHealthSystem` segue il pattern unidirezionale callback come `addLogEntry` |
| Icona `Heart` in `@phosphor-icons/react` | ✅ Disponibile nativamente |

### Miglioramenti rispetto alla proposta originale

#### C1 — `salute` solo in `GameStats`, NON duplicato in `HealthRecord`

**Problema**: La proposta metteva `salute` sia in `GameStats` che in `HealthRecord`, creando due source-of-truth.

**Soluzione**: `salute` risiede SOLO in `GameStats` (come `stanchezza`, `stress`, `morale`). `HealthRecord` contiene solo `conditions` e `lastCheckupDate`. L'hook `useHealthSystem` modifica `salute` tramite `setStats`, seguendo il pattern già usato da `useGameTime`.

#### C2 — Separazione Template vs Istanza runtime

**Problema**: La proposta definiva `HealthCondition` con tutti i campi (label, description, modifiers, etc.) dentro `HealthRecord.conditions[]`. Questo duplica dati statici nella persistenza.

**Soluzione**:
- `HealthConditionTemplate` — mappa statica `HEALTH_CONDITIONS` con label, description, severity, modifiers, etc.
- `ActiveCondition` — solo `id`, `startDate`, `daysElapsed`, `appliedModifiers` (i debuff effettivi applicati alle stat)

#### C3 — Modello debuff: applicazione one-shot + restore a guarigione

**Problema**: "debuff giornalieri attivi" è ambiguo tra accumulazione quotidiana e overlay.

**Soluzione adottata**:
- **Condizioni normali**: modifiers applicati **una volta** all'insorgenza (one-shot), **ripristinati** alla guarigione. Il campo `appliedModifiers` nell'istanza `ActiveCondition` traccia i valori effettivamente sottratti (gestisce clamping correttamente).
- **Condizioni cumulative** (`dipendenza_fumo`, `dipendenza_alcol`): `cumulative: true` nel template. Ogni giorno durante `tickConditions`, i modifiers vengono applicati una volta (danno permanente, non ripristinato a guarigione).

**Vantaggio**: i numeri della proposta (-3 intelligenza, -5 muscoli per raffreddore) funzionano correttamente come debuff attivi senza accumulazione devastante.

#### C4 — `durationDays: null` al posto di `-1`

TypeScript idiomatico: `null` per "permanente" al posto del magic number `-1`.

#### C5 — Campo `forcesAbsence` e helper `canAttendSchool()`

Aggiunto `forcesAbsence: boolean` nel template e un helper `canAttendSchool()` esposto dall'hook, usato in `handleVaiAScuola` per impedire l'ingresso a scuola con febbre alta.

#### C6 — Campi `autoOnset` / `autoResolve` data-driven

Le condizioni automatiche (`esaurito`, `depresso`) hanno soglie di attivazione e risoluzione definite nel template stesso, non hardcoded nell'hook. Questo permette di aggiungere nuove condizioni auto senza modificare la logica.

#### C7 — Tab Salute come 5° colonna (non sostitutiva)

La tab Salute viene aggiunta come 5ª colonna (`grid-cols-5`), mantenendo Aspetto e Obiettivi con i loro placeholder 🔜. Le tab responsive usano già il pattern `hidden sm:inline` + emoji per mobile.

#### C8 — Nota su bilanciamento

I numeri delle condizioni (es. `depresso` con `-10 morale` che parte da `morale < 15`) creano trappole intenzionali (la depressione È difficile da superare) ma giocabili con azioni mirate (riposa +3 morale, parco +8 morale). Si consiglia test di gameplay post-implementazione. I numeri sono centralizzati in `HEALTH_CONDITIONS` per modifica facile.

---

## STEP 9A — Tipi e costanti

### Checklist pre-implementazione
- [ ] Nessun campo `salute` esistente in `GameStats`
- [ ] Nessun tipo `HealthCondition` / `HealthRecord` esistente
- [ ] `LogEntryType` ha esattamente 9 tipi
- [ ] `DEFAULT_GAME_STATE.stats` ha 11 campi (senza `salute`)

### File: `src/lib/types.ts`

#### Modifica 1 — Aggiungere `salute` a `GameStats`

```ts
// DOPO: carisma: number
  salute: number
```

#### Modifica 2 — Aggiungere `salute: 100` a `DEFAULT_GAME_STATE.stats`

```ts
// DOPO: carisma: 10
    salute: 100
```

#### Modifica 3 — Aggiungere `'health'` a `LogEntryType`

```ts
export type LogEntryType =
  | 'action_success'
  | 'action_failure'
  | 'action_neutral'
  | 'event_positive'
  | 'event_negative'
  | 'event_neutral'
  | 'school'
  | 'social'
  | 'system'
  | 'health'            // condizione di salute (insorgenza, guarigione, peggioramento)
```

#### Modifica 4 — Aggiungere tipi Health System (DOPO `MAX_LOG_ENTRIES`)

```ts
// ── Health System ──────────────────────────────────────────────

export type HealthConditionId =
  | 'raffreddore'
  | 'influenza'
  | 'febbre_alta'
  | 'infortunio_lieve'
  | 'infortunio_grave'
  | 'sbornia'
  | 'dipendenza_fumo'
  | 'dipendenza_alcol'
  | 'esaurito'
  | 'depresso'
  | 'ciclo_mestruale'
  | 'gravidanza'

export type HealthConditionSeverity = 'lieve' | 'moderata' | 'grave'

export interface HealthConditionTemplate {
  id: HealthConditionId
  label: string
  description: string
  severity: HealthConditionSeverity
  durationDays: number | null
  statModifiers: Partial<Record<keyof GameStats, number>>
  genderRestricted?: 'femmina'
  forcesAbsence?: boolean
  autoOnset?: {
    check: 'stress_high' | 'morale_low'
    threshold: number
  }
  autoResolve?: {
    check: 'stress_low' | 'morale_high'
    threshold: number
  }
  cumulative?: boolean
}

export interface ActiveCondition {
  id: HealthConditionId
  startDate: GameDate
  daysElapsed: number
  appliedModifiers: Partial<Record<keyof GameStats, number>>
}

export interface HealthRecord {
  conditions: ActiveCondition[]
  lastCheckupDate?: GameDate
}

export const DEFAULT_HEALTH_RECORD: HealthRecord = {
  conditions: [],
}

export const HEALTH_CONDITIONS: Record<HealthConditionId, HealthConditionTemplate> = {
  raffreddore: {
    id: 'raffreddore',
    label: 'Raffreddore',
    description: 'Naso chiuso e starnuti. Niente di grave, ma sei un po\' rimbambito.',
    severity: 'lieve',
    durationDays: 5,
    statModifiers: { intelligenza: -3, muscoli: -5 },
  },
  influenza: {
    id: 'influenza',
    label: 'Influenza',
    description: 'Febbre, dolori, e voglia di starsene a letto. Dura un bel po\'.',
    severity: 'moderata',
    durationDays: 10,
    statModifiers: { intelligenza: -10, muscoli: -15, morale: -10 },
  },
  febbre_alta: {
    id: 'febbre_alta',
    label: 'Febbre Alta',
    description: 'Temperatura alle stelle! Non puoi andare a scuola in queste condizioni.',
    severity: 'grave',
    durationDays: 7,
    statModifiers: { intelligenza: -20, muscoli: -20 },
    forcesAbsence: true,
  },
  infortunio_lieve: {
    id: 'infortunio_lieve',
    label: 'Infortunio Lieve',
    description: 'Una storta o un livido. Niente di rotto, ma fa male.',
    severity: 'lieve',
    durationDays: 7,
    statModifiers: { muscoli: -10, figosita: -5 },
  },
  infortunio_grave: {
    id: 'infortunio_grave',
    label: 'Infortunio Grave',
    description: 'Frattura o stiramento serio. Ci vorranno settimane per riprenderti.',
    severity: 'grave',
    durationDays: 21,
    statModifiers: { muscoli: -30, figosita: -15, morale: -10 },
  },
  sbornia: {
    id: 'sbornia',
    label: 'Sbornia',
    description: 'Testa che gira, stomaco in subbuglio. Mai più... fino alla prossima volta.',
    severity: 'lieve',
    durationDays: 1,
    statModifiers: { intelligenza: -15, muscoli: -10, morale: -5 },
  },
  dipendenza_fumo: {
    id: 'dipendenza_fumo',
    label: 'Dipendenza da Fumo',
    description: 'Le sigarette ti stanno consumando. Ogni giorno peggiori un po\'.',
    severity: 'moderata',
    durationDays: null,
    statModifiers: { muscoli: -5, salute: -3 },
    cumulative: true,
  },
  dipendenza_alcol: {
    id: 'dipendenza_alcol',
    label: 'Dipendenza da Alcol',
    description: 'L\'alcol ti sta rovinando la vita. Ogni giorno è peggio del precedente.',
    severity: 'grave',
    durationDays: null,
    statModifiers: { intelligenza: -10, morale: -10, salute: -5 },
    cumulative: true,
  },
  esaurito: {
    id: 'esaurito',
    label: 'Esaurito',
    description: 'Troppo stress! Non riesci a concentrarti su nulla.',
    severity: 'moderata',
    durationDays: null,
    statModifiers: { intelligenza: -10, morale: -5 },
    autoOnset: { check: 'stress_high', threshold: 85 },
    autoResolve: { check: 'stress_low', threshold: 70 },
  },
  depresso: {
    id: 'depresso',
    label: 'Depresso',
    description: 'Non hai voglia di fare niente. Il mondo sembra grigio.',
    severity: 'grave',
    durationDays: null,
    statModifiers: { morale: -10, reputazione: -5, carisma: -5 },
    autoOnset: { check: 'morale_low', threshold: 15 },
    autoResolve: { check: 'morale_high', threshold: 25 },
  },
  // ── Gender-specific (STEP 9E) ──
  ciclo_mestruale: {
    id: 'ciclo_mestruale',
    label: 'Ciclo Mestruale',
    description: 'Quel periodo del mese. Crampi e malumore.',
    severity: 'lieve',
    durationDays: 5,
    statModifiers: { morale: -5, muscoli: -5 },
    genderRestricted: 'femmina',
  },
  gravidanza: {
    id: 'gravidanza',
    label: 'Gravidanza',
    description: 'Una situazione... complicata. Tutto cambierà.',
    severity: 'grave',
    durationDays: 280,
    statModifiers: { muscoli: -10, morale: -15, stress: 20 },
    genderRestricted: 'femmina',
  },
}
```

### Ordine di esecuzione STEP 9A

1. Aggiungere `salute: number` a `GameStats`
2. Aggiungere `salute: 100` a `DEFAULT_GAME_STATE.stats`
3. Aggiungere `| 'health'` a `LogEntryType`
4. Aggiungere tutto il blocco `// ── Health System ──` dopo `MAX_LOG_ENTRIES`

### Verifica STEP 9A

```
Pylance: 0 errori in src/
```

Dopo 9A ci saranno warning "unused" sui tipi nuovi — è corretto, vengono usati in 9B.

### Prompt Copilot — STEP 9A

```
In src/lib/types.ts:
1. Aggiungi `salute: number` a GameStats (dopo carisma)
2. Aggiungi `salute: 100` a DEFAULT_GAME_STATE.stats (dopo carisma: 10)
3. Aggiungi `| 'health'` come decimo tipo a LogEntryType (dopo system)
4. Dopo la riga `export const MAX_LOG_ENTRIES = 200`, aggiungi il blocco completo Health System con i tipi: HealthConditionId, HealthConditionSeverity, HealthConditionTemplate, ActiveCondition, HealthRecord, DEFAULT_HEALTH_RECORD, e la mappa HEALTH_CONDITIONS con tutte le 12 condizioni (10 universali + 2 gender-specific placeholder per STEP 9E).
Usa gli snippet esatti dal piano IMPLEMENTATION_PLAN_STEP9_HEALTH_SYSTEM.md.
Verifica: 0 errori Pylance in src/
```

---

## STEP 9B — Hook `useHealthSystem`

### Checklist pre-implementazione
- [ ] STEP 9A completato (tutti i tipi disponibili)
- [ ] 0 errori Pylance dopo 9A
- [ ] `src/hooks/useHealthSystem.ts` non esiste

### File: `src/hooks/useHealthSystem.ts` (NUOVO)

```ts
import { useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  GameStats,
  GameDate,
  DayPhase,
  HealthConditionId,
  HealthRecord,
  ActiveCondition,
  HealthConditionTemplate,
  DEFAULT_HEALTH_RECORD,
  HEALTH_CONDITIONS,
  LogEntryType,
  GameLogEntry,
} from '@/lib/types'
import { clampStat } from '@/lib/game-utils'

interface UseHealthSystemParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  playerGender: 'maschio' | 'femmina'
  addLogEntry: (
    type: LogEntryType,
    title: string,
    description: string,
    result: GameLogEntry['result'],
    date: GameDate,
    phase: DayPhase
  ) => void
}

export function useHealthSystem({
  stats,
  setStats,
  playerGender,
  addLogEntry,
}: UseHealthSystemParams) {
  const [healthRecord, setHealthRecord] = useKV<HealthRecord>(
    'tabboz-health-record',
    DEFAULT_HEALTH_RECORD
  )

  const statsRef = useRef(stats)
  statsRef.current = stats
  const healthRecordRef = useRef(healthRecord)
  healthRecordRef.current = healthRecord

  // ── applyCondition ────────────────────────────────────────────
  const applyCondition = useCallback(
    (id: HealthConditionId, currentDate: GameDate, currentPhase: DayPhase) => {
      const template = HEALTH_CONDITIONS[id]
      if (!template) return

      // Guard: restrizione di genere
      if (template.genderRestricted && playerGender !== template.genderRestricted) return

      // Guard: condizione già attiva
      if (healthRecordRef.current.conditions.some((c) => c.id === id)) return

      // Calcola e applica debuff one-shot (non cumulative)
      const appliedModifiers: Partial<Record<keyof GameStats, number>> = {}
      if (!template.cumulative) {
        setStats((prev) => {
          const next = { ...prev }
          for (const [key, mod] of Object.entries(template.statModifiers)) {
            const k = key as keyof GameStats
            const before = next[k]
            next[k] = clampStat(before + mod, k === 'soldi' ? 0 : 0, k === 'soldi' ? 1000 : 100)
            appliedModifiers[k] = next[k] - before
          }
          return next
        })
      }

      const newCondition: ActiveCondition = {
        id,
        startDate: currentDate,
        daysElapsed: 0,
        appliedModifiers: template.cumulative ? {} : appliedModifiers,
      }

      setHealthRecord((prev) => ({
        ...prev,
        conditions: [...prev.conditions, newCondition],
      }))

      addLogEntry(
        'health',
        `${template.label} — insorgenza`,
        `${template.description} (${template.severity})`,
        template.severity === 'lieve' ? 'neutral' : 'negative',
        currentDate,
        currentPhase
      )
    },
    [playerGender, setStats, setHealthRecord, addLogEntry]
  )

  // ── removeCondition ───────────────────────────────────────────
  const removeCondition = useCallback(
    (id: HealthConditionId, currentDate: GameDate, currentPhase: DayPhase) => {
      const template = HEALTH_CONDITIONS[id]
      const condition = healthRecordRef.current.conditions.find((c) => c.id === id)
      if (!condition || !template) return

      // Ripristina debuff one-shot (solo condizioni non cumulative)
      if (!template.cumulative && Object.keys(condition.appliedModifiers).length > 0) {
        setStats((prev) => {
          const next = { ...prev }
          for (const [key, mod] of Object.entries(condition.appliedModifiers)) {
            const k = key as keyof GameStats
            next[k] = clampStat(next[k] - mod, k === 'soldi' ? 0 : 0, k === 'soldi' ? 1000 : 100)
          }
          return next
        })
      }

      setHealthRecord((prev) => ({
        ...prev,
        conditions: prev.conditions.filter((c) => c.id !== id),
      }))

      addLogEntry(
        'health',
        `${template.label} — guarigione`,
        `Sei guarito da: ${template.label}. I malus sono stati ripristinati.`,
        'positive',
        currentDate,
        currentPhase
      )
    },
    [setStats, setHealthRecord, addLogEntry]
  )

  // ── tickConditions ────────────────────────────────────────────
  // Chiamato una volta al giorno da advanceToNextDay
  const tickConditions = useCallback(
    (currentDate: GameDate) => {
      const currentConditions = healthRecordRef.current.conditions
      if (currentConditions.length === 0) return

      const toRemove: HealthConditionId[] = []

      setHealthRecord((prev) => ({
        ...prev,
        conditions: prev.conditions.map((c) => {
          const template = HEALTH_CONDITIONS[c.id]
          const updated = { ...c, daysElapsed: c.daysElapsed + 1 }

          // Condizioni cumulative: applica danno giornaliero
          if (template.cumulative) {
            setStats((s) => {
              const next = { ...s }
              for (const [key, mod] of Object.entries(template.statModifiers)) {
                const k = key as keyof GameStats
                next[k] = clampStat(next[k] + mod, k === 'soldi' ? 0 : 0, k === 'soldi' ? 1000 : 100)
              }
              return next
            })
          }

          // Check durata finita
          if (template.durationDays !== null && updated.daysElapsed >= template.durationDays) {
            toRemove.push(c.id)
          }

          // Check auto-resolve
          if (template.autoResolve) {
            const s = statsRef.current
            const shouldResolve =
              (template.autoResolve.check === 'stress_low' && s.stress < template.autoResolve.threshold) ||
              (template.autoResolve.check === 'morale_high' && s.morale > template.autoResolve.threshold)
            if (shouldResolve) {
              toRemove.push(c.id)
            }
          }

          return updated
        }),
      }))

      // Rimuovi condizioni scadute (fuori dal setter per evitare nesting)
      for (const id of toRemove) {
        removeCondition(id, currentDate, 'mattina')
      }
    },
    [setHealthRecord, setStats, removeCondition]
  )

  // ── checkAutoConditions ───────────────────────────────────────
  // Chiamato ogni avanzamento di fase da advancePhaseOnly
  const checkAutoConditions = useCallback(
    (currentDate: GameDate, currentPhase: DayPhase) => {
      const s = statsRef.current
      const activeIds = new Set(healthRecordRef.current.conditions.map((c) => c.id))

      // Itera sulle condizioni con autoOnset
      for (const template of Object.values(HEALTH_CONDITIONS)) {
        if (!template.autoOnset) continue
        if (template.genderRestricted && playerGender !== template.genderRestricted) continue
        if (activeIds.has(template.id)) continue

        const shouldOnset =
          (template.autoOnset.check === 'stress_high' && s.stress > template.autoOnset.threshold) ||
          (template.autoOnset.check === 'morale_low' && s.morale < template.autoOnset.threshold)

        if (shouldOnset) {
          applyCondition(template.id, currentDate, currentPhase)
        }
      }
    },
    [playerGender, applyCondition]
  )

  // ── canAttendSchool ───────────────────────────────────────────
  const canAttendSchool = useCallback((): boolean => {
    return !healthRecordRef.current.conditions.some((c) => {
      const template = HEALTH_CONDITIONS[c.id]
      return template?.forcesAbsence === true
    })
  }, [])

  return {
    healthRecord,
    setHealthRecord,
    applyCondition,
    removeCondition,
    tickConditions,
    checkAutoConditions,
    canAttendSchool,
  }
}
```

### Note architetturali STEP 9B

1. **`appliedModifiers` e clamping**: Quando una condizione viene applicata, il debuff effettivo può essere inferiore al template (per clamping a 0). Il campo `appliedModifiers` registra il delta reale, garantendo un restore corretto.
2. **`tickConditions` + `removeCondition`**: Le rimozioni avvengono FUORI dal setter di `setHealthRecord` per evitare nesting di state update.
3. **`checkAutoConditions` ≠ `tickConditions`**: Il primo controlla soglie e applica nuove condizioni (ogni fase). Il secondo avanza durata e rimuove scadute (ogni giorno).
4. **Refs pattern**: `statsRef` e `healthRecordRef` seguono il pattern già consolidato in `useGameTime.ts` e `useGameActions.ts`.

### Ordine di esecuzione STEP 9B

1. Creare il file `src/hooks/useHealthSystem.ts` con il contenuto completo sopra

### Verifica STEP 9B

```
Pylance: 0 errori in src/hooks/useHealthSystem.ts
```

### Prompt Copilot — STEP 9B

```
Crea il file src/hooks/useHealthSystem.ts con il contenuto completo dallo snippet nel piano IMPLEMENTATION_PLAN_STEP9_HEALTH_SYSTEM.md, sezione STEP 9B.
Il file:
- Importa da @/lib/types tutti i tipi Health (HealthConditionId, HealthRecord, ActiveCondition, HEALTH_CONDITIONS, DEFAULT_HEALTH_RECORD, etc.)
- Importa clampStat da @/lib/game-utils
- Usa useKV('tabboz-health-record', DEFAULT_HEALTH_RECORD) per persistenza
- Espone: healthRecord, setHealthRecord, applyCondition, removeCondition, tickConditions, checkAutoConditions, canAttendSchool
- Segue il pattern refs (statsRef, healthRecordRef) usato in useGameTime.ts
Verifica: 0 errori Pylance
```

---

## STEP 9C — Integrazione in App.tsx, useGameTime.ts, useGameActions.ts

### Checklist pre-implementazione
- [ ] STEP 9A e 9B completati
- [ ] 0 errori Pylance
- [ ] `useHealthSystem` esportato correttamente

### File: `src/App.tsx`

#### Modifica C1 — Import del hook

```ts
// Dopo l'import di useGameLog:
import { useHealthSystem } from '@/hooks/useHealthSystem'
```

#### Modifica C2 — Import tipi (se necessario)

```ts
// Aggiungere DEFAULT_HEALTH_RECORD all'import da types se non già presente:
import { ..., DEFAULT_HEALTH_RECORD } from '@/lib/types'
```

#### Modifica C3 — Montare `useHealthSystem` dopo `useGameLog`

```ts
// Dopo: const { gameLog, addLogEntry, clearLog } = useGameLog()

const {
  healthRecord,
  setHealthRecord,
  applyCondition,
  removeCondition,
  tickConditions,
  checkAutoConditions,
  canAttendSchool,
} = useHealthSystem({
  stats,
  setStats,
  playerGender: playerProfile?.gender ?? 'maschio',
  addLogEntry,
})
```

#### Modifica C4 — Passare callback a `useGameTime`

Aggiungere `tickConditions` e `checkAutoConditions` al blocco parametri di `useGameTime`:

```ts
const { ... } = useGameTime({
  grades, stats, schoolType, setStats,
  setReportCardPassed, setShowReportCard, setGameWon,
  setSchoolEvent, setShowSchoolEvent,
  setSchoolMorningEvents, setShowSchoolMorning,
  announce, setSchoolRecord, schoolRecord,
  setGameOver, setGameOverReason, addLogEntry,
  tickConditions, checkAutoConditions,  // ← STEP 9C aggiunta
})
```

#### Modifica C5 — Passare `applyCondition` a `useGameActions`

```ts
const actions = useGameActions({
  stats, setStats, grades, setGrades, gameTime, schoolType,
  scheduledExams, setScheduledExams, friends, relationships, setRelationships,
  girlfriend, setGirlfriend, setGameOver, setGameOverReason,
  consumeAction, announce,
  triggerRandomEvent: events.triggerRandomEvent,
  checkForNewFriend: events.checkForNewFriend,
  checkForNewRelationship: events.checkForNewRelationship,
  checkForNewGirlfriend: events.checkForNewGirlfriend,
  setShowSubjectDialog, currentPhase, dayType, phaseActionsRemaining,
  schoolRecord, setSchoolRecord, gainExtraAction, addLogEntry, marinatoOggi,
  applyCondition,  // ← STEP 9C aggiunta
})
```

#### Modifica C6 — Guard `canAttendSchool()` in `handleVaiAScuola`

Aggiungere il check dopo il guard esistente su `schoolRecord.wentToSchoolToday`:

```ts
// In handleVaiAScuola, DOPO il check "Sei già andato a scuola oggi!"
// e PRIMA di playSound.buttonClick():
if (!canAttendSchool()) {
  playSound.failure()
  announce('Non puoi andare a scuola: sei troppo malato! Resta a casa.')
  addLogEntry('health', 'Assenza forzata', 'Non puoi andare a scuola a causa delle condizioni di salute.', 'negative', gameTime.currentDate, currentPhase)
  return
}
```

#### Modifica C7 — Reset health record in `handleReset`

```ts
// In handleReset, PRIMA di clearLog():
setHealthRecord(DEFAULT_HEALTH_RECORD)
```

#### Modifica C8 — Passare `healthRecord` a `CharacterSheet`

```tsx
<CharacterSheet
  playerProfile={playerProfile}
  stats={stats}
  schoolType={schoolType}
  schoolYear={gameTime.schoolYear.currentYear}
  age={gameTime.age}
  schoolRecord={schoolRecord}
  currentMedia={currentMedia}
  gameLog={gameLog}
  healthRecord={healthRecord}  // ← STEP 9C aggiunta
/>
```

### File: `src/hooks/useGameTime.ts`

#### Modifica T1 — Aggiungere callback all'interfaccia

```ts
// In UseGameTimeParams, DOPO addLogEntry:
  tickConditions: (currentDate: import('@/lib/types').GameDate) => void
  checkAutoConditions: (currentDate: import('@/lib/types').GameDate, currentPhase: import('@/lib/types').DayPhase) => void
```

#### Modifica T2 — Destructuring dei nuovi parametri

```ts
// In useGameTime destructuring, DOPO addLogEntry:
  tickConditions,
  checkAutoConditions,
```

#### Modifica T3 — Chiamare `tickConditions` in `advanceToNextDay`

Inserire DOPO il blocco `setRawScheduledExams(...)` e PRIMA di `setSchoolRecord((prev) => ({ ...prev, wentToSchoolToday: false }))`:

```ts
// STEP 9C: tick condizioni di salute per il nuovo giorno
// ⚠️ Usare rawGameTime (valore pre-mutazione nello scope), NON gameTimeRef.current
const nextDate = advanceGameTime(rawGameTime).currentDate
tickConditions(nextDate)
```

**Nota**: `advanceGameTime` è deterministico. `rawGameTime` è il valore pre-mutazione già disponibile nello scope di `advanceToNextDay` (la variabile `useKV` non ancora aggiornata). Produce lo stesso `currentDate` che verrebbe calcolato dentro il setter, ed è esplicitamente corretto senza rischiare stale closure da `gameTimeRef`.

#### Modifica T4 — Chiamare `checkAutoConditions` in `advancePhaseOnly`

Inserire ALLA FINE di `advancePhaseOnly`, DOPO il blocco `if (wasAbsent) { addLogEntry(...) }`:

```ts
// STEP 9C: check condizioni automatiche dopo ogni cambio fase
checkAutoConditions(gameTime.currentDate, nextPhase)
```

**Nota**: `nextPhase` è già disponibile come variabile locale (calcolata all'inizio di `advancePhaseOnly`).

#### Modifica T5 — Aggiornare dependency array

Aggiungere `tickConditions` e `checkAutoConditions` ai dependency array di `advanceToNextDay` e `advancePhaseOnly` rispettivamente.

### File: `src/hooks/useGameActions.ts`

#### Modifica A1 — Aggiungere `applyCondition` all'interfaccia

```ts
// In UseGameActionsParams, DOPO addLogEntry:
  applyCondition: (id: import('@/lib/types').HealthConditionId, currentDate: import('@/lib/types').GameDate, currentPhase: import('@/lib/types').DayPhase) => void
```

#### Modifica A2 — Destructuring

```ts
// In useGameActions destructuring, DOPO addLogEntry:
  applyCondition,
```

#### Modifica A3 — Infortunio in `handlePalestra`

Aggiungere ALLA FINE di `handlePalestra`, DOPO il `consumeAction()` e `addLogEntry(...)`, PRIMA del `}` di chiusura:

```ts
// STEP 9C: rischio infortunio da palestra
const injuryRoll = Math.random()
if (injuryRoll < 0.02) {
  applyCondition('infortunio_grave', gameTimeRef.current.currentDate, currentPhaseRef.current)
} else if (injuryRoll < 0.12) {
  applyCondition('infortunio_lieve', gameTimeRef.current.currentDate, currentPhaseRef.current)
}
```

#### Modifica A4 — Sbornia in `handleDisco`

Aggiungere ALLA FINE di `handleDisco`, DOPO il blocco di successo/fallimento e `addLogEntry(...)`, PRIMA del `}` di chiusura della funzione:

```ts
// STEP 9C: rischio sbornia dopo la discoteca
if (Math.random() < 0.15) {
  applyCondition('sbornia', gameTimeRef.current.currentDate, currentPhaseRef.current)
}
```

#### Modifica A5 — Raffreddore/Influenza casuale (opzionale, consigliata)

Aggiungere in `handleParco` (esposizione all'aria aperta), ALLA FINE:

```ts
// STEP 9C: leggero rischio raffreddore al parco
if (Math.random() < 0.05) {
  applyCondition('raffreddore', gameTimeRef.current.currentDate, currentPhaseRef.current)
}
```

### Ordine di esecuzione STEP 9C

1. `useGameTime.ts` — Modifiche T1, T2, T3, T4, T5
2. `useGameActions.ts` — Modifiche A1, A2, A3, A4, A5
3. `App.tsx` — Modifiche C1, C2, C3, C4, C5, C6, C7, C8

### Verifica STEP 9C

```
Pylance: 0 errori in src/
Manuale: avviare il gioco, andare in palestra più volte → verificare che infortunio possa scattare
Manuale: andare in discoteca → verificare sbornia occasionale
Manuale: alzare stress > 85 → verificare onset esaurito
Manuale: verificare che CharacterSheet accetti la nuova prop senza errori (la UI viene implementata in 9D)
```

### Prompt Copilot — STEP 9C

```
Implementa STEP 9C dal piano IMPLEMENTATION_PLAN_STEP9_HEALTH_SYSTEM.md.

1. In useGameTime.ts:
   - Aggiungi tickConditions e checkAutoConditions a UseGameTimeParams (stessa firma del piano)
   - Destructuring dei nuovi parametri
   - Chiama tickConditions(nextDate) in advanceToNextDay DOPO setRawScheduledExams e PRIMA di setSchoolRecord reset
   - Chiama checkAutoConditions(gameTime.currentDate, nextPhase) ALLA FINE di advancePhaseOnly
   - Aggiorna dependency array

2. In useGameActions.ts:
   - Aggiungi applyCondition a UseGameActionsParams
   - Destructuring
   - In handlePalestra: 2% infortunio_grave, 10% infortunio_lieve (dopo consumeAction)
   - In handleDisco: 15% sbornia (dopo il blocco successo/fallimento)
   - In handleParco: 5% raffreddore (alla fine)

3. In App.tsx:
   - Import useHealthSystem e DEFAULT_HEALTH_RECORD
   - Monta useHealthSystem dopo useGameLog con params: stats, setStats, playerGender, addLogEntry
   - Passa tickConditions e checkAutoConditions a useGameTime
   - Passa applyCondition a useGameActions
   - Aggiungi guard canAttendSchool() in handleVaiAScuola (dopo check wentToSchoolToday)
   - Aggiungi setHealthRecord(DEFAULT_HEALTH_RECORD) in handleReset
   - Passa healthRecord a CharacterSheet

Verifica: 0 errori Pylance in src/
```

---

## STEP 9D — `HealthRecordPanel.tsx` + Tab Salute in `CharacterSheet.tsx`

### Checklist pre-implementazione
- [ ] STEP 9A, 9B, 9C completati
- [ ] 0 errori Pylance
- [ ] `healthRecord` passato come prop a `CharacterSheet`
- [ ] `src/components/HealthRecordPanel.tsx` non esiste

### File: `src/components/HealthRecordPanel.tsx` (NUOVO)

```tsx
import React from 'react'
import { Heart, Heartbeat, FirstAid, Warning } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import {
  HealthRecord,
  HealthConditionSeverity,
  HEALTH_CONDITIONS,
  GameLogEntry,
  GameDate,
} from '@/lib/types'

interface HealthRecordPanelProps {
  healthRecord: HealthRecord
  gameLog: GameLogEntry[]
}

function formatDate(date: GameDate): string {
  return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`
}

function severityBadge(severity: HealthConditionSeverity) {
  const colors: Record<HealthConditionSeverity, string> = {
    lieve: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    moderata: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    grave: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[severity]}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}

function getSaluteColor(salute: number): string {
  if (salute >= 70) return 'bg-secondary'
  if (salute >= 40) return 'bg-yellow-500'
  return 'bg-destructive'
}

function getSaluteLabel(salute: number): string {
  if (salute >= 80) return 'In ottima forma'
  if (salute >= 60) return 'In buona salute'
  if (salute >= 40) return 'Un po\' acciaccato'
  if (salute >= 20) return 'Malaticcio'
  return 'In pessime condizioni'
}

export function HealthRecordPanel({ healthRecord, gameLog }: HealthRecordPanelProps) {
  const healthLog = gameLog.filter((e) => e.type === 'health')
  const activeConditions = healthRecord.conditions

  // Leggi salute dalle stats del log più recente — NOTA: la salute è in GameStats,
  // qui mostriamo solo le condizioni. La barra salute è nella sezione Statistiche di CharacterSheet.

  return (
    <section aria-labelledby="health-title">
      {/* Sezione 1 — Condizioni Attive */}
      <Card className="p-6 border-2 border-primary bg-card mb-4">
        <h2 id="health-title" className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <Heartbeat size={28} weight="fill" aria-hidden="true" />
          CONDIZIONI ATTIVE
        </h2>

        {activeConditions.length === 0 ? (
          <p className="text-muted-foreground text-sm italic flex items-center gap-2">
            <Heart size={18} weight="fill" className="text-secondary" aria-hidden="true" />
            Nessuna condizione attiva. Stai bene!
          </p>
        ) : (
          <ul role="list" aria-label="Lista condizioni di salute attive" className="space-y-3">
            {activeConditions.map((condition) => {
              const template = HEALTH_CONDITIONS[condition.id]
              if (!template) return null
              const daysRemaining =
                template.durationDays !== null
                  ? Math.max(0, template.durationDays - condition.daysElapsed)
                  : null
              const modifierEntries = Object.entries(template.statModifiers)

              return (
                <li
                  key={condition.id}
                  role="listitem"
                  className={`p-4 rounded-lg border ${
                    template.severity === 'grave'
                      ? 'border-destructive/40 bg-destructive/5'
                      : template.severity === 'moderata'
                      ? 'border-orange-400/40 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-yellow-400/40 bg-yellow-50 dark:bg-yellow-950/20'
                  }`}
                >
                  {/* SR-only: contesto completo */}
                  <span className="sr-only">
                    Condizione: {template.label}, gravità {template.severity}.
                    {daysRemaining !== null
                      ? ` Giorni rimanenti: ${daysRemaining}.`
                      : ' Durata permanente.'}
                    {' '}Insorgenza: {formatDate(condition.startDate)}.
                    {modifierEntries.length > 0 &&
                      ` Effetti: ${modifierEntries
                        .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
                        .join(', ')}.`}
                  </span>

                  <div aria-hidden="true">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Warning size={18} weight="fill" className="text-orange-500 shrink-0" />
                        <span className="font-bold text-foreground">{template.label}</span>
                        {severityBadge(template.severity)}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {daysRemaining !== null
                          ? `${daysRemaining}g rimanenti`
                          : 'Permanente'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">Insorgenza:</span>{' '}
                      {formatDate(condition.startDate)}
                    </div>
                    {modifierEntries.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {modifierEntries.map(([key, value]) => (
                          <span
                            key={key}
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              value < 0
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-secondary/10 text-secondary'
                            }`}
                          >
                            {key} {value > 0 ? '+' : ''}{value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* Sezione 2 — Storico Clinico (log tipo 'health') */}
      <Card className="p-6 border-2 border-muted bg-card">
        <h3 className="text-lg font-bold text-muted-foreground mb-3 flex items-center gap-2">
          <FirstAid size={20} weight="fill" aria-hidden="true" />
          STORICO CLINICO
        </h3>

        {healthLog.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">
            Nessun evento sanitario registrato.
          </p>
        ) : (
          <ul
            role="list"
            aria-label="Storico eventi sanitari"
            className="space-y-2 max-h-64 overflow-y-auto"
          >
            {healthLog.slice(0, 20).map((entry) => (
              <li
                key={entry.id}
                role="listitem"
                className={`flex gap-3 items-start p-3 rounded-lg border ${
                  entry.result === 'positive'
                    ? 'border-secondary/30 bg-secondary/5'
                    : entry.result === 'negative'
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-muted bg-muted/20'
                }`}
              >
                <div className="flex-1 min-w-0">
                  {/* SR-only context */}
                  <span className="sr-only">
                    {entry.result === 'positive' ? 'Esito positivo' : entry.result === 'negative' ? 'Esito negativo' : 'Esito neutro'}.{' '}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap" aria-hidden="true">
                    <span className="text-xs text-muted-foreground font-mono">
                      {entry.date ? formatDate(entry.date) : '??/??/????'}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{entry.phase}</span>
                  </div>
                  <span className="sr-only">
                    {entry.date ? formatDate(entry.date) : 'Data sconosciuta'}, {entry.phase}.{' '}
                  </span>

                  <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                    {entry.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
```

### Note UI/Accessibilità

- **Pattern identico a `DiaryPanel.tsx`**: `role="list"`, `role="listitem"`, `sr-only` per contesto screen reader, niente `aria-hidden` su contenuto testuale
- **Niente `role="log"`**: usa `role="list"` come da fix NVDA applicato a DiaryPanel
- **Sezione barra salute**: NON duplicata qui — `salute` è visualizzata nella sezione Statistiche del tab Profilo (come le altre stat). Il tab Salute mostra solo condizioni attive + storico

### File: `src/components/CharacterSheet.tsx`

#### Modifica D1 — Import nuovi

```ts
// Aggiungere agli import:
import { Heart } from '@phosphor-icons/react'
import { HealthRecord } from '@/lib/types'
import { HealthRecordPanel } from '@/components/HealthRecordPanel'
```

#### Modifica D2 — Aggiungere prop `healthRecord`

```ts
// In CharacterSheetProps:
  healthRecord: HealthRecord
```

#### Modifica D3 — Destructuring

```ts
// In function CharacterSheet destructuring:
  healthRecord,
```

#### Modifica D4 — Grid 5 colonne

```ts
// Cambiare:
<TabsList className="grid w-full grid-cols-4 gap-1 bg-muted/50 p-1 h-auto mb-6">
// In:
<TabsList className="grid w-full grid-cols-5 gap-1 bg-muted/50 p-1 h-auto mb-6">
```

#### Modifica D5 — Tab trigger Salute

Aggiungere DOPO il TabsTrigger `"diario"` e PRIMA del TabsTrigger `"obiettivi"`:

```tsx
<TabsTrigger value="salute" aria-label="Salute e condizioni">
  <Heart size={18} className="mr-1" weight="fill" aria-hidden="true" />
  <span className="hidden sm:inline">Salute</span>
  <span className="sm:hidden">💊</span>
</TabsTrigger>
```

#### Modifica D6 — Tab content Salute

Aggiungere DOPO il `TabsContent value="diario"` e PRIMA della chiusura `</Tabs>`:

```tsx
<TabsContent value="salute">
  <div className="mt-2">
    <HealthRecordPanel healthRecord={healthRecord} gameLog={gameLog} />
  </div>
</TabsContent>
```

#### Modifica D7 — Aggiungere `salute` alla barra statistiche (tab Profilo)

Nel tab Profilo, sezione STATISTICHE, aggiungere `Salute` come voce **dopo `Morale`** (raggruppata con le stat fisico-mentali: Stanchezza, Stress, Morale, Salute):

```ts
// Inserire DOPO ['Morale', stats.morale ?? 60, 'text-accent'] e PRIMA di ['Reputazione', ...]:
['Salute', stats.salute, 'text-primary'],
```

### Ordine di esecuzione STEP 9D

1. Creare `src/components/HealthRecordPanel.tsx`
2. Modificare `src/components/CharacterSheet.tsx` (D1→D7)

### Verifica STEP 9D

```
Pylance: 0 errori in src/
Manuale: aprire CharacterSheet → tab Salute visibile e cliccabile
Manuale: verificare "Nessuna condizione attiva" come stato iniziale
Manuale: NVDA: navigare tab Salute → verificare che condizioni attive siano lette correttamente
Manuale: provocare un infortunio (palestra) e verificare che appaia nel tab Salute
```

### Prompt Copilot — STEP 9D

```
Implementa STEP 9D dal piano IMPLEMENTATION_PLAN_STEP9_HEALTH_SYSTEM.md.

1. Crea src/components/HealthRecordPanel.tsx con lo snippet completo dal piano.
   Pattern accessibilità: identico a DiaryPanel.tsx (role="list", sr-only context, no aria-hidden su testo).

2. In src/components/CharacterSheet.tsx:
   - Import Heart da @phosphor-icons/react, HealthRecord da types, HealthRecordPanel
   - Aggiungi healthRecord: HealthRecord alla props interface e al destructuring
   - Cambia grid-cols-4 → grid-cols-5
   - Aggiungi TabsTrigger value="salute" con icona Heart DOPO "diario" e PRIMA di "obiettivi"
   - Aggiungi TabsContent value="salute" con <HealthRecordPanel healthRecord={healthRecord} gameLog={gameLog} />
   - Aggiungi ['Salute', stats.salute, 'text-primary'] come PRIMA voce nella sezione Statistiche del tab Profilo

Verifica: 0 errori Pylance in src/
```

---

## STEP 9E — Condizioni gender-specific + eventi narrativi

### Checklist pre-implementazione
- [ ] STEP 9A-9D completati
- [ ] 0 errori Pylance
- [ ] Tab Salute funzionante con condizioni universali
- [ ] `PlayerProfile.gender` accessibile

### Panoramica

STEP 9E aggiunge:
1. **Tracking ciclo mestruale** con ricorrenza automatica ogni 28 giorni
2. **Gravidanza** come condizione a lungo termine con eventi narrativi
3. **Campo `nextCycleDate`** in `HealthRecord` per tracking ricorrenza

### File: `src/lib/types.ts`

#### Modifica E1 — Aggiungere `nextCycleDate` a `HealthRecord`

```ts
export interface HealthRecord {
  conditions: ActiveCondition[]
  lastCheckupDate?: GameDate
  nextCycleDate?: GameDate  // STEP 9E: prossima data ciclo (solo femmina)
}
```

### File: `src/hooks/useHealthSystem.ts`

#### Modifica E2 — Import `advanceGameDate` helper

Creare una helper function in `src/lib/time-utils.ts` O inline nel hook:

```ts
// Helper: avanza una GameDate di N giorni (semplificata)
function addDaysToDate(date: GameDate, days: number): GameDate {
  const d = new Date(date.year, date.month - 1, date.day + days)
  return { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() }
}

function isDateReached(current: GameDate, target: GameDate): boolean {
  const c = current.year * 10000 + current.month * 100 + current.day
  const t = target.year * 10000 + target.month * 100 + target.day
  return c >= t
}
```

#### Modifica E3 — Logica ciclo in `tickConditions`

Aggiungere ALLA FINE di `tickConditions`, dopo il loop delle condizioni:

```ts
// STEP 9E: gestione ciclo mestruale automatico
if (playerGender === 'femmina') {
  const rec = healthRecordRef.current
  const activeIds = new Set(rec.conditions.map((c) => c.id))

  // Inizializzazione nextCycleDate se mancante
  if (!rec.nextCycleDate) {
    setHealthRecord((prev) => ({
      ...prev,
      nextCycleDate: addDaysToDate(currentDate, 28),
    }))
  } else if (isDateReached(currentDate, rec.nextCycleDate) && !activeIds.has('ciclo_mestruale')) {
    applyCondition('ciclo_mestruale', currentDate, 'mattina')
    setHealthRecord((prev) => ({
      ...prev,
      nextCycleDate: addDaysToDate(currentDate, 28),
    }))
  }
}
```

#### Modifica E4 — Logica gravidanza: eventi narrativi progressivi

La gravidanza, con durata 280 giorni, genera eventi narrativi a milestones specifiche. Aggiungere in `tickConditions`, dentro il loop delle condizioni, un check specifico per gravidanza:

```ts
// Dentro il map delle condizioni, dopo il check daysElapsed:
if (c.id === 'gravidanza') {
  const milestones: Record<number, string> = {
    30: 'Inizi ad avere nausee mattutine... qualcosa non va.',
    90: 'La pancia inizia a vedersi. I compagni di scuola parlano.',
    180: 'Ormai è evidente. I tuoi genitori lo hanno scoperto.',
    240: 'Ti senti pesante e stanca. Mancano poche settimane.',
    270: 'Ultima settimana. Tutto sta per cambiare.',
  }
  const milestone = milestones[updated.daysElapsed]
  if (milestone) {
    addLogEntry('health', `Gravidanza — giorno ${updated.daysElapsed}`, milestone, 'neutral', currentDate, 'mattina')
  }

  // Effetti progressivi ogni 30 giorni
  if (updated.daysElapsed % 30 === 0 && updated.daysElapsed > 0) {
    setStats((s) => ({
      ...s,
      stanchezza: clampStat(s.stanchezza + 5),
      stress: clampStat(s.stress + 3),
    }))
  }
}
```

### Note design STEP 9E

1. **Ciclo mestruale**: ricorrenza automatica ogni 28 giorni. La condizione dura 5 giorni (debuff -5 morale, -5 muscoli applicati one-shot e ripristinati a fine ciclo). Il campo `nextCycleDate` in `HealthRecord` traccia la prossima occorrenza.

2. **Gravidanza**: condizione complessa con 280 giorni di durata. Apply by specific game events (non automatica). Effetti progressivi: ogni 30 giorni +5 stanchezza +3 stress (cumulative permanente tramite setStats diretto). Milestones narrativi a 30, 90, 180, 240, 270 giorni.

3. **Guard genere**: tutti i template gender-specific hanno `genderRestricted: 'femmina'`. L'`applyCondition` controlla il genere del giocatore e ignora silenziosamente se non compatibile.

4. **Gravidanza trigger**: NON automatica — richiede un evento specifico (es. azione con ragazza, evento random). Il trigger esatto è da definire in un futuro step di eventi narrativi legati al sistema relazioni. Per ora, `applyCondition('gravidanza', ...)` è disponibile ma non viene mai chiamato automaticamente.

### Ordine di esecuzione STEP 9E

1. `src/lib/types.ts` — Modifica E1
2. `src/hooks/useHealthSystem.ts` — Modifiche E2, E3, E4

### Verifica STEP 9E

```
Pylance: 0 errori in src/
Manuale (personaggio femmina): avanzare 28+ giorni → verificare onset automatico ciclo
Manuale: verificare che ciclo duri 5 giorni e poi si risolva
Manuale: verificare che nextCycleDate si aggiorni dopo ogni ciclo
Manuale (personaggio maschio): verificare che il ciclo NON scatti mai
```

### Prompt Copilot — STEP 9E

```
Implementa STEP 9E dal piano IMPLEMENTATION_PLAN_STEP9_HEALTH_SYSTEM.md.

1. In src/lib/types.ts:
   - Aggiungi nextCycleDate?: GameDate a HealthRecord

2. In src/hooks/useHealthSystem.ts:
   - Aggiungi helper addDaysToDate e isDateReached (inline nel file)
   - In tickConditions: se playerGender === 'femmina', gestisci ricorrenza ciclo_mestruale ogni 28 giorni via nextCycleDate
   - In tickConditions: se condizione attiva è 'gravidanza', genera log narrativi a milestones (30, 90, 180, 240, 270 giorni) e applica effetti progressivi ogni 30 giorni

Non attivare gravidanza automaticamente — solo ciclo_mestruale è automatico via nextCycleDate.
Verifica: 0 errori Pylance in src/
```

---

## Riepilogo completo

| STEP | File modificati | Descrizione |
|---|---|---|
| **9A** | `types.ts` | Tipi, costanti, mappa `HEALTH_CONDITIONS` |
| **9B** | `useHealthSystem.ts` (NUOVO) | Hook completo con `applyCondition`, `removeCondition`, `tickConditions`, `checkAutoConditions`, `canAttendSchool` |
| **9C** | `App.tsx`, `useGameTime.ts`, `useGameActions.ts` | Montaggio hook, callback integration, trigger condizioni da azioni, guard scuola, reset |
| **9D** | `HealthRecordPanel.tsx` (NUOVO), `CharacterSheet.tsx` | UI condizioni attive + storico clinico, tab Salute, barra salute in Statistiche |
| **9E** | `types.ts`, `useHealthSystem.ts` | `nextCycleDate`, ricorrenza ciclo, eventi narrativi gravidanza |

### Ordine esecuzione globale

```
9A → 9B → 9C → 9D → 9E
```

Ogni STEP è auto-contenuto: dopo la verifica Pylance, il codice compila senza errori. Le funzionalità si attivano progressivamente (9A-9B definiscono il sistema, 9C lo integra, 9D lo rende visibile, 9E aggiunge complessità).
