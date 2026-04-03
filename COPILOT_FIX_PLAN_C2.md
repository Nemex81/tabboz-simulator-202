# COPILOT FIX PLAN C2 — UX, Livelli Relazione e Pannello Fidanzata
**Repository:** Nemex81/tabboz-simulator-202 — **Ramo:** main  
**Generato:** 04/04/2026 — analisi diretta del codice sorgente  
**Dipendenze:** applicare DOPO aver completato COPILOT_FIX_PLAN_C1.md

> **Nota:** questo piano si occupa esclusivamente di UX e struttura dei pannelli.  
> Non modifica la logica di gioco, i calcoli delle stat o i sistemi di eventi.

---

## REGOLA OPERATIVA

Applica i fix **nell'ordine C2-1 → C2-3**. Mostra il diff di ogni fix prima di applicarlo e attendi conferma. Non modificare nessun file al di fuori di quelli indicati.

---

## FIX C2-1 — Spostare "Dormi / Riposa / Prossima Fase" fuori da `SchoolMorningPanel` alla schermata principale

### Analisi del problema

I controlli globali di gestione del tempo si trovano dentro `SchoolMorningPanel.tsx` come bottone `"Fine mattina → Vai al pomeriggio"` (prop `onFinishMorning`). Questo è strutturalmente sbagliato: il pannello scolastico è un **sotto-pannello contestuale** visibile solo di mattina nei feriali, mentre i controlli di avanzamento fase sono **globali** e devono essere sempre accessibili nella schermata principale.

**File sorgente analizzato:** `src/components/SchoolMorningPanel.tsx`  
Il bottone incriminato si trova a riga ~128:
```tsx
{allResolved && (
  <Button className="w-full mt-2" onClick={onFinishMorning} size="lg">
    Fine mattina → Vai al pomeriggio
  </Button>
)}
```

### File coinvolti
- `src/components/SchoolMorningPanel.tsx` — rimuovere bottone + prop `onFinishMorning`
- `src/App.tsx` — aggiungere blocco "Controlli Giornata" nella schermata principale

---

### C2-1a — `SchoolMorningPanel.tsx`: rimuovere bottone e prop

**Passo 1** — rimuovere dalla interface `SchoolMorningPanelProps`:
```tsx
// RIMUOVERE questa riga:
onFinishMorning: () => void
```

**Passo 2** — rimuovere dalla destructuring del componente:
```tsx
// RIMUOVERE:
onFinishMorning,
```

**Passo 3** — rimuovere la variabile `allResolved` (non serve più al pannello):
```tsx
// RIMUOVERE:
const allResolved = events.length === 0 || events.every(e => resolvedIds.has(e.id))
```

**Passo 4** — rimuovere il blocco JSX del bottone:
```tsx
// RIMUOVERE tutto il blocco:
{allResolved && (
  <Button className="w-full mt-2" onClick={onFinishMorning} size="lg">
    Fine mattina → Vai al pomeriggio
  </Button>
)}
```

**Passo 5** — rimuovere il prop `onFinishMorning={...}` da tutte le chiamate a `<SchoolMorningPanel>` in `App.tsx`.

---

### C2-1b — `App.tsx`: aggiungere blocco "Controlli Giornata"

Cerca la riga dove viene renderizzato `<TimeDisplay>` nella schermata principale di gioco. Aggiungi il seguente blocco **immediatamente dopo** `<TimeDisplay>` e **prima** dei pannelli a tab:

