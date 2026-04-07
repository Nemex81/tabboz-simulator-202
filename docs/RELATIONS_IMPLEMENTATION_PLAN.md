# RELATIONS_IMPLEMENTATION_PLAN.md
## Piano Tecnico Implementativo — Sistema Relazioni e Amicizie
**Versione:** 1.0  
**Data:** 2026-04-06  
**Basato su:** RELATIONS_SYSTEM_PLAN.md v1.0  
**Stato:** CONVALIDATO — pronto per implementazione

---

## 0. RAPPORTO DI ANALISI — Risultanze audit codebase

### 0.1 Stato del codice verificato

| File | Righe | Stato | Note |
|---|---|---|---|
| `src/lib/types.ts` | ~500 | Stabile | `Friend` piatto (solo `affinita`), `RelationshipTier` ha 7 valori, `SocialBondType` ha 2 valori |
| `src/lib/enhanced-friend-system.ts` | ~200 | Stabile | 6 `FRIEND_ACTIONS`, `applyFriendActionEffects()` con switch monolitico |
| `src/lib/social-system.ts` | ~150 | Stabile | `checkNewFriendEvent(carisma, location)` — param `location` **ignorato** |
| `src/lib/school-morning-events.ts` | ~250 | Stabile | Pool 10 eventi, nessun trigger per generazione compagni |
| `src/lib/phase-actions.ts` | ~120 | Stabile | Solo definizioni azioni per fase, nessuna logica generazione amici |
| `src/lib/girlfriend-system.ts` | ~500 | Stabile (**NO TOUCH**) | Sistema Ragazza autonomo e completo |
| `src/App.tsx` | ~750 | Complesso | `friends` e `relationships` sono KV store **separati** da `GameState` |
| `src/hooks/useGameTime.ts` | ~300 | Stabile | `advanceToNextDay()` = punto innesto erosione, **non ha accesso a friends** |
| `src/hooks/useGameActions.ts` | ~400 | Stabile | `handleFriendAction()` delegato a `applyFriendActionEffects()` |
| `src/hooks/useEventEngine.ts` | ~300 | Stabile | `checkForNewFriend(location)` — limit attuale: `friends.length < 4` |
| `src/components/CharacterSheet.tsx` | ~200 | Stabile | **Non riceve friends/relationships** come props |
| `src/components/EnhancedFriendsPanel.tsx` | ~250 | Stabile | Mostra tutti gli amici in griglia con azioni |
| `src/components/FriendsPanel.tsx` | ~80 | Stabile | Solo visualizzazione read-only (non usato nel tab attivo) |
| `src/components/RelationshipsPanel.tsx` | ~120 | Stabile | Gestisce Relationship[] → pipeline conquista ragazza |

---

### 0.2 Problemi rilevati nel RELATIONS_SYSTEM_PLAN.md

| # | Problema | Severità | Correzione applicata in questo piano |
|---|---|---|---|
| P1 | Il piano dice "aggiungere `friends: Friend[]` a `GameState`" — ma `friends` è un **KV store separato** in App.tsx, non parte di `GameState`. Modificare `GameState` romperebbe validazione, persistenza e default. | **CRITICA** | Mantenere `friends` come KV store separato. Non toccare `GameState`. |
| P2 | `useGameTime` **non ha accesso** a `friends`/`setFriends`. Il piano vuole `applyDailyErosion` dentro `advanceToNextDay()` ma non può chiamare `setFriends`. | **ALTA** | Usare pattern callback: aggiungere `onDayAdvanced?: () => void` ai params di `useGameTime`. App.tsx passa il callback che chiama `applyDailyErosion`. |
| P3 | `RelationshipTier` attuale include `'trombamica'` e `'fidanzata'` (femminile) referenziate dalla UI e da `getRelationshipTierLabel()`. Il piano li sostituisce con valori diversi senza retrocompatibilità. | **ALTA** | Creare un NUOVO tipo `RelationTierV2` nel file `relation-system.ts` per il sistema 4-assi. Mantenere `RelationshipTier` originale invariato per non rompere l'esistente. I due sistemi coesistono; `EnhancedFriendsPanel` migra progressivamente. |
| P4 | Le 32 interazioni proposte **sostituiscono** le 6 `FRIEND_ACTIONS` esistenti, ma `EnhancedFriendsPanel` e `useGameActions.handleFriendAction()` le usano direttamente. Sostituzione non atomica. | **ALTA** | Fase di transizione: `FRIEND_ACTIONS` legacy restano operative. Le 32 interazioni vivono in `INTERACTION_CATALOG` separato, usato SOLO dai nuovi pannelli UI. Migrare `handleFriendAction` solo dopo che la nuova UI è stabile. |
| P5 | `Relationship[]` (ragazze da conquistare) coesiste col nuovo `rel.romantico` sui Friend. Il piano non spiega come evitare sovrapposizione. | **MEDIA** | `Relationship[]` resta il pipeline di corteggiamento → `Ragazza`. Il campo `rel.romantico` su Friend è per NPC generici (amici/conoscenti). I due canali sono separati per design: **Friend.rel.romantico** = crush informale, **Relationship → Ragazza** = relazione strutturata. |
| P6 | `checkNewFriendEvent()` in `social-system.ts` ignora `location`, ma è chiamato da `useEventEngine.checkForNewFriend(location)`, che a sua volta è chiamato da `useGameActions` per palestra/disco/cinema. Il piano vuole usare `location` per modulare probabilità ma non specifica la formula. | **MEDIA** | Definire bonus probabilità per location: `{classe: +10, corridoio: +5, quartiere: +0, palestra: +8, festa: +15, sport: +5, online: +3, lavoro: +5}`. Applicare come `totalChance = base + carismaBonus + locationBonus`. |
| P7 | Limite amici attuale = 4 (`useEventEngine`). Il piano propone 6+4+8 = **18** NPC attivi massimi, quasi 5x l'attuale. Rischio performance UI e complessità stato. | **MEDIA** | Ridurre a: 4 compagni classe, 3 compagni istituto, 6 extrascolastici = **13 max**. Più realistico e gestibile per l'UI a card. |
| P8 | `school-morning-events.ts` ha un evento `sm_nuovo_amico` che già simula l'incontro di un compagno, ma solo come effetto su stats (+8 Carisma). Non genera un `Friend`. | **BASSA** | Estendere `sm_nuovo_amico` per aggiungere un `generateSchoolFriend()` nell'outcome di successo. |

