# Piano di Implementazione — Bilanciamento Sistema Relazioni

> **Stato**: CONVALIDATO con correzioni  
> **Data convalida**: 7 aprile 2026  
> **Prerequisiti**: build pulito (`npx tsc --noEmit` OK) prima di iniziare  
> **Commit finale**: `feat(relations+afternoon): rivalita asse 5, fix originType semantico, UI filtro padre, afternoon-events sistema`

---

## Riepilogo Correzioni Applicate al Piano Originale

Il piano originale conteneva **8 criticità** corrette in questa versione ottimizzata:

| # | Criticità | Correzione |
|---|-----------|------------|
| C1 | Campi `fiducia`, `rispetto`, `divertimento` referenziati nelle interazioni antagoniste **non esistono** in `RelationStats`/`RelationEffects`. Gli assi attuali sono: `amicizia`, `romantico`, `amore`, `odio` | Effetti rimappati su assi esistenti + nuovo `rivalita` |
| C2 | Piano dice "sesto campo" ma `RelationStats` ha 4 campi → `rivalita` è il **quinto** | Corretto a "quinto campo" |
| C3 | `INTERACTION_CATALOG` è `Record<string, InteractionDef>`, non un array | Istruzioni corrette per aggiunta a Record |
| C4 | Passi tecnici mancanti: `RelationEffects`, `clampRel()`, `DEFAULT_RELATION_STATS`, `ORIGIN_INITIAL_STATS`, `applyInteractionEffects()`, `applyDailyErosion()`, `_describeRelEffects()` non aggiornati | Aggiunti tutti i sotto-passi necessari |
| C5 | Passo 3a: `EnhancedFriendsPanel` **non ha** filtri interni per `originType` da rimuovere | Passo 3a ridotto a verifica/no-op |
| C6 | Passo 4: nomi stat errati — `Forza`→`muscoli`, `Energia`→`stanchezza`, `Umore`→`morale`, `Fortuna`→**non esiste** | Tutte le stat rimappate ai campi reali di `GameStats` |
| C7 | Passo 2b: `school-events.ts` usa struttura legacy (`SchoolEvent`/`EventChoice`/`EventOutcome`). Il pattern corretto per eventi mattina con scelte è `school-morning-events.ts` | Evento `se_compagno_istituto` aggiunto a `school-morning-events.ts` |
| C8 | Passo 4 `ae_festa_litigata`: `rivalita` vive su `Friend.rel`, non su `GameStats` → l'outcome `delta: Partial<GameStats>` non può modificarla direttamente | Outcome restituisce `rivalitaDelta` separato, gestito dal layer hook |

---

## Parte 1 — Passi 1-3

### Passo 1 — Asse `rivalita` in `relation-system.ts` e `types.ts`

> **Semantica**: `odio` = risentimento personale emotivo (entra nel calcolo tier).  
> `rivalita` = competizione pubblica/reputazionale (asse parallelo e indipendente, NON entra nel tier).

**File: `src/lib/relation-system.ts`**

**1a.** Aggiorna l'interfaccia `RelationStats` — aggiungi il quinto campo opzionale:

```typescript
export interface RelationStats {
  amicizia:  number  // 0-100
  romantico: number  // 0-100
  amore:     number  // 0-100
  odio:      number  // 0-100
  rivalita?: number  // 0-100, default 0 — asse indipendente, non impatta tier amicizia
}
```

**1b.** Aggiorna `RelationEffects` per supportare `rivalita`:

```typescript
export interface RelationEffects {
  amicizia?:  number
  romantico?: number
  amore?:     number
  odio?:      number
  rivalita?:  number  // NUOVO
  statsEffects?: Partial<GameStats>
}
```

**1c.** Aggiorna `DEFAULT_RELATION_STATS`:

```typescript
export const DEFAULT_RELATION_STATS: RelationStats = {
  amicizia: 0, romantico: 0, amore: 0, odio: 0, rivalita: 0
}
```

**1d.** Aggiorna `ORIGIN_INITIAL_STATS` — aggiungi `rivalita: 0` a tutti e tre gli originType:

