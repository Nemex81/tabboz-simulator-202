# Piano Implementazione: Sottomenu Personaggio + Stress & Morale

> **Stato:** VALIDATO CON CORREZIONI — 2 bug risolti rispetto al piano originale  
> **Data:** 6 aprile 2026  
> **File coinvolti:** 4 (`types.ts`, `game-utils.ts`, `useGameActions.ts`, `CharacterSheet.tsx`)  
> **File NON toccati:** `App.tsx`, `CityPanel.tsx`, `useGameTime.ts`, `useEventEngine.ts`, `GameDialogs.tsx`

---

## Correzioni Applicate al Piano Originale

### BUG 1 — `handleStudia` NON ha `setStats`
**Originale:** "In `handleStudia`: aggiungi al `setStats`: `stress +15`"  
**Problema:** `handleStudia` apre solo il dialog (`setShowSubjectDialog(true)`). È `handleStudySubject` il vero handler che chiama `setStats`.  
**Fix:** L'aggiunta di `stress: clampStat(current.stress + 15)` va in `handleStudySubject` (dove già c'è `stanchezza + 20`).

### BUG 2 — `handleDisco` isDiscoBlocked posizionamento
**Originale:** "Prima del setStats nel caso successo, controlla isDiscoBlocked"  
**Problema:** A quel punto il codice è già dentro il branch `if (randomChance(successChance))`. Se blocchiamo lì, il branch `else` (fallimento) verrebbe eseguito e scalati 60€ comunque.  
**Fix:** Il check `isDiscoBlocked` va aggiunto come **early return guard** in cima a `handleDisco`, DOPO il check `stanchezza > 70` e PRIMA della logica successo/fallimento.

---

## STEP 1 — `src/lib/types.ts`

Nell'interfaccia `GameStats`, aggiungi dopo `stanchezza`:
```ts
stress: number       // 0-100: stanchezza mentale
morale: number       // 0-100: stato emotivo
```

In `DEFAULT_GAME_STATE.stats`, aggiungi dopo il valore di `stanchezza`:
```ts
stress: 10,
morale: 60,
```

---

## STEP 2 — `src/lib/game-utils.ts`

Aggiungi alla fine del file questa funzione (non modificare niente di esistente):
```ts
export function getMentalStateModifiers(stress: number, morale: number): {
  studyEfficiencyMultiplier: number
  socialSuccessBonus: number
  carismaBonus: number
  isDiscoBlocked: boolean
  crisiNervosa: boolean
} {
  const studyEfficiencyMultiplier =
    stress > 80 ? 0.6 :
    stress > 60 ? 0.8 :
    1.0

  const socialSuccessBonus =
    morale > 80 ? 10 :
    morale < 30 ? -15 :
    0

  const carismaBonus = morale > 80 ? 10 : 0

  const isDiscoBlocked = morale < 20
  const crisiNervosa = stress > 80 && morale < 30

  return { studyEfficiencyMultiplier, socialSuccessBonus, carismaBonus, isDiscoBlocked, crisiNervosa }
}
```

---

## STEP 3 — `src/hooks/useGameActions.ts`

### 3a — Import
Aggiungi `getMentalStateModifiers` all'import da `@/lib/game-utils`.

### 3b — `handleStudySubject` (⚠️ CORRETTO da piano originale)

**Efficacia studio:** Dopo la riga:
```ts
const gradeIncrease = calculateStudyGradeIncrease(s.intelligenza, hasFriendBonus)
```
Aggiungi:
```ts
const mentalState = getMentalStateModifiers(s.stress ?? 0, s.morale ?? 60)
const adjustedGradeIncrease = Math.max(0.05, gradeIncrease * mentalState.studyEfficiencyMultiplier)
```
Usa `adjustedGradeIncrease` al posto di `gradeIncrease` nel `setGrades`.

**Stress da studio:** Nel `setStats` di `handleStudySubject`, aggiungi:
```ts
stress: clampStat(current.stress + 15)
```

**Messaggio:** Se `mentalState.studyEfficiencyMultiplier < 1`, appendi al messaggio announce: ` (STRESS ALTO: efficacia ridotta!)`

### 3c — `handleDisco` (⚠️ CORRETTO da piano originale)

**Guard morale basso — EARLY RETURN:** Subito dopo il check `stanchezza > 70` (e PRIMA di `playSound.buttonClick()`), aggiungi:
```ts
if (getMentalStateModifiers(s.stress ?? 0, s.morale ?? 60).isDiscoBlocked) {
  playSound.failure()
  announce('Sei troppo giù di morale per andare in disco!')
  return
}
```

**Successo** — aggiungi al `setStats`:
```ts
stress: clampStat(current.stress - 20),
morale: clampStat(current.morale + 15)
```

**Fallimento** — aggiungi al `setStats`:
```ts
stress: clampStat(current.stress - 5),
morale: clampStat(current.morale - 10)
```