---

### 0.3 Ottimizzazioni applicate

| # | Ottimizzazione | Motivazione |
|---|---|---|
| O1 | `RelationStats` usa interi (0-100), non float. `applyDailyErosion` usa interi arrotondati a `Math.floor`. | Evita drift floating point. Coerente col resto del codebase (tutti i valori stats sono interi 0-100). |
| O2 | `getRelationTier()` consolidato con uscita anticipata. Ordine: odio → amore → romantico → amicizia → default. | Minimizza branch evaluations. Il caso più narrativamente urgente (nemico) viene valutato per primo. |
| O3 | `INTERACTION_CATALOG` è un `Record<string, InteractionDef>` anziché array. Lookup O(1) per id. | `checkInteractionAvailable()` e `applyInteractionEffects()` non devono fare `.find()` su array ogni volta. |
| O4 | `applyDailyErosion()` è pure function: riceve `Friend[]` e `GameDate`, restituisce `Friend[]` nuovo. Nessun side-effect. | Testabilità unitaria totale. Chiamabile da test senza React. |
| O5 | La nuova UI usa un singolo componente `RelationCard` riusabile, non 3 pannelli separati. `EnhancedFriendsPanel` viene refactorato, non duplicato. | Riduce bundle size e manutenzione. Contratto UI identico per tutti i tipi di NPC. |
| O6 | `migrateLegacyFriend()` è idempotente (se `f.rel` esiste, ritorna `f` invariato). Può essere chiamata ripetutamente senza costo. | Robustezza: nessun rischio di doppia migrazione al reload da KV. |
| O7 | Le categorie interazione R1/R2/A del piano originale vengono rinumerate come categorie 4/5/6 per coerenza con l'indice 0-based. Categoria N diventa 7. | Consistenza interna, semplifica logica filtro UI per categoria. |

---

## 1. STRUTTURA DATI FINALE

### 1.1 RelationStats (NUOVO — in `relation-system.ts`)

```typescript
export interface RelationStats {
  amicizia:  number  // 0-100 — vicinanza, fiducia, tempo passato insieme
  romantico: number  // 0-100 — attrazione, flirt, tensione sentimentale
  amore:     number  // 0-100 — legame profondo (condizionato)
  odio:      number  // 0-100 — risentimento, rivalità, tradimenti
}

export const DEFAULT_RELATION_STATS: RelationStats = {
  amicizia: 0, romantico: 0, amore: 0, odio: 0
}
```

Regole inter-asse invariate dal piano originale (sezione 3.1).

### 1.2 Friend aggiornato (in `types.ts`)