```typescript
export const ORIGIN_INITIAL_STATS: Record<
  'compagno_classe' | 'compagno_istituto' | 'extrascolastico',
  RelationStats
> = {
  compagno_classe:    { amicizia: 15, romantico: 0, amore: 0, odio: 0, rivalita: 0 },
  compagno_istituto:  { amicizia: 5,  romantico: 0, amore: 0, odio: 0, rivalita: 0 },
  extrascolastico:    { amicizia: 10, romantico: 0, amore: 0, odio: 0, rivalita: 0 },
}
```

**1e.** Aggiorna `clampRel()` per gestire `rivalita`:

```typescript
export function clampRel(rel: RelationStats): RelationStats {
  return {
    amicizia:  Math.max(0, Math.min(100, Math.round(rel.amicizia))),
    romantico: Math.max(0, Math.min(100, Math.round(rel.romantico))),
    amore:     Math.max(0, Math.min(100, Math.round(rel.amore))),
    odio:      Math.max(0, Math.min(100, Math.round(rel.odio))),
    rivalita:  Math.max(0, Math.min(100, Math.round(rel.rivalita ?? 0))),
  }
}
```

**1f.** Aggiungi tipo e funzioni `RivalryTier` in coda alle costanti esportate:

```typescript
export type RivalryTier = 'neutro' | 'rivale' | 'nemico_giurato'

export function getRivalryTier(rivalita: number): RivalryTier {
  if (rivalita >= 70) return 'nemico_giurato'
  if (rivalita >= 30) return 'rivale'
  return 'neutro'
}

export function getRivalryTierLabel(tier: RivalryTier): string {
  const labels: Record<RivalryTier, string> = {
    neutro: 'Neutro',
    rivale: '⚔️ Rivale',
    nemico_giurato: '💀 Nemico Giurato'
  }
  return labels[tier]
}
```

**1g.** Aggiungi 4 interazioni antagoniste nel `INTERACTION_CATALOG` (Record `<string, InteractionDef>`).
Tutti gli effetti usano SOLO campi esistenti (`amicizia`, `odio`, `rivalita`) + `statsEffects` per `reputazione`/`morale`:

```typescript
  // ── CAT 7 — CONFLITTO (aggiunte) ───────────────────────────────────────────

  litigata_furiosa: {
    id: 'litigata_furiosa', category: 7, categoryLabel: 'Conflitto',
    label: 'Litigata furiosa',
    description: 'Una lite feroce, senza freni.',
    prereq: { odio: 20 },
    effects: { amicizia: -15, odio: 12, rivalita: 25 },
  },

  sfida_pubblica: {
    id: 'sfida_pubblica', category: 7, categoryLabel: 'Conflitto',
    label: 'Sfida pubblica',
    description: 'Lo/la sfidi davanti a tutti — questione di onore.',
    prereq: { odio: 15 },
    effects: { amicizia: -8, rivalita: 15, statsEffects: { morale: -10 } },
    failEffects: { amicizia: -12, rivalita: 20, odio: 5, statsEffects: { reputazione: -5 } },
    failChance: 40,
  },

  insulto_diretto: {
    id: 'insulto_diretto', category: 7, categoryLabel: 'Conflitto',
    label: 'Insulto diretto',
    description: 'Parole pesanti, a bruciapelo.',
    prereq: { odio: 10 },
    effects: { amicizia: -10, odio: 15, rivalita: 20 },
  },

  sgarro_reputazione: {
    id: 'sgarro_reputazione', category: 7, categoryLabel: 'Conflitto',
    label: 'Sgarro alla reputazione',
    description: 'Spargi voci e gli/le rovini la reputazione.',
    prereq: { odio: 25 },
    effects: { amicizia: -20, odio: 20, rivalita: 30, statsEffects: { reputazione: 5 } },
    failEffects: { amicizia: -10, odio: 25, rivalita: 15, statsEffects: { reputazione: -10 } },
    failChance: 35,
  },
```

**1h.** Aggiorna `applyInteractionEffects()` — aggiungi applicazione delta `rivalita`:

Dopo la riga `if (effectsToApply.odio != null) newRel.odio += effectsToApply.odio`, aggiungi:

```typescript
  if (effectsToApply.rivalita != null) newRel.rivalita = (newRel.rivalita ?? 0) + effectsToApply.rivalita
```

**1i.** Aggiorna `_describeRelEffects()` — aggiungi descrizione `rivalita`:

Dopo la riga che gestisce `odio`, aggiungi:

```typescript
  if (effects.rivalita != null) parts.push(`Rivalità ${effects.rivalita > 0 ? '+' : ''}${effects.rivalita}`)
```

**1j.** Aggiorna `applyDailyErosion()` — aggiungi `rivalita` nel confronto identità:

Nella condizione `if (rel.amicizia === f.rel.amicizia && ...)` aggiungi:

```typescript
      (rel.rivalita ?? 0) === (f.rel.rivalita ?? 0)
```

Opzionalmente, aggiungi erosione `rivalita` lenta (es. -1/settimana se > 30 e nessuna interazione conflittuale da 14gg).

**File: `src/lib/types.ts`**

**1k.** Trova `migrateLegacyFriend()` in `relation-system.ts` (riga ~456). Assicurati che inizializzi `rivalita: 0`:

```typescript
export function migrateLegacyFriend(f: Friend): Friend {
  if (f.rel != null) {
    // Assicura che rivalita esista anche in friend migrati precedentemente
    if (f.rel.rivalita == null) {
      return { ...f, rel: { ...f.rel, rivalita: 0 } }
    }
    return f
  }
  const affinita = f.affinita ?? 50
  const originType = f.originType ?? 'extrascolastico'
  return {
    ...f,
    originType,
    rel: {
      amicizia:  Math.max(0, Math.min(100, affinita)),
      romantico: 0,
      amore:     0,
      odio:      0,
      rivalita:  0,
    },
  }
}
```

**Verifica**: `npx tsc --noEmit` — nessun errore prima di proseguire.

---

### Passo 2 — Fix semantico `originType` in `social-system.ts` e `school-morning-events.ts`

**File: `src/lib/social-system.ts`**

**2a.** Trova il mapping `location → originType` in `generateRandomFriend()` (riga ~37-41). Sostituisci:

```typescript
  // PRIMA (errato: quartiere → compagno_istituto)
  // const originType = location && ['classe', 'corridoio'].includes(location)
  //   ? 'compagno_classe' as const
  //   : location === 'quartiere'
  //   ? 'compagno_istituto' as const
  //   : 'extrascolastico' as const

  // DOPO (corretto: compagno_istituto non si genera mai da location)
  const originType: Friend['originType'] =
    location && ['classe', 'corridoio'].includes(location)
      ? 'compagno_classe'
      : 'extrascolastico'
```

**File: `src/lib/school-morning-events.ts`**

**2b.** Aggiungi un nuovo evento al catalogo `SCHOOL_MORNING_EVENTS` nella categoria `sociale`. Questo è l'unico canale per generare `compagno_istituto`:

```typescript
  {
    id: 'sm_compagno_istituto',
    category: 'sociale',
    title: 'Incontro alla mensa scolastica',
    description: 'Durante la pausa pranzo incontri uno studente di un\'altra classe. Sembra simpatico.',
    probability: 8,
    choices: [
      {
        label: 'Ti presenti e attacchi bottone',
        outcome: (s) => {
          const newFriend = generateSchoolFriend('compagno_istituto')
          return {
            delta: { carisma: 2 },
            message: `Hai conosciuto ${newFriend.name}! Un nuovo compagno di istituto! +2 Carisma`,
            newFriend,
          }
        },
      },
      {
        label: 'Mangi per conto tuo',
        outcome: () => ({
          delta: {},
          message: 'Pranzo tranquillo, niente di nuovo.',
        }),
      },
    ],
  },
```

> **Nota**: l'import di `generateSchoolFriend` è già presente in `school-morning-events.ts` (riga 5).