### 3d — `handleCinema`
In ENTRAMBI i `setStats` (successo e fallimento):
```ts
stress: clampStat(current.stress - 10),
morale: clampStat(current.morale + 10)
```

### 3e — `handlePalestra`
Aggiungi al `setStats`:
```ts
morale: clampStat(current.morale + 5)
```

### 3f — `handleRiposa`
Aggiungi al `setStats`:
```ts
stress: clampStat(current.stress - 10),
morale: clampStat(current.morale + 3)
```

### 3g — `handleChiacchiera`
Aggiungi al `setStats`:
```ts
stress: clampStat(current.stress - 5),
morale: clampStat(current.morale + 5)
```

### 3h — `handleParco`
Aggiungi al `setStats`:
```ts
stress: clampStat(current.stress - 15),
morale: clampStat(current.morale + 8)
```

---

## STEP 4 — `src/components/CharacterSheet.tsx`

### 4a — Import aggiuntivi
Aggiungi all'import da `@/components/ui/tabs`:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
```

### 4b — Nuove stat nella lista
Nella lista delle statistiche, dopo `['Stanchezza', stats.stanchezza, 'text-destructive']`, aggiungi:
```tsx
['Stress', stats.stress ?? 0, 'text-destructive'],
['Morale', stats.morale ?? 60, 'text-accent'],
```

### 4c — aria-label Stanchezza
Nello `<span>` del valore, cambia l'aria-label per il caso `label === 'Stanchezza'`:
```
aria-label={`${label === 'Stanchezza' ? 'Stanchezza fisica' : label}: ${label === 'Soldi' ? `${value} euro` : `${value} su 100`}`}
```

### 4d — Sotto-tab wrapper
Sostituisci il `<div className="space-y-6 mt-6">` radice con:
```tsx
<Tabs defaultValue="profilo" className="w-full mt-6">
  <TabsList className="grid w-full grid-cols-4 gap-1 bg-muted/50 p-1 h-auto mb-6">
    <TabsTrigger value="profilo">
      <IdentificationCard size={18} className="mr-1" weight="fill" aria-hidden="true" />
      <span className="hidden sm:inline">Profilo</span>
      <span className="sm:hidden">👤</span>
    </TabsTrigger>
    <TabsTrigger value="aspetto" disabled aria-label="Aspetto: non ancora disponibile">
      <span className="hidden sm:inline">Aspetto</span>
      <span className="sm:hidden">👕</span>
      <span className="ml-1 text-xs opacity-50">🔜</span>
    </TabsTrigger>
    <TabsTrigger value="diario" disabled aria-label="Diario: non ancora disponibile">
      <span className="hidden sm:inline">Diario</span>
      <span className="sm:hidden">📓</span>
      <span className="ml-1 text-xs opacity-50">🔜</span>
    </TabsTrigger>
    <TabsTrigger value="obiettivi" disabled aria-label="Obiettivi: non ancora disponibile">
      <span className="hidden sm:inline">Obiettivi</span>
      <span className="sm:hidden">🏆</span>
      <span className="ml-1 text-xs opacity-50">🔜</span>
    </TabsTrigger>
  </TabsList>
  <TabsContent value="profilo">
    <div className="space-y-6">
      {/* ...tutte e 4 le sezioni esistenti invariate... */}
    </div>
  </TabsContent>
</Tabs>
```

---

## Riepilogo Modificatori Runtime

| Condizione | Effetto |
|---|---|
| `stress > 60` | Studio -20% efficacia |
| `stress > 80` | Studio -40% efficacia, `morale -1` ogni giorno (futuro, non in questo piano) |
| `morale < 30` | Azioni sociali -15% successo (futuro, non in questo piano) |
| `morale < 20` | Disco bloccato ("Non hai voglia di uscire") |
| `morale > 80` | Carisma +10 bonus implicito (futuro, non in questo piano) |
| `stress > 80 AND morale < 30` | Evento "Crisi Nervosa" (futuro, non in questo piano) |

> **Nota:** In questo piano implementiamo solo `studyEfficiencyMultiplier` e `isDiscoBlocked` come modificatori attivi. Gli altri (`socialSuccessBonus`, `carismaBonus`, `crisiNervosa`) vengono calcolati dalla funzione `getMentalStateModifiers` ma non sono ancora agganciati a nessun handler — sono predisposti per future integrazioni.

---

## Checklist Pre-Implementazione

- [ ] `stress` / `morale` non esistono in `GameStats` → da aggiungere
- [ ] `getMentalStateModifiers` non esiste in `game-utils.ts` → da aggiungere
- [ ] `handleStudia` **NON** chiama `setStats` → stress va in `handleStudySubject`
- [ ] `isDiscoBlocked` guard va in cima a `handleDisco` (early return)
- [ ] Import `Tabs` in `CharacterSheet.tsx` → non presente → da aggiungere
- [ ] Nessun file fuori scope viene toccato
