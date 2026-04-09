# PIANO IMPLEMENTAZIONE — STEP 13.5
## Azione motorino sera/sabato → StreetRaceDialog

**Data:** 09 aprile 2026  
**Stato:** ✅ COMPLETATO  
**Build:** `tsc --noEmit` → zero errori

---

## Obiettivo

Connettere l'azione `handleMotorino` nella fase sera/sabato all'apertura di `StreetRaceDialog`
con dati reali generati da `generateStreetRace()`.

---

## Fasi eseguite (7/7)

| # | Fase | Stato |
|---|------|--------|
| 1 | Smoke test + lettura stato TODO | ✅ completato |
| 2 | Analisi file rilevanti (Agent-Analyze) | ✅ completato |
| 3 | Strategia e scelta soluzione (Plan) | ✅ completato |
| 4 | Implementazione chirurgica (Agent-Code) | ✅ completato |
| 5 | Validazione TypeScript | ✅ completato — zero errori |
| 6 | Aggiornamento TODO.md | ✅ completato |
| 7 | Report finale | ✅ completato |

> **Nota:** `validate_gates.py` non presente (progetto TypeScript). Validazione eseguita con `npx tsc --noEmit`.

---

## Strategia scelta: Opzione A — Callback chain

La callback `onOpenStreetRace` percorre la catena:

```
App.tsx → useGameActions → useEconomyActions
```

Pattern identico a `triggerRandomEvent`, già presente nell'architettura.  
Parametri opzionali con `?:` → zero breaking change su interfacce esistenti.

---

## File modificati

### `src/hooks/useEconomyActions.ts`
- Import `BetInfo` e `generateStreetRace` da `@/lib/bet-system`
- Campo `onOpenStreetRace?: (betInfo: BetInfo) => void` aggiunto all'interface locale `UseEconomyActionsParams`
- Ref stabile `onOpenStreetRaceRef` (pattern uguale a `dayTypeRef`)
- Branch sera/sabato aggiunto in `handleMotorino`:

```typescript
// STEP 13.5 — gara motorino sera/sabato
if ((dayTypeRef.current === 'sabato' || dayTypeRef.current === 'festivo')
  && currentPhaseRef.current === 'sera'
  && onOpenStreetRaceRef.current) {
  const race = generateStreetRace(s.reputazione)
  consumeAction()
  announce('Una GARA ti aspetta! Qualcuno vuole sfidarti stasera...')
  addLogEntry('event_neutral', 'Sfida in gara di motorini', 'Una sfida diretta stasera!', 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
  onOpenStreetRaceRef.current(race)
  return
}
```

### `src/hooks/types.ts`
- Import `BetInfo` da `@/lib/bet-system`
- Campo aggiunto a `UseGameActionsParams`:

```typescript
onOpenStreetRace?: (betInfo: BetInfo) => void
```

### `src/hooks/useGameActions.ts`
- `onOpenStreetRace` estratto dal destructuring dei params
- Passato al call site di `useEconomyActions({ ..., onOpenStreetRace })`

### `src/App.tsx`
- Import `BetInfo` da `@/lib/bet-system`
- Callback creata e passata a `useGameActions`:

```typescript
onOpenStreetRace: (race: BetInfo) => {
  events.setBetInfo(race)
  setShowStreetRaceEvent(true)
},
```

---

## Flusso reale dell'azione

```
handleMotorino (sera di sabato o festivo)
  └─ check: dayTypeRef 'sabato'/'festivo'
          + currentPhaseRef 'sera'
          + onOpenStreetRaceRef.current?
            │
            ├─ generateStreetRace(s.reputazione)   [bet-system.ts]
            ├─ consumeAction()
            ├─ announce('Una GARA ti aspetta...')
            ├─ addLogEntry(...)
            └─ onOpenStreetRaceRef.current(race)
                 ├─ events.setBetInfo(race)         [useEventEngine]
                 └─ setShowStreetRaceEvent(true)    [App.tsx → GameDialogs → StreetRaceDialog]
```

---

## Validazione

| Check | Risultato |
|-------|-----------|
| `npx tsc --noEmit` | ✅ zero errori |
| `generateStreetRace` in `useEconomyActions.ts` | ✅ riga 143 confermata |
| `onOpenStreetRace` in `App.tsx` | ✅ righe 258-259 confermate |
| `handleMotorino` ancora presente in `App.tsx` | ✅ confermato |
| `TODO.md` aggiornato | ✅ STEP 13 `[x]`, tutte le checkbox 13.5 spuntate |

---

## File NON modificati

- `src/lib/bet-system.ts`
- `src/hooks/useEventEngine.ts`
- `src/components/dialogs/StreetRaceDialog.tsx`
- `src/components/GameDialogs.tsx`
- Qualsiasi altro file del progetto

---

## TODO residui

Nessuno per STEP 13. **STEP 13 è completamente chiuso.**  
Il push al repository remoto va eseguito manualmente dall'utente.

---

## Prossimi step suggeriti

Verificare la lista STEP 14+ in `docs/TODO.md` per pianificare la prossima sessione di implementazione.