**Verifica**: `npx tsc --noEmit` — nessun errore prima di proseguire.

---

### Passo 3 — Architettura UI: filtro nel padre, `EnhancedFriendsPanel` passivo

**File: `src/components/EnhancedFriendsPanel.tsx`**

**3a.** Verifica che il componente NON contenga logica di filtro interna per `originType`. Stato attuale: **confermato, non c'è filtro interno**. Nessuna modifica necessaria. Il componente riceve `friends: Friend[]` e li mostra tutti — è già passivo.

**File: `src/components/RelationsPanel.tsx`** (NUOVO)

**3b.** Crea il nuovo componente `src/components/RelationsPanel.tsx` con la logica di filtro per tab:

```typescript
import React, { lazy, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Friend, GameStats } from '@/lib/types'
import type { Ragazza } from '@/lib/girlfriend-system'

const EnhancedFriendsPanel = lazy(() =>
  import('@/components/EnhancedFriendsPanel').then(m => ({ default: m.EnhancedFriendsPanel }))
)

interface RelationsPanelProps {
  friends: Friend[]
  stats: GameStats
  actionsRemaining: number
  onFriendAction: (friendId: string, actionId: string) => void
  onRelationInteraction?: (friendId: string, interactionId: string) => void
  girlfriend: Ragazza | null
  onGirlfriendAction: (action: string) => void
  onGirlfriendBreakup: () => void
}

export const RelationsPanel = React.memo(function RelationsPanel(props: RelationsPanelProps) {
  const { friends, ...rest } = props

  const schoolFriends = friends.filter(f =>
    f.originType === 'compagno_classe' || f.originType === 'compagno_istituto'
  )
  const extraFriends = friends.filter(f => f.originType === 'extrascolastico')

  return (
    <Tabs defaultValue="tutti" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="tutti">
          Tutti ({friends.length})
        </TabsTrigger>
        <TabsTrigger value="scuola">
          Scuola ({schoolFriends.length})
        </TabsTrigger>
        <TabsTrigger value="extra">
          Extra ({extraFriends.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tutti">
        <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Caricamento...</div>}>
          <EnhancedFriendsPanel friends={friends} {...rest} />
        </Suspense>
      </TabsContent>

      <TabsContent value="scuola">
        <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Caricamento...</div>}>
          <EnhancedFriendsPanel friends={schoolFriends} {...rest} />
        </Suspense>
      </TabsContent>

      <TabsContent value="extra">
        <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Caricamento...</div>}>
          <EnhancedFriendsPanel friends={extraFriends} {...rest} />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
})
```

**File: `src/App.tsx`**

**3c.** Sostituisci il rendering diretto di `<EnhancedFriendsPanel>` nel tab `"friends"` con `<RelationsPanel>`:

```typescript
// IMPORT — aggiungi:
const RelationsPanel = lazy(() =>
  import('@/components/RelationsPanel').then(m => ({ default: m.RelationsPanel }))
)

// JSX — nel TabsContent "friends", sostituisci <EnhancedFriendsPanel ...> con:
<RelationsPanel
  friends={friends}
  stats={stats}
  actionsRemaining={phaseActionsRemaining ?? 0}
  onFriendAction={handleFriendAction}
  onRelationInteraction={doInteraction}
  girlfriend={girlfriend ?? null}
  onGirlfriendAction={handleGirlfriendAction}
  onGirlfriendBreakup={handleGirlfriendBreakup}
/>
```

**3d.** Trova il punto dove il pannello Scuola (mattina/pomeriggio scolastica) mostra gli amici di classe. Passa direttamente:

```typescript
friends.filter(f => f.originType === 'compagno_classe')
```

come prop — nessun toggle, solo compagni di classe.

**Verifica**: `npx tsc --noEmit` — nessun errore prima di proseguire.

---

## Parte 2 — Passo 4

### Passo 4 — Sistema eventi extrascolastici pomeridiani/serali

> **Dipendenza**: Passo 1 deve essere completato e buildare senza errori (serve `rivalita` in `RelationStats`).