```tsx
{/* ── C2-1: Controlli Giornata ─────────────────────────────────────── */}
{/* Questi controlli sono globali e sempre visibili nella schermata principale */}
<div className="flex gap-2 flex-wrap mb-4 p-3 bg-muted/40 rounded-lg border border-border">
  {/* Riposa: solo pomeriggio, o mattina non-scolastica */}
  {(currentPhase === 'pomeriggio' ||
    (currentPhase === 'mattina' && (dayType !== 'feriale' || !gameTime.schoolYear.isSchoolPeriod))
  ) && (
    <Button
      variant="outline"
      onClick={handleRiposa}
      disabled={phaseActionsRemaining <= 0}
      title="Recupera parte della stanchezza (consuma un'azione)"
    >
      😴 Riposa
    </Button>
  )}

  {/* Dormi: disponibile da sera e notte */}
  {(currentPhase === 'sera' || currentPhase === 'notte') && (
    <Button
      variant="outline"
      onClick={handleDormi}
      title="Vai a dormire: recupero totale e avanza al giorno dopo"
    >
      🌙 Vai a dormire
    </Button>
  )}

  {/* Salta fase: sempre disponibile */}
  <Button
    variant="secondary"
    onClick={handleNextPhase}
    title="Avanza alla prossima fascia oraria senza usare azioni"
  >
    ⏩ Prossima fase
    {nextPhaseLabel && <span className="ml-1 text-xs opacity-70">({nextPhaseLabel})</span>}
  </Button>
</div>
{/* ──────────────────────────────────────────────────────────────────── */}
```

**Nota:** `handleDormi`, `handleNextPhase` e `nextPhaseLabel` devono già esistere in `App.tsx` se il sistema a fasce orarie è implementato. Se `nextPhaseLabel` non esiste, sostituire con una stringa calcolata:
```tsx
const nextPhaseLabel =
  currentPhase === 'mattina' ? 'Pomeriggio' :
  currentPhase === 'pomeriggio' ? 'Sera' :
  currentPhase === 'sera' ? 'Notte' : 'Mattina'
```

---

## FIX C2-2 — Ridefinire i livelli di relazione con tipi espliciti

### Analisi del problema

Il sistema attuale in `EnhancedFriendsPanel.tsx` usa 5 condizioni `if` separate con soglie numeriche hardcoded e nessun tipo condiviso. Le etichette romantiche (trombamica, fidanzata) non esistono nel sistema amicizie — sono gestite solo nel `girlfriend-system` separato. Obiettivo: un unico sistema di tier con funzioni helper in `types.ts`.

**Codice attuale da sostituire** in `EnhancedFriendsPanel.tsx` (riga ~88):
```tsx
{friend.affinita <= 0 && '💔 Amicizia finita'}
{friend.affinita > 0 && friend.affinita < 30 && '😐 Conoscente'}
{friend.affinita >= 30 && friend.affinita < 60 && '😊 Amico'}
{friend.affinita >= 60 && friend.affinita < 100 && '😎 Amico stretto'}
{friend.affinita >= 100 && '👑 Migliore amico - Copertura genitori sbloccata!'}
```

### File coinvolti
- `src/lib/types.ts` — aggiungere tipi e funzioni helper
- `src/components/EnhancedFriendsPanel.tsx` — usare le nuove funzioni

---

### C2-2a — `src/lib/types.ts`: aggiungere `RelationshipTier`, `SocialBondType` e helper

Aggiungere il seguente blocco **dopo la definizione di `FriendType`** (riga ~12):

```typescript
/** C2-2: livelli di profondità relazionale */
export type RelationshipTier =
  | 'sconosciuto'      // affinita <= 0
  | 'conoscente'       // affinita 1–29
  | 'amico'            // affinita 30–59
  | 'amico_stretto'    // affinita 60–89
  | 'migliore_amico'   // affinita >= 90, bondType 'amicizia'
  | 'trombamica'       // affinita >= 70, bondType 'romantico', non ufficiale
  | 'fidanzata'        // affinita >= 80, bondType 'romantico', ufficiale

/** C2-2: tipo del legame — amicizia vs relazione romantica */
export type SocialBondType = 'amicizia' | 'romantico'
```

Aggiungere i campi opzionali nella interface `Friend` (dopo `unlocked: boolean`):
```typescript
export interface Friend {
  id: string
  name: string
  type: FriendType
  affinita: number
  intelligenza?: number
  unlocked: boolean
  tier?: RelationshipTier    // C2-2: opzionale, calcolato al volo
  bondType?: SocialBondType  // C2-2: default 'amicizia' se assente
}
```