```typescript
export interface Friend {
  // ── campi esistenti (INVARIATI) ──────────────────────────────
  id:           string
  name:         string
  type:         FriendType
  intelligenza?: number
  unlocked:     boolean

  // ── NUOVO: contesto di origine ───────────────────────────────
  originType:     'compagno_classe' | 'compagno_istituto' | 'extrascolastico'
  metAt?:         'classe' | 'corridoio' | 'quartiere' | 'palestra'
                | 'online' | 'festa' | 'sport' | 'lavoro'
  schoolYearMet?: number

  // ── NUOVO: assi relazionali ──────────────────────────────────
  rel?: RelationStats      // opzionale per retrocompatibilità

  // ── NUOVO: tracking temporale ────────────────────────────────
  lastInteractionDay?: number  // giorno progressivo (dayIndex) dell'ultima interazione

  // ── DEPRECATO (mantenuto per migrazione) ─────────────────────
  affinita?: number                // legacy, letto solo da migrateLegacyFriend()
  tier?:     RelationshipTier      // legacy, ora derivato da getRelationTierV2()
  bondType?: SocialBondType        // legacy, ora derivato
}
```

**Nota critica su `affinita`:** Il campo diventa opzionale (`affinita?: number`). Tutti i punti del codice che leggono `friend.affinita` devono usare il getter `getAffinita(friend)` che restituisce `friend.rel?.amicizia ?? friend.affinita ?? 50`. Questo getter va esportato da `relation-system.ts`.