**File: `src/lib/afternoon-events.ts`** (NUOVO)

**4a.** Crea il file seguendo esattamente il pattern di `school-morning-events.ts`. Definisci le interfacce:

```typescript
import { GameStats, Friend } from '@/lib/types'
import { generateExtraFriend, generateSchoolFriend } from '@/lib/enhanced-friend-system'

export type AfternoonLocation =
  | 'palestra' | 'festa' | 'sport' | 'online'
  | 'quartiere' | 'lavoro' | 'centro_commerciale'

export interface AfternoonChoice {
  id: string
  label: string
  outcome: (stats: GameStats) => {
    delta: Partial<GameStats>
    message: string
    newFriend?: Friend
    /** Se presente, applicare rivalita a un amico random esistente */
    rivalitaDelta?: number
  }
}

export interface AfternoonEvent {
  id: string
  location: AfternoonLocation
  title: string
  description: string
  probability: number     // 0-100
  choices: AfternoonChoice[]
}
```

> **Nota**: `rivalitaDelta` è un campo aggiuntivo rispetto a `SchoolMorningChoice` — serve per `ae_festa_litigata` che deve modificare `rivalita` su un Friend esistente. Il layer hook in `useEventEngine.ts` lo gestisce applicandolo a un amico random.

**4b.** Crea il catalogo `AFTERNOON_EVENTS: AfternoonEvent[]` con 8 eventi.

**Mappatura stat corretta** (nomi reali di `GameStats`):
- `Forza` → `muscoli`
- `Carisma` → `carisma`  
- `Umore` → `morale`
- `Energia` → `stanchezza` (con segno invertito: +Energia = -stanchezza)
- `Reputazione` → `reputazione`
- `Soldi` → `soldi`
- `Fortuna` → **non esiste** — rimosso dal piano