Aggiungere le due funzioni helper **in fondo al file**, dopo `getSubjectDisplayName`:

```typescript
/** C2-2: calcola il tier della relazione in base ad affinita e bondType */
export const getRelationshipTier = (
  affinita: number,
  bondType: SocialBondType = 'amicizia'
): RelationshipTier => {
  if (affinita <= 0) return 'sconosciuto'
  if (bondType === 'romantico') {
    if (affinita >= 80) return 'fidanzata'
    if (affinita >= 70) return 'trombamica'
    return 'conoscente'
  }
  if (affinita >= 90) return 'migliore_amico'
  if (affinita >= 60) return 'amico_stretto'
  if (affinita >= 30) return 'amico'
  return 'conoscente'
}

/** C2-2: etichetta emoji + testo per ciascun tier */
export const getRelationshipTierLabel = (tier: RelationshipTier): string => {
  const labels: Record<RelationshipTier, string> = {
    sconosciuto:    '💔 Sconosciuto',
    conoscente:     '😐 Conoscente',
    amico:          '😊 Amico',
    amico_stretto:  '😎 Amico Stretto',
    migliore_amico: '👑 Migliore Amico',
    trombamica:     '💋 Trombamica',
    fidanzata:      '❤️ Fidanzata',
  }
  return labels[tier]
}
```

---

### C2-2b — `src/components/EnhancedFriendsPanel.tsx`: usare le nuove funzioni

**Passo 1** — aggiungere import in cima al file:
```tsx
import { getRelationshipTier, getRelationshipTierLabel } from '@/lib/types'
```

**Passo 2** — all'interno del `friends.map(...)`, sostituire:
```tsx
// RIMUOVERE:
const isBestFriend = checkBestFriend(friend.affinita)

// SOSTITUIRE CON:
const tier = getRelationshipTier(friend.affinita, friend.bondType)
const isBestFriend = tier === 'migliore_amico'
const isRomantic = tier === 'trombamica' || tier === 'fidanzata'
```

**Passo 3** — sostituire il blocco etichette affinita (riga ~88):
```tsx
// RIMUOVERE il blocco con le 5 condizioni separate
// (vedi codice attuale sopra nell'analisi)

// SOSTITUIRE CON:
<span className="font-medium">
  {getRelationshipTierLabel(tier)}
</span>
{tier === 'migliore_amico' && (
  <span className="ml-2 text-xs text-primary">— Copertura genitori sbloccata!</span>
)}
```

**Passo 4** — aggiungere il badge romantico dopo il badge `MIGLIORE AMICO` esistente:
```tsx
{isRomantic && (
  <Badge className={
    tier === 'fidanzata'
      ? 'bg-red-500 text-white'
      : 'bg-pink-400 text-white'
  }>
    {getRelationshipTierLabel(tier)}
  </Badge>
)}
```

---

## FIX C2-3 — Eliminare il tab "Fidanzata" e integrare la gestione nel pannello "Amicizie"

### Analisi del problema

In `App.tsx` esiste un tab dedicato che usa `<GirlfriendPanel>` (18KB di componente). Questo crea una duplicazione concettuale: la fidanzata è una persona con cui hai una relazione, esattamente come un amico. Il pannello dedicato separa artificialmente quello che dovrebbe essere un unico sistema sociale.

**Strategia:** spostare la card fidanzata in cima a `EnhancedFriendsPanel`, mantenere `GirlfriendPanel.tsx` nel filesystem ma smettere di usarlo come tab.

### File coinvolti
- `src/App.tsx` — rimuovere tab Fidanzata
- `src/components/EnhancedFriendsPanel.tsx` — aggiungere props + card fidanzata in cima
- `src/components/GirlfriendPanel.tsx` — **non toccare**

---

### C2-3a — `App.tsx`: rimuovere il tab "Fidanzata"