**Nota su `lastInteractionDay`:** Usare un indice progressivo (numero di giorni dall'inizio del gioco) anziché `GameDate` per semplificare i confronti. Funzione helper `dateToDayIndex(date: GameDate): number` in `relation-system.ts`.

### 1.3 RelationTierV2 (NUOVO — in `relation-system.ts`)

```typescript
export type RelationTierV2 =
  | 'sconosciuto'
  | 'conoscente'
  | 'amico'
  | 'amico_stretto'
  | 'migliore_amico'
  | 'interesse_romantico'
  | 'innamorato_a'
  | 'fidanzato_a'
  | 'rivale'
  | 'nemico_giurato'
```

Il tipo `RelationshipTier` esistente in `types.ts` **NON viene toccato**.

### 1.4 Valori iniziali per originType (invariati dal piano)

| originType | amicizia | romantico | amore | odio |
|---|---|---|---|---|
| compagno_classe | 15 | 0 | 0 | 0 |
| compagno_istituto | 5 | 0 | 0 | 0 |
| extrascolastico | 10 | 0 | 0 | 0 |
| (legacy migrazione) | `affinita` esistente | 0 | 0 | 0 |

---

## 2. FILE DA CREARE

### 2.1 `src/lib/relation-system.ts` (NUOVO — ~400 righe stimate)

Contenuto esportato:

```typescript
// ── Tipi ──────────────────────────────────────────────────────
export interface RelationStats { ... }
export type RelationTierV2 = ...
export interface InteractionDef {
  id: string
  category: number               // 0-7
  categoryLabel: string           // per visualizzazione
  label: string
  description: string
  prereq: Partial<RelationStats> & { odioMax?: number }
  effects: Partial<RelationStats> & { statsEffects?: Partial<GameStats> }
  failEffects?: Partial<RelationStats> & { statsEffects?: Partial<GameStats> }
  failChance?: number             // 0-100, assente = deterministico
}

// ── Costanti ──────────────────────────────────────────────────
export const DEFAULT_RELATION_STATS: RelationStats
export const INTERACTION_CATALOG: Record<string, InteractionDef>
  // 32 interazioni dal piano originale (sezione 6), catalogate per id

export const ORIGIN_INITIAL_STATS: Record<Friend['originType'], RelationStats>

export const LOCATION_PROB_BONUS: Record<string, number>
  // classe: 10, corridoio: 5, quartiere: 0, palestra: 8, festa: 15, ...

export const MET_AT_TYPE_WEIGHTS: Record<string, Record<FriendType, number>>
  // Mappatura metAt → FriendType dal piano originale (sezione 8.3)

// ── Funzioni core ─────────────────────────────────────────────
export function getRelationTierV2(rel: RelationStats): RelationTierV2
export function getRelationTierV2Label(tier: RelationTierV2): string

export function getAffinita(friend: Friend): number
  // Getter compatibilità: rel?.amicizia ?? affinita ?? 50

export function checkInteractionAvailable(
  id: string,
  rel: RelationStats
): { canUse: boolean; reason?: string }

export function applyInteractionEffects(
  id: string,
  rel: RelationStats,
  stats: GameStats
): { newRel: RelationStats; newStats: Partial<GameStats>; message: string; success: boolean }

export function applyDailyErosion(
  friends: Friend[],
  currentDayIndex: number
): Friend[]

export function migrateLegacyFriend(f: Friend): Friend

export function dateToDayIndex(date: GameDate): number
  // (date.year - 2026) * 365 + (date.month - 1) * 30 + date.day
  // Approssimazione sufficiente per confronti relativi
  // NOTA: approssimazione (mesi = 30gg fissi). Adatta solo a confronti
  // relativi di inattività. Non usare per calcoli di data precisi.

export function clampRel(rel: RelationStats): RelationStats
  // Clampa tutti i valori a 0-100
```

### 2.2 `src/components/RelationCard.tsx` (NUOVO — ~120 righe stimate)

Componente riusabile per visualizzare un singolo NPC con 4 barre relazionali.

```typescript
interface RelationCardProps {
  friend: Friend
  stats: GameStats
  actionsRemaining: number
  onInteraction: (friendId: string, interactionId: string) => void
  compact?: boolean  // true per lista compagni scuola (meno dettaglio)
}
```

Visualizza:
- Nome + icona tipo + badge originType
- 4 barre colorate: amicizia (verde), romantico (rosa), amore (rosso), odio (grigio antracite)
- Tier label V2 con emoji
- Lista interazioni disponibili filtrata da `checkInteractionAvailable()`
- Ogni bottone interazione mostra: label, costo azioni, possibilità fallimento

---

## 3. FILE DA MODIFICARE

### 3.1 `src/lib/types.ts`

**Modifiche:**
1. Aggiungere import di `RelationStats` da `relation-system.ts`
2. Aggiornare interfaccia `Friend`: aggiungere campi `originType`, `metAt?`, `schoolYearMet?`, `rel?`, `lastInteractionDay?`; rendere `affinita` opzionale (`affinita?: number`)
3. Aggiungere `'generico'` al tipo `FriendType` (se non già presente — **verifica**: è GIÀ presente nella definizione `type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'` ma i generatori non lo producono)
4. **NON** toccare `RelationshipTier`, `SocialBondType`, `GameState`, `Relationship`

**Rischi:** Rendere `affinita` opzionale rompe tutti i punti che leggono `friend.affinita` senza null-check. Mitigazione: usare `getAffinita(friend)` ovunque + grep-and-fix.

### 3.2 `src/lib/enhanced-friend-system.ts`

**Modifiche:**
1. Aggiungere `generateSchoolFriend(schoolType, schoolYear, isClassmate): Friend`
   - Usa `MET_AT_TYPE_WEIGHTS` per determinare tipo
   - Imposta `originType`, `metAt`, `schoolYearMet`, `rel` con valori iniziali
2. Aggiungere `generateExtraFriend(metAt): Friend`
   - Analogo, per amici extrascolastici
3. **NON rimuovere** `FRIEND_ACTIONS`, `applyFriendActionEffects`, `generateRandomEnhancedFriend` — restano per retrocompatibilità durante la transizione

### 3.3 `src/lib/social-system.ts`

**Modifiche:**
1. `checkNewFriendEvent(carisma, location)`: applicare `LOCATION_PROB_BONUS[location]` al calcolo probabilità
2. `getFriendStudyBonus(friends)`: aggiornare per usare `getAffinita(friend)` come peso aggiuntivo

### 3.4 `src/lib/school-morning-events.ts`

**Modifiche:**
1. Evento `sm_nuovo_amico`: l'outcome di successo genera un `Friend` con `originType: 'compagno_classe'` tramite `generateSchoolFriend()`. Restituire il nuovo Friend nell'outcome tramite campo aggiuntivo `newFriend?: Friend`.
2. Aggiungere interfaccia estesa opzionale per outcome con side-effects:
```typescript
export interface SchoolMorningOutcome {
  delta: Partial<GameStats>
  message: string
  newFriend?: Friend    // NUOVO
}
```

### 3.5 `src/hooks/useGameTime.ts`

**Modifiche:**
1. Aggiungere callback opzionale `onDayAdvanced?: (newDate: GameDate) => void` alla interfaccia `UseGameTimeParams`
2. In `advanceToNextDay()`, dopo tutti i check esistenti, chiamare `onDayAdvanced?.(newGameTime.currentDate)`
3. **NON** aggiungere `friends`/`setFriends` come parametri diretti (principio single-responsibility)

### 3.6 `src/hooks/useEventEngine.ts`

**Modifiche:**
1. `checkForNewFriend(location)`: aggiornare limite da 4 a limite dinamico basato su `originType`:
   - Contare separatamente: compagni_classe (max 4), compagni_istituto (max 3), extrascolastici (max 6)
   - Passare `location` per determinare `originType` del nuovo amico
2. La generazione usa `generateSchoolFriend()` o `generateExtraFriend()` in base al contesto

### 3.7 `src/hooks/useGameActions.ts`

**Modifiche:**
1. Aggiungere `handleRelationInteraction(friendId: string, interactionId: string)` — usa `applyInteractionEffects()` dal nuovo `relation-system.ts`
2. L'handler esistente `handleFriendAction` resta invariato per retrocompatibilità col vecchio `EnhancedFriendsPanel`
3. Aggiungere nel `UseGameActionsParams`: `setFriends: (updater) => void` (attualmente mancante — il set è gestito in `useEventEngine`)

### 3.8 `src/App.tsx`

**Modifiche:**
1. Import `migrateLegacyFriend`, `applyDailyErosion`, `dateToDayIndex` da `relation-system.ts`
2. Dopo `const friends = validateFriends(rawFriends)` aggiungere step migrazione:
   ```typescript
   const friends = validateFriends(rawFriends).map(migrateLegacyFriend)
   ```
3. Aggiungere callback `onDayAdvanced` che chiama `applyDailyErosion`:
   ```typescript
   const handleDayAdvanced = useCallback((newDate: GameDate) => {
     const dayIndex = dateToDayIndex(newDate)
     setFriends(current => applyDailyErosion(current, dayIndex))
   }, [setFriends])
   ```
4. Passare `onDayAdvanced` a `useGameTime`
5. In `handleSchoolSelection`: azzerare `unlocked` per compagni di classe quando si cambia scuola
6. In `handleReset`: i friends resetted devono avere array vuoto (già così)

### 3.9 `src/components/EnhancedFriendsPanel.tsx`

**Modifiche (Fase D):**
1. Aggiungere filtro per `originType`: prop `filter?: 'all' | 'school' | 'extra'`
2. Se `filter === 'school'`: mostra solo `compagno_classe` + `compagno_istituto`
3. Se `filter === 'extra'`: mostra solo `extrascolastico`
4. Se friend ha `rel`: usare `RelationCard` per la visualizzazione
5. Se friend NON ha `rel` (legacy non migrato): mostrare la card originale con barra `affinita`
6. Aggiungere prop `onRelationInteraction` opzionale, usato solo quando `rel` presente
7. Le 6 `FRIEND_ACTIONS` legacy restano disponibili per amici senza `rel`

### 3.10 `src/components/CharacterSheet.tsx`

**Modifiche (Fase D):**
1. Aggiungere a `CharacterSheetProps`: `friends?: Friend[]`, `stats: GameStats`, `actionsRemaining?: number`, `onRelationInteraction?: (friendId: string, interactionId: string) => void`
2. Aggiungere tab `relazioni` nella struttura Tabs, dopo `diario`
3. Il tab Relazioni renderizza `EnhancedFriendsPanel` con `filter='extra'` per amici extrascolastici
4. In futuro: mostrare link alla fidanzata (read-only) se presente

---

## 4. PIANO FASI IMPLEMENTATIVE

```
┌──────────────────────────────────────────────────────────┐
│ FASE A — Fondamenta dati                    [~3h stima]  │
├──────────────────────────────────────────────────────────┤
│ A1. Creare src/lib/relation-system.ts                    │
│     - RelationStats, RelationTierV2, InteractionDef      │
│     - getRelationTierV2(), getRelationTierV2Label()      │
│     - getAffinita() getter compatibilità                 │
│     - migrateLegacyFriend()                              │
│     - dateToDayIndex()                                   │
│     - clampRel()                                         │
│     - DEFAULT_RELATION_STATS, ORIGIN_INITIAL_STATS       │
│                                                          │
│ A2. Modificare src/lib/types.ts                          │
│     - Friend: +originType, +metAt?, +schoolYearMet?,     │
│       +rel?, +lastInteractionDay?, affinita → opzionale  │
│     - Import RelationStats (type-only)                   │
│                                                          │
│ A3. Grep & fix tutti i `friend.affinita` nel codebase    │
│     - Sostituire con getAffinita(friend) dove necessario │
│     - File coinvolti: enhanced-friend-system.ts,         │
│       EnhancedFriendsPanel.tsx, FriendsPanel.tsx,        │
│       data-validation.ts, social-system.ts               │
│                                                          │
│ A4. App.tsx: aggiungere .map(migrateLegacyFriend)        │
│     dopo validateFriends()                               │
│                                                          │
│ ✅ Criterio completamento: build OK, nessun TS error,    │
│    amici legacy funzionano esattamente come prima.       │
│    Test manuale: caricare save esistente, verificare      │
│    che amici sono visibili e interagibili.                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ FASE B — Logica interazioni                 [~4h stima]  │
├──────────────────────────────────────────────────────────┤
│ B1. relation-system.ts: INTERACTION_CATALOG              │
│     - 32 interazioni come da piano (sezione 6)           │
│     - Record<string, InteractionDef> per lookup O(1)     │
│     - Categorie 0-7 con prereq e effects                 │
│                                                          │
│ B2. relation-system.ts: checkInteractionAvailable()      │
│     - Valuta prereq vs RelationStats attuali             │
│     - Restituisce { canUse, reason? }                    │
│                                                          │
│ B3. relation-system.ts: applyInteractionEffects()        │
│     - Applica effects/failEffects basato su failChance   │
│     - Rispetta regole inter-asse (amore condizionato)    │
│     - Restituisce { newRel, newStats, message, success } │
│                                                          │
│ B4. relation-system.ts: applyDailyErosion()              │
│     - Implementa regole sezione 9 del piano              │
│     - odio > 60 → amicizia -1                            │
│     - amicizia > 70 → odio -1                            │
│     - Inattività > 30gg → amicizia -1                    │
│     - Inattività > 60gg → amicizia -2                    │
│     - Pure function: Friend[] in → Friend[] out          │
│                                                          │
│ B5. enhanced-friend-system.ts:                           │
│     + generateSchoolFriend()                             │
│     + generateExtraFriend()                              │
│     - Usano MET_AT_TYPE_WEIGHTS e ORIGIN_INITIAL_STATS   │
│                                                          │
│ ✅ Criterio: tutte le funzioni esportano e il build      │
│    compila. Test unitari manuali su console per           │
│    applyInteractionEffects e applyDailyErosion.          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ FASE C — Trigger & integrazione tempo       [~3h stima]  │
├──────────────────────────────────────────────────────────┤
│ C1. useGameTime.ts:                                      │
│     + onDayAdvanced callback in UseGameTimeParams        │
│     + Chiamata in advanceToNextDay() POST-esami          │
│                                                          │
│ C2. App.tsx:                                             │
│     + handleDayAdvanced con applyDailyErosion            │
│     + Passare callback a useGameTime                     │
│                                                          │
│ C3. social-system.ts:                                    │
│     + checkNewFriendEvent usa LOCATION_PROB_BONUS        │
│                                                          │
│ C4. useEventEngine.ts:                                   │
│     + Limiti per originType (4 classe, 3 istituto, 6     │
│       extra) anziché limite globale 4                    │
│     + Usa generateSchoolFriend / generateExtraFriend     │
│       in base al contesto di chiamata                    │
│                                                          │
│ C5. school-morning-events.ts:                            │
│     + sm_nuovo_amico outcome genera Friend reale         │
│     + SchoolMorningOutcome con newFriend? opzionale      │
│                                                          │
│ C6. App.tsx / SchoolMorningPanel:                        │
│     + Gestire newFriend nell'outcome e aggiungerlo       │
│       a friends via setFriends                           │
│                                                          │
│ C7. App.tsx handleSchoolSelection:                       │
│     + Azzerare unlocked per compagni_classe al cambio    │
│                                                          │
│ ✅ Criterio: nuovi amici si generano con originType      │
│    corretto. Erosione giornaliera verificabile dal       │
│    diario (amicizia cala dopo 30+ giorni senza           │
│    interazione). Cambio scuola rimuove compagni classe.  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ FASE D — UI                                 [~4h stima]  │
├──────────────────────────────────────────────────────────┤
│ D1. Creare src/components/RelationCard.tsx               │
│     - 4 barre colorate (Progress shadcn)                 │
│     - Tier V2 label con emoji                            │
│     - Lista interazioni filtrate per prereq              │
│     - Badge originType + metAt                           │
│                                                          │
│ D2. useGameActions.ts:                                   │
│     + handleRelationInteraction(friendId, interactionId) │
│     + Usa applyInteractionEffects dal nuovo sistema      │
│     + Aggiorna friend.rel e friend.lastInteractionDay    │
│     + Genera GameLogEntry di tipo 'social'               │
│                                                          │
│ D3. EnhancedFriendsPanel.tsx:                            │
│     + Prop filter: 'all' | 'school' | 'extra'           │
│     + Se friend.rel presente: usa RelationCard           │
│     + Se friend legacy: usa card originale               │
│     + Prop onRelationInteraction callback                │
│                                                          │
│ D4. CharacterSheet.tsx:                                  │
│     + Nuovi props: friends, actionsRemaining,            │
│       onRelationInteraction                              │
│     + Tab "Relazioni" con EnhancedFriendsPanel           │
│       filter='extra'                                     │
│                                                          │
│ D5. App.tsx:                                             │
│     + Passare friends e callback aggiornati a            │
│       CharacterSheet e ai pannelli scuola                │
│     + Pannello Scuola: sotto-tab "Compagni" con          │
│       EnhancedFriendsPanel filter='school'               │
│                                                          │
│ ✅ Criterio: le 4 barre sono visibili per amici migrati. │
│    Le interazioni nuove funzionano da UI. I compagni     │
│    di scuola appaiono nel pannello corretto.             │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ FASE E — Effetti passivi & polish           [~2h stima]  │
├──────────────────────────────────────────────────────────┤
│ E1. Effetti passivi su GameStats                         │
│     - amicizia >= 60 con secchione → bonus studio +0.2   │
│     - amicizia >= 50 con sportivo → muscoli max +5       │
│     - odio >= 70 con chiunque → stress +2/giorno         │
│     - amore >= 70 (fidanzato/a) → morale +3/giorno      │
│     Implementare in applyDailyErosion come effetti       │
│     addizionali (o funzione separata                     │
│     applyPassiveRelationEffects)                         │
│                                                          │
│ E2. GameLog entries per interazioni                      │
│     - handleRelationInteraction genera log 'social'      │
│     - Notifica primo raggiungimento tier                 │
│     - Messaggio narrativo per tier migliore_amico,       │
│       nemico_giurato, fidanzato_a                        │
│                                                          │
│ E3. Cleanup finale                                       │
│     - Rimuovere FriendsPanel.tsx (non più usato)         │
│       ⚠️  Prima della rimozione eseguire grep -r "FriendsPanel"
│           su src/ per verificare assenza di import, lazy-load
│           o riferimenti in test. Rimuovere solo se risultato vuoto.
│     - Aggiornare imports/lazy in App.tsx                  │
│     - Verificare che RelationshipsPanel (ragazze) sia    │
│       invariato e funzionante                            │
│                                                          │
│ ✅ Criterio: partita completa senza errori. Bonus studio │
│    visibile nel diario. Notifiche tier funzionanti.      │
│    RelationshipsPanel e girlfriend-system invariati.      │
└──────────────────────────────────────────────────────────┘
```

---

## 5. CATALOGO INTERAZIONI COMPLETO — 32 azioni

Riportato dal piano originale con correzioni minori per coerenza con le GameStats attuali.

### CAT 0 — CORTESIA (nessun prerequisito)

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `saluta` | Saluta | amicizia +2, odio -1 | — | — |
| `presenta_te` | Presentati | amicizia +3 *(solo se amicizia < 5)* | — | — |
| `fai_complimento` | Fai un complimento | amicizia +2, romantico +2 | — | — |
| `sorridi` | Sorridi | amicizia +1 | — | — |
| `ignora` | Ignoralo/a | amicizia -2, odio +3 | — | — |

### CAT 1 — CONOSCENZA (amicizia >= 10)

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `chiacchiera` | Chiacchiera | amicizia +4 | — | — |
| `fai_battuta` | Fai una battuta | amicizia +3 | amicizia -1, odio +2 | 25 |
| `chiedi_come_stai` | Chiedi come sta | amicizia +3, amore +1 *(cond.)* | — | — |
| `scambia_contatto` | Scambia contatto | amicizia +5 | — | — |
| `racconta_barzelletta` | Racconta una barzelletta | amicizia +2, romantico +1 | amicizia -1 | 20 |

### CAT 2 — AMICIZIA (amicizia >= 30)

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `esci_insieme` | Esci insieme | amicizia +6, romantico +3, **soldi -10** | — | — |
| `condividi_segreto` | Condividi un segreto | amicizia +8, odio -5 | amicizia -5, odio +10 | 15 |
| `chiedi_consiglio` | Chiedi consiglio | amicizia +5 | — | — |
| `fai_un_favore` | Fai un favore | amicizia +7, odio -3 | — | — |
| `prenditi_gioco` | Prenditi gioco | amicizia +3 | amicizia -5, odio +8 | 35 |
| `litiga` | Litiga | amicizia -10, odio +15 | — | — |

### CAT 3 — AMICIZIA STRETTA (amicizia >= 60)

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `confida_problema` | Confida un problema | amicizia +10, amore +5 *(cond.)* | — | — |
| `chiedi_prestito` | Chiedi un prestito | **soldi +20..50**, amicizia -10 | — | — |
| `difendi` | Difendi dall'aggressore | amicizia +12, odio -8 | amicizia +5, **reputazione -5** | 20 |
| `studia_insieme` | Studia insieme | amicizia +6, **media +0.2** *(secchione: +0.5)* | — | — |
| `festa_insieme` | Organizza una festa | amicizia +8, romantico +5, **soldi -30** | — | — |

### CAT 4 — FLIRT LEGGERO (romantico >= 20, odio < 40)

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `flirta` | Flirta | romantico +5 | amicizia -5, odio +5 | 30 |
| `fai_occhiolino` | Fai l'occhiolino | romantico +3 | romantico -1 | 15 |
| `complimento_fisico` | Complimento fisico | romantico +4 | odio +2 | 25 |

### CAT 5 — INTERESSE ROMANTICO (romantico >= 50, amicizia >= 20)

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `invita_fuori` | Invita fuori | romantico +8, amicizia +5 | romantico -10 | 25 |
| `regala_qualcosa` | Regala qualcosa | romantico +8, amore +5, **soldi -20** | — | — |
| `dedica_canzone` | Dedica una canzone | romantico +6, amore +4 | romantico -5 | 20 |

### CAT 6 — AMORE (amore >= 40, romantico >= 50)

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `dichiara_amore` | Dichiarati | amore +15 | amore -15, romantico -10 | 30 |
| `bacio` | Bacio *(req. amore >= 40, romantico >= 50)* | amore +10, romantico +5 | — | — |
| `litigate_coppia` | Litiga da coppia | amore -15, odio +10 | — | — |

### CAT 7 — CONFLITTO (odio >= 30, tranne chiedi_scusa)

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `insulta` | Insulta | odio +15, amicizia -10 | — | — |
| `sfida` | Sfida | odio +20, **reputazione +10** *(se vinci)* | odio +20, **reputazione -5** | 40 |
| `chiedi_scusa` | Chiedi scusa | odio -15, amicizia +5 | — | — |
| `ignora_volutamente` | Ignora volutamente | amicizia -8, odio +10 | — | — |

**Nota sulle interazioni con effetti su GameStats:** I delta su `soldi`, `media`, `reputazione` vanno applicati tramite il campo `statsEffects` dentro `effects`/`failEffects`, separati dai delta relazionali. Il handler li applica a `GameStats` con le solite `clampStat()`.

---

## 6. LIMITI NPC ATTIVI (corretto da P7)

| originType | Max attivi | Condizione perdita |
|---|---|---|
| compagno_classe | 4 | Cambio scuola → `unlocked = false` |
| compagno_istituto | 3 | Mai persi automaticamente |
| extrascolastico | 6 | Mai persi automaticamente |

**Totale massimo:** 13 NPC attivi simultaneamente.

Gli NPC con `unlocked = false` restano nei dati ma non vengono mostrati in UI e non partecipano all'erosione. Possono essere riciclati se si torna allo stesso istituto (edge case non critico per v1).

---

## 7. DIPENDENZE TRA FASI

```
A1 ──→ A2 ──→ A3 ──→ A4
               │
               ▼
B1 ──→ B2 ──→ B3 ──→ B4 ──→ B5
                              │
                              ▼
               C1 ──→ C2 ──→ C3 ──→ C4 ──→ C5 ──→ C6 ──→ C7
                                                           │
                                                           ▼
                              D1 ──→ D2 ──→ D3 ──→ D4 ──→ D5
                                                           │
                                                           ▼
                                            E1 ──→ E2 ──→ E3
```

**Parallelizzazione possibile:**
- B1-B4 (catalogo interazioni) può procedere in parallelo con A3-A4 (fix affinita + migrazione), dato che non si toccano gli stessi file
- D1 (RelationCard) può iniziare appena B2 e B3 sono pronti

---

## 8. CHECKLIST DI VERIFICA POST-IMPLEMENTAZIONE

- [ ] Build TypeScript compila senza errori
- [ ] Save game esistente carica correttamente (migrazione legacy trasparente)
- [ ] Amici legacy mostrano barra affinita come prima
- [ ] Amici nuovi (post-migrazione) mostrano 4 barre relazionali
- [ ] Interazioni categorie 0-3 funzionano con effetti corretti
- [ ] Interazioni con failChance producono risultati variabili
- [ ] Erosione giornaliera: amicizia cala dopo 30+ giorni
- [ ] Erosione reciproca: odio > 60 erode amicizia, amicizia > 70 erode odio
- [ ] Amore condizionato: non aumenta se amicizia < 40 || romantico < 30
- [ ] Compagni di classe si generano durante mattina scolastica
- [ ] Compagni persi al cambio scuola (unlocked = false)
- [ ] Amici extrascolastici si generano in azioni pomeriggio/sera
- [ ] Limit NPC rispettati (4 classe, 3 istituto, 6 extra)
- [ ] Location bonus probabilità funzionante
- [ ] Tab "Relazioni" in CharacterSheet mostra amici extra
- [ ] Pannello Scuola mostra compagni con filtro corretto
- [ ] GameLog registra interazioni sociali
- [ ] Notifica primo raggiungimento tier
- [ ] RelationshipsPanel (ragazze da conquistare) invariato
- [ ] girlfriend-system.ts invariato
- [ ] Nessun crash navigando tra pannelli con 0 amici

---

## 9. VINCOLI TECNICI RIBADITI

1. **Zero dipendenze React** in `relation-system.ts` — solo TypeScript puro
2. **Import type-only** per `RelationStats` in `types.ts` — evita dipendenze circolari
3. **Tutte le pure function** (`applyDailyErosion`, `applyInteractionEffects`, `migrateLegacyFriend`) devono essere immutabili: restituire nuovi oggetti, mai mutare input
4. **`affinita` rest opzionale** fino a fine Fase E — solo in E3 si può considerare la rimozione definitiva
5. **`clampStat()`** (da `game-utils.ts`) per ogni modifica a GameStats; **`clampRel()`** (nuova) per ogni modifica a RelationStats
6. **Nessun `console.log`** in produzione — usare solo `addLogEntry` per feedback utente

---

*Fine piano tecnico — versione 1.0*