```typescript
export const AFTERNOON_EVENTS: AfternoonEvent[] = [

  // 1. PALESTRA
  {
    id: 'ae_palestra_sfida',
    location: 'palestra',
    title: 'Sfida in palestra',
    description: 'Qualcuno ti sfida a una serie di esercizi.',
    probability: 25,
    choices: [
      {
        id: 'accetta',
        label: 'Accetta la sfida',
        outcome: (s) => {
          if (s.muscoli > 40) {
            const newFriend = generateExtraFriend('palestra')
            return {
              delta: { muscoli: 8, carisma: 5 },
              message: `Hai vinto! ${newFriend.name} ti rispetta. +8 Muscoli, +5 Carisma`,
              newFriend,
            }
          }
          return {
            delta: { stanchezza: 15, morale: -5 },
            message: 'Non ce l\'hai fatta... +15 Stanchezza, -5 Morale',
          }
        },
      },
      {
        id: 'declina',
        label: 'Declina educatamente',
        outcome: () => ({
          delta: { stanchezza: -5 },
          message: 'Ti risparmi la fatica. -5 Stanchezza',
        }),
      },
    ],
  },

  // 2. FESTA — presentazione
  {
    id: 'ae_festa_presentazione',
    location: 'festa',
    title: 'Ti presentano qualcuno',
    description: 'Un tuo conoscente ti presenta qualcuno di nuovo.',
    probability: 30,
    choices: [
      {
        id: 'avvicinati',
        label: 'Ti avvicini e fai conversazione',
        outcome: () => {
          const newFriend = generateExtraFriend('festa')
          return {
            delta: { carisma: 3 },
            message: `Hai conosciuto ${newFriend.name}! +3 Carisma`,
            newFriend,
          }
        },
      },
      {
        id: 'disparte',
        label: 'Rimani in disparte',
        outcome: () => ({
          delta: { morale: -3 },
          message: 'Stai per conto tuo. -3 Morale',
        }),
      },
    ],
  },

  // 3. SPORT — torneo
  {
    id: 'ae_sport_torneo',
    location: 'sport',
    title: 'Avversario simpatico',
    description: 'Stai giocando e un avversario ti sembra simpatico.',
    probability: 20,
    choices: [
      {
        id: 'approccio',
        label: 'Lo approcci a fine partita',
        outcome: () => {
          const newFriend = generateExtraFriend('sport')
          return {
            delta: { carisma: 2 },
            message: `Hai conosciuto ${newFriend.name}! +2 Carisma`,
            newFriend,
          }
        },
      },
      {
        id: 'vai_via',
        label: 'Te ne vai',
        outcome: () => ({
          delta: {},
          message: 'Partita e via, niente di nuovo.',
        }),
      },
    ],
  },

  // 4. ONLINE — gaming
  {
    id: 'ae_online_gaming',
    location: 'online',
    title: 'Compagno di gioco',
    description: 'Fai una partita online con uno sconosciuto, giocate bene insieme.',
    probability: 20,
    choices: [
      {
        id: 'scrivi',
        label: 'Gli scrivi in privato',
        outcome: () => {
          const newFriend = generateExtraFriend('online')
          return {
            delta: { morale: 5 },
            message: `Hai conosciuto ${newFriend.name} online! +5 Morale`,
            newFriend,
          }
        },
      },
      {
        id: 'esci',
        label: 'Esci dal gioco',
        outcome: () => ({
          delta: {},
          message: 'Bella partita, ma ognuno per la sua strada.',
        }),
      },
    ],
  },

  // 5. QUARTIERE — incontro
  {
    id: 'ae_quartiere_incontro',
    location: 'quartiere',
    title: 'Faccia nota',
    description: 'Rivedi una persona del quartiere che non vedevi da tempo.',
    probability: 20,
    choices: [
      {
        id: 'fermati',
        label: 'Ti fermi a parlare',
        outcome: () => {
          const newFriend = generateExtraFriend('quartiere')
          return {
            delta: { carisma: 3 },
            message: `Hai ritrovato ${newFriend.name}! +3 Carisma`,
            newFriend,
          }
        },
      },
      {
        id: 'finta',
        label: 'Fai finta di niente',
        outcome: () => ({
          delta: { morale: -2 },
          message: 'Lo/la ignori. Un po\' di imbarazzo. -2 Morale',
        }),
      },
    ],
  },

  // 6. LAVORO — collega
  {
    id: 'ae_lavoro_collega',
    location: 'lavoro',
    title: 'Invito del collega',
    description: 'Un collega ti invita a prendere qualcosa dopo il turno.',
    probability: 25,
    choices: [
      {
        id: 'accetta',
        label: 'Accetti l\'invito',
        outcome: () => {
          const newFriend = generateExtraFriend('lavoro')
          return {
            delta: { morale: 8, stanchezza: 5 },
            message: `Serata con ${newFriend.name}! +8 Morale, +5 Stanchezza`,
            newFriend,
          }
        },
      },
      {
        id: 'declina',
        label: 'Declini, sei stanco',
        outcome: () => ({
          delta: {},
          message: 'Vai dritto a casa. Soldi risparmiati.',
        }),
      },
    ],
  },

  // 7. CENTRO COMMERCIALE — incontro scolastico fuori contesto
  {
    id: 'ae_centro_incontro',
    location: 'centro_commerciale',
    title: 'Incontro fuori contesto',
    description: 'Incontri per caso qualcuno della tua scuola fuori contesto.',
    probability: 15,
    choices: [
      {
        id: 'saluta',
        label: 'Lo saluti e vi fermate a parlare',
        outcome: () => {
          // Questo è l'unico afternoon-event che genera un compagno_istituto
          const newFriend = generateSchoolFriend('compagno_istituto')
          return {
            delta: { carisma: 2 },
            message: `Hai conosciuto ${newFriend.name} della tua scuola! +2 Carisma`,
            newFriend,
          }
        },
      },
      {
        id: 'ignora',
        label: 'Lo ignori',
        outcome: () => ({
          delta: {},
          message: 'Fai finta di non vederlo/a.',
        }),
      },
    ],
  },

  // 8. FESTA — litigata (richiede rivalita dal Passo 1)
  {
    id: 'ae_festa_litigata',
    location: 'festa',
    title: 'Provocazione alla festa',
    description: 'La serata degenera, qualcuno ti provoca.',
    probability: 15,
    choices: [
      {
        id: 'rispondi',
        label: 'Rispondi per le rime',
        outcome: () => ({
          delta: { morale: -10, reputazione: 5 },
          message: 'Sei stato duro. +5 Reputazione, -10 Morale',
          rivalitaDelta: 20,  // applicato a un amico random dal layer hook
        }),
      },
      {
        id: 'allontanati',
        label: 'Ti allontani',
        outcome: () => ({
          delta: { morale: -5 },
          message: 'Eviti guai, ma la cosa ti pesa. -5 Morale',
        }),
      },
    ],
  },
]
```