Cerca nella lista dei `<TabsTrigger>` il trigger con label "Fidanzata" (o valore `"fidanzata"` / `"girlfriend"`). Rimuovi:

1. Il `<TabsTrigger value="fidanzata">...</TabsTrigger>`
2. Il `<TabsContent value="fidanzata"><GirlfriendPanel ... /></TabsContent>` (o equivalente)
3. L'`import { GirlfriendPanel }` in cima al file (se non usato altrove)

**Non rimuovere:**
- `handleGirlfriendAction`
- `handleGirlfriendBreakup`
- `girlfriend` state e `setGirlfriend`

Questi handler sono necessari perché vengono passati al pannello Amicizie.

---

### C2-3b — `EnhancedFriendsPanel.tsx`: aggiungere props per la fidanzata

Aggiungere l'import in cima al file:
```tsx
import type { Ragazza } from '@/lib/girlfriend-system'
```

Aggiornare `EnhancedFriendsPanelProps`:
```tsx
interface EnhancedFriendsPanelProps {
  friends: Friend[]
  stats: GameStats
  actionsRemaining: number
  onFriendAction: (friendId: string, actionId: string) => void
  // C2-3: gestione fidanzata integrata nel pannello amicizie
  girlfriend: Ragazza | null
  onGirlfriendAction: (action: string) => void
  onGirlfriendBreakup: () => void
}
```

Aggiornare la destructuring della funzione componente aggiungendo i 3 nuovi props:
```tsx
export const EnhancedFriendsPanel = React.memo(function EnhancedFriendsPanel({
  friends,
  stats,
  actionsRemaining,
  onFriendAction,
  girlfriend,             // C2-3
  onGirlfriendAction,     // C2-3
  onGirlfriendBreakup,    // C2-3
}: EnhancedFriendsPanelProps) {
```

---

### C2-3c — `EnhancedFriendsPanel.tsx`: card fidanzata in cima al render

Aggiungere il seguente blocco **immediatamente prima** di `{friends.map(...)}`:

```tsx
{/* C2-3: card fidanzata — mostrata in cima al pannello amicizie se presente */}
{girlfriend && (
  <Card className="p-6 border-2 border-red-400 bg-red-50 dark:bg-red-950 mb-4">
    <div className="flex items-center gap-3 mb-3">
      <span className="text-4xl">
        {girlfriend.relationshipStatus === 'fidanzata' ? '❤️' : '💋'}
      </span>
      <div>
        <h3 className="text-2xl font-bold text-red-600">
          {girlfriend.nome} {girlfriend.cognome}
        </h3>
        <Badge className={
          girlfriend.relationshipStatus === 'fidanzata'
            ? 'bg-red-500 text-white mt-1'
            : 'bg-pink-400 text-white mt-1'
        }>
          {girlfriend.relationshipStatus === 'fidanzata' ? '❤️ Fidanzata' : '💋 Trombamica'}
        </Badge>
      </div>
    </div>

    <div className="text-sm text-muted-foreground mb-4 grid grid-cols-2 gap-2">
      <span>Umore: <strong>{girlfriend.umore?.toString() ?? '—'}</strong></span>
      <span>Fedeltà: <strong>{girlfriend.fedelta?.toString() ?? '—'}</strong></span>
    </div>

    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline"
        onClick={() => onGirlfriendAction('messaggio')}>
        💬 Messaggio
      </Button>
      <Button size="sm" variant="outline"
        onClick={() => onGirlfriendAction('esci')}>
        🎬 Esci insieme
      </Button>
      <Button size="sm" variant="outline"
        onClick={() => onGirlfriendAction('complimento')}>
        💐 Complimento
      </Button>
      {girlfriend.relationshipStatus !== 'fidanzata' && (
        <Button size="sm" variant="outline"
          onClick={() => onGirlfriendAction('dichiarati')}>
          💍 Dichiarati
        </Button>
      )}
      <Button size="sm" variant="destructive"
        onClick={onGirlfriendBreakup}>
        💔 Lascia
      </Button>
    </div>
  </Card>
)}
```

---

### C2-3d — `App.tsx`: passare i nuovi props a `<EnhancedFriendsPanel>`

Trovare la chiamata a `<EnhancedFriendsPanel>` e aggiungere i tre nuovi props:
```tsx
<EnhancedFriendsPanel
  friends={friends}
  stats={stats}
  actionsRemaining={phaseActionsRemaining}
  onFriendAction={handleFriendAction}
  girlfriend={girlfriend}                        {/* C2-3 */}
  onGirlfriendAction={handleGirlfriendAction}    {/* C2-3 */}
  onGirlfriendBreakup={handleGirlfriendBreakup}  {/* C2-3 */}
/>
```

---

## ORDINE DI APPLICAZIONE OBBLIGATORIO

1. **C2-2a** — `types.ts`: aggiungere tipi e funzioni helper *(base per tutto il resto)*
2. **C2-2b** — `EnhancedFriendsPanel.tsx`: usare i nuovi helper *(dipende da C2-2a)*
3. **C2-3b/c** — `EnhancedFriendsPanel.tsx`: aggiungere props + card fidanzata *(dipende da C2-2b)*
4. **C2-3d** — `App.tsx`: passare i nuovi props al pannello *(dipende da C2-3b)*
5. **C2-3a** — `App.tsx`: rimuovere tab Fidanzata *(dipende da C2-3d — farlo per ultimo)*
6. **C2-1a** — `SchoolMorningPanel.tsx`: rimuovere bottone + prop
7. **C2-1b** — `App.tsx`: aggiungere blocco Controlli Giornata *(indipendente, ultimo)*

---

## CHECKLIST DI TEST C2

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| T-C2-1 | Schermata principale di mattina feriale scolastica | Visibile solo "⏩ Prossima fase", NON "😴 Riposa" |
| T-C2-2 | Schermata principale di pomeriggio | Visibili "😴 Riposa" + "⏩ Prossima fase" |
| T-C2-3 | Schermata principale di sera | Visibili "🌙 Vai a dormire" + "⏩ Prossima fase" |
| T-C2-4 | `SchoolMorningPanel` durante mattina feriale | NON mostra il bottone "Fine mattina" |
| T-C2-5 | Navigazione principale | Il tab "Fidanzata" NON è più presente |
| T-C2-6 | Pannello Amicizie senza fidanzata | Solo lista amici, nessuna card fidanzata |
| T-C2-7 | Pannello Amicizie con fidanzata attiva | Card fidanzata appare in cima con azioni |
| T-C2-8 | Azioni fidanzata dalla card nel pannello Amicizie | Messaggio / Esci / Complimento / Lascia funzionano |
| T-C2-9 | Amico con affinita 25 | Mostra "😐 Conoscente" |
| T-C2-10 | Amico con affinita 65 | Mostra "😎 Amico Stretto" |
| T-C2-11 | Amico con affinita 92 | Mostra "👑 Migliore Amico" + testo copertura genitori |
| T-C2-12 | Amico con affinita 75 e bondType 'romantico' | Mostra "💋 Trombamica" |

---

## NOTE FINALI PER COPILOT

- **Non eliminare** `GirlfriendPanel.tsx` — commentare solo l'import in `App.tsx` e lasciare il file intatto.
- **Non modificare** `girlfriend-system.ts` né i hook di gioco — cambiano solo i componenti UI.
- Il campo `bondType` in `Friend` è opzionale con default `'amicizia'` — nessuna migrazione dei dati salvati necessaria.
- Se TypeScript segnala errori su `girlfriend.umore` o `girlfriend.fedelta`, usare `girlfriend.umore?.toString() ?? '—'`.
- Se `nextPhaseLabel` non esiste in `App.tsx`, aggiungere la costante calcolata indicata nel fix C2-1b prima di usarla nel JSX.