**4c.** Esporta la funzione di selezione evento:

```typescript
export function getAfternoonEvent(
  location: AfternoonLocation
): AfternoonEvent | null {
  const candidates = AFTERNOON_EVENTS.filter(e => e.location === location)
  if (candidates.length === 0) return null
  const triggered = candidates.filter(e => Math.random() * 100 < e.probability)
  if (triggered.length === 0) return null
  return triggered[Math.floor(Math.random() * triggered.length)]
}
```

> **Nota**: rimosso il parametro `stats` dalla firma perché la funzione di selezione non lo usa (i check stat avvengono nell'outcome delle choices). Se in futuro servisse filtrare eventi per requisiti stat, si può aggiungere.

**Limite**: il file non deve superare le 400 righe. Se supera, segnalare prima di procedere.

---

**File: `src/hooks/useEventEngine.ts`**

**4d.** Importa e integra il sistema afternoon events:

```typescript
import { getAfternoonEvent, AfternoonLocation, AfternoonEvent } from '@/lib/afternoon-events'
```

Aggiungi stato per l'evento pomeridiano (stesso pattern di `showMetallariEvent` ecc.):

```typescript
const [afternoonEvent, setAfternoonEvent] = useState<AfternoonEvent | null>(null)
```

Nel metodo `checkForNewFriend(location)`, **prima** del check probabilistico esistente, aggiungi il trigger dell'evento narrativo:

```typescript
const checkForNewFriend = useCallback((location: string) => {
  // Tentativo evento narrativo pomeridiano (priorità su generazione silenziosa)
  const phase = currentPhaseRef.current
  if (phase === 'pomeriggio' || phase === 'sera') {
    const evt = getAfternoonEvent(location as AfternoonLocation)
    if (evt) {
      setAfternoonEvent(evt)
      return  // evento narrativo trovato — non generare amico silenzioso
    }
  }

  // Fallback: generazione silenziosa (codice esistente invariato)
  const carismaBonus = Math.floor(statsRef.current.carisma / 10)
  // ...resto del codice esistente...
}, [setFriends, announce])
```

Esporta `afternoonEvent` e `setAfternoonEvent` dal return dell'hook.

Aggiungi callback per gestire la scelta dell'evento:

```typescript
const handleAfternoonChoice = useCallback((choiceId: string) => {
  if (!afternoonEvent) return
  const choice = afternoonEvent.choices.find(c => c.id === choiceId)
  if (!choice) return

  const result = choice.outcome(statsRef.current)

  // Applica delta stats
  if (Object.keys(result.delta).length > 0) {
    setStats(prev => {
      const updated = { ...prev }
      for (const [key, val] of Object.entries(result.delta)) {
        if (key in updated && typeof val === 'number') {
          (updated as Record<string, number>)[key] = clampStat(
            (prev as Record<string, number>)[key] + val
          )
        }
      }
      return updated
    })
  }

  // Aggiungi nuovo amico se generato
  if (result.newFriend) {
    setFriends(prev => [...prev, result.newFriend!])
    playSound.success()
  }

  // Gestisci rivalitaDelta (ae_festa_litigata)
  if (result.rivalitaDelta && friendsRef.current.length > 0) {
    const randomIdx = Math.floor(Math.random() * friendsRef.current.length)
    setFriends(prev => prev.map((f, i) => {
      if (i !== randomIdx || !f.rel) return f
      return {
        ...f,
        rel: { ...f.rel, rivalita: Math.min(100, (f.rel.rivalita ?? 0) + result.rivalitaDelta!) }
      }
    }))
  }

  announce(result.message)
  addLogEntry('social', afternoonEvent.title, result.message,
    result.newFriend ? 'positive' : 'neutral',
    gameTimeRef.current.currentDate, currentPhaseRef.current)

  setAfternoonEvent(null)
}, [afternoonEvent, setStats, setFriends, announce, addLogEntry])
```

---

**File: `src/components/AfternoonEventPanel.tsx`** (NUOVO)

**4e.** Crea il componente copiando la struttura di `SchoolMorningPanel.tsx`, adattando i tipi:

```typescript
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AfternoonEvent } from '@/lib/afternoon-events'

interface AfternoonEventPanelProps {
  event: AfternoonEvent
  onChoice: (choiceId: string) => void
}

export const AfternoonEventPanel = React.memo(function AfternoonEventPanel({
  event,
  onChoice,
}: AfternoonEventPanelProps) {
  return (
    <Card className="mb-4 border-2 border-amber-300">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-amber-100 text-amber-800">
            🌆 {event.location.replace('_', ' ')}
          </Badge>
        </div>
        <CardTitle className="text-base">{event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
        <div className="flex flex-col gap-2">
          {event.choices.map(choice => (
            <Button
              key={choice.id}
              variant="outline"
              size="sm"
              className="w-full text-left justify-start h-auto whitespace-normal py-2"
              onClick={() => onChoice(choice.id)}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})
```

**File: `src/App.tsx`**

**4f.** Importa e renderizza `AfternoonEventPanel` con lo stesso pattern di `SchoolMorningPanel`:

```typescript
const AfternoonEventPanel = lazy(() =>
  import('@/components/AfternoonEventPanel').then(m => ({ default: m.AfternoonEventPanel }))
)
```

Nel JSX, vicino a dove viene renderizzato `SchoolMorningPanel`:

```tsx
{afternoonEvent && (
  <Suspense fallback={null}>
    <AfternoonEventPanel
      event={afternoonEvent}
      onChoice={handleAfternoonChoice}
    />
  </Suspense>
)}
```

---

## Istruzioni Operative Finali

- [ ] Esegui `npx tsc --noEmit` dopo ogni passo (1, 2, 3, 4) — risolvi errori prima del passo successivo
- [ ] Non modificare: `girlfriend-system.ts`, `exam-system.ts`, `bet-system.ts`, `sound-effects.ts`, `character-traits.ts`
- [ ] `afternoon-events.ts` non deve superare le 400 righe
- [ ] `RelationsPanel.tsx` è un file separato (non inline in App.tsx)
- [ ] Commit unico finale: `feat(relations+afternoon): rivalita asse 5, fix originType semantico, UI filtro padre, afternoon-events sistema`
- [ ] Conferma finale: `✅ Bilanciamento relazioni completato — build pulito`

---

## File Modificati (riepilogo)

| File | Tipo | Passi |
|------|------|-------|
| `src/lib/relation-system.ts` | Modifica | 1a-1k |
| `src/lib/social-system.ts` | Modifica | 2a |
| `src/lib/school-morning-events.ts` | Modifica | 2b |
| `src/components/RelationsPanel.tsx` | **Nuovo** | 3b |
| `src/components/EnhancedFriendsPanel.tsx` | Verifica (no-op) | 3a |
| `src/App.tsx` | Modifica | 3c, 3d, 4f |
| `src/lib/afternoon-events.ts` | **Nuovo** | 4a-4c |
| `src/hooks/useEventEngine.ts` | Modifica | 4d |
| `src/components/AfternoonEventPanel.tsx` | **Nuovo** | 4e |

## File NON Toccati (invarianti di sicurezza)

`girlfriend-system.ts`, `exam-system.ts`, `bet-system.ts`, `sound-effects.ts`, `character-traits.ts`, `game-utils.ts`, `time-utils.ts`, `data-validation.ts`
