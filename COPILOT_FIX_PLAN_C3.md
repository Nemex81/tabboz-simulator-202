# COPILOT FIX PLAN C3 — Reintegrazione `GirlfriendPanel` come componente embedded
**Repository:** Nemex81/tabboz-simulator-202 — **Ramo:** main  
**Generato:** 04/04/2026  
**Dipendenze:** applicare DOPO aver completato COPILOT_FIX_PLAN_C2.md

> **Obiettivo:** `GirlfriendPanel.tsx` torna attivo — non come tab di navigazione, ma come
> componente embedded dentro `EnhancedFriendsPanel`. La card inline minimale introdotta
> in C2-3 viene sostituita da `<GirlfriendPanel>` che già contiene tutto il necessario.
> Nessuna logica di gioco viene modificata — solo la struttura dei componenti UI.

---

## ANALISI SITUAZIONE ATTUALE

### Cosa fa la card inline attuale in `EnhancedFriendsPanel.tsx` (da C2-3)

```tsx
{girlfriend && (
  <Card className="p-6 border-2 border-red-400 ...">
    {/* Nome, badge status */}
    {/* Interesse + Fiducia (2 valori statici) */}
    {/* 5 bottoni: Messaggio / Esci / Complimento / Dichiarati / Lascia */}
  </Card>
)}
```

**Funzionalità PERSE rispetto a `GirlfriendPanel.tsx` originale:**
- ❌ Tab **Info**: aspetto, personalità, hobby, cosa le piace, stat mancanti per uscire
- ❌ Tab **Azioni**: 6 azioni con requisiti visibili (Cinema 40€, Motorino 20€+coattaggine, Regalo 60€, Compiti solo secchiona, Dichiarati con animazione pulse)
- ❌ Tab **Statistiche**: uscite totali, messaggi, regali, litigi, data inizio relazione, cronologia appuntamenti
- ❌ **Salute relazione** (solo fidanzata): barra health, Felicità/Fiducia/Gelosia, warning attivi
- ❌ Testo descrittivo sui requisiti bloccanti (es. "Ti servono ancora +15 Muscoli")

### Cosa fa `GirlfriendPanel.tsx` — props richiesti

```tsx
interface GirlfriendPanelProps {
  girlfriend: Ragazza | null   // già disponibile in EnhancedFriendsPanel
  stats: GameStats              // già disponibile in EnhancedFriendsPanel
  actionsRemaining: number      // già disponibile in EnhancedFriendsPanel
  onAction: (action: string) => void   // = onGirlfriendAction già presente
  onBreakup: () => void                // = onGirlfriendBreakup già presente
}
```

Tutti i props combaciano esattamente con quelli già passati da `App.tsx` a `EnhancedFriendsPanel`.
**Non serve modificare `App.tsx`.** Non serve modificare `girlfriend-system.ts`.

---

## FIX C3-1 — `GirlfriendPanel.tsx`: rimuovere il branch "nessuna ragazza"

**Motivo:** il guard `if (!girlfriend) return (...)` non serve più perché il controllo
`{girlfriend && ...}` è già nel componente padre (`EnhancedFriendsPanel`). Mantenere
quel branch sarebbe codice morto e potenzialmente fuorviante.

**File:** `src/components/GirlfriendPanel.tsx`

Individua e **rimuovi** il seguente blocco (riga ~38):

```tsx
// RIMUOVERE tutto questo blocco:
if (!girlfriend) {
  return (
    <Card className="p-6 border-2 border-muted bg-card/50 text-center">
      <Heart size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" weight="fill" />
      <p className="text-lg text-muted-foreground">
        Nessuna ragazza al momento. Esci di più per conoscere qualcuna!
      </p>
    </Card>
  )
}
```

Dopo la rimozione, `GirlfriendPanel` presuppone sempre che `girlfriend` sia non-null.
Aggiorna la firma del prop di conseguenza:

```tsx
// PRIMA:
interface GirlfriendPanelProps {
  girlfriend: Ragazza | null
  ...
}

// DOPO:
interface GirlfriendPanelProps {
  girlfriend: Ragazza          // C3-1: non più nullable — il guard è nel padre
  stats: GameStats
  actionsRemaining: number
  onAction: (action: string) => void
  onBreakup: () => void
}
```

Ajusta la destructuring della funzione di conseguenza:
```tsx
export function GirlfriendPanel({
  girlfriend,  // ora Ragazza, non Ragazza | null
  stats,
  actionsRemaining,
  onAction,
  onBreakup
}: GirlfriendPanelProps) {
```

---

## FIX C3-2 — `EnhancedFriendsPanel.tsx`: sostituire la card inline con `<GirlfriendPanel>`

**File:** `src/components/EnhancedFriendsPanel.tsx`

### C3-2a — Aggiungere l'import di `GirlfriendPanel`

In cima al file, dopo gli import esistenti, aggiungere:

```tsx
import { GirlfriendPanel } from '@/components/GirlfriendPanel'
```

### C3-2b — Sostituire la card inline con il componente

Individua il blocco introdotto dal fix C2-3 (cerca il commento `{/* C2-3: card fidanzata */}`).

**RIMUOVERE tutto il blocco `{girlfriend && (<Card ...> ... </Card>)}`** introdotto in C2-3
(da `{girlfriend && (` fino alla relativa `)}` di chiusura — circa 40 righe).

**SOSTITUIRE con:**

```tsx
{/* C3-2: GirlfriendPanel embedded — sostituisce la card inline di C2-3 */}
{girlfriend && (
  <GirlfriendPanel
    girlfriend={girlfriend}
    stats={stats}
    actionsRemaining={actionsRemaining}
    onAction={onGirlfriendAction}
    onBreakup={onGirlfriendBreakup}
  />
)}
```

### C3-2c — Verificare che i prop `onGirlfriendAction` e `onGirlfriendBreakup` siano ancora presenti

L'interface `EnhancedFriendsPanelProps` introdotta in C2-3 deve rimanere invariata:

```tsx
interface EnhancedFriendsPanelProps {
  friends: Friend[]
  stats: GameStats
  actionsRemaining: number
  onFriendAction: (friendId: string, actionId: string) => void
  girlfriend: Ragazza | null          // rimane nullable — il guard è nel JSX
  onGirlfriendAction: (action: string) => void
  onGirlfriendBreakup: () => void
}
```

**Nota:** `girlfriend` rimane `Ragazza | null` nell'interfaccia di `EnhancedFriendsPanel`
perché il componente padre non sa sempre se c'è una ragazza. È solo dentro il branch
`{girlfriend && ...}` che passiamo il valore a `GirlfriendPanel` (che ora lo vuole non-null).
TypeScript inferirà correttamente il narrowing e non darà errori.

---

## NESSUNA MODIFICA RICHIESTA A

- `src/App.tsx` — i prop passati a `EnhancedFriendsPanel` non cambiano
- `src/lib/girlfriend-system.ts` — logica di gioco invariata
- `src/lib/types.ts` — tipi invariati
- `src/hooks/useGameActions.ts` — handler invariati

---

## ORDINE DI APPLICAZIONE

1. **C3-1** — `GirlfriendPanel.tsx`: rimuovi guard null + aggiorna prop type
2. **C3-2a** — `EnhancedFriendsPanel.tsx`: aggiungi import
3. **C3-2b** — `EnhancedFriendsPanel.tsx`: sostituisci card inline con `<GirlfriendPanel>`
4. **C3-2c** — verifica che l'interface `EnhancedFriendsPanelProps` sia corretta

---

## CHECKLIST DI TEST C3

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| T-C3-1 | Pannello Amicizie senza fidanzata | Solo lista amici, nessuna card fidanzata |
| T-C3-2 | Pannello Amicizie con fidanzata attiva | Compare `GirlfriendPanel` completo in cima |
| T-C3-3 | Tab "Info" nella card fidanzata | Mostra hobby, cosa le piace, stat mancanti |
| T-C3-4 | Tab "Azioni" nella card fidanzata | Mostra 6 azioni con requisiti e costi |
| T-C3-5 | Tab "Statistiche" nella card fidanzata | Mostra contatori uscite/messaggi/regali/litigi |
| T-C3-6 | Fidanzata ufficiale (status 'fidanzata') | Mostra sezione "Salute Relazione" con Felicità/Fiducia/Gelosia |
| T-C3-7 | Pulsante "Dichiarati!" con interesse >= 70 | Appare con animazione pulse |
| T-C3-8 | Pulsante "Lascia" | Funziona e chiama `onGirlfriendBreakup` |
| T-C3-9 | TypeScript build (`npm run build`) | Nessun errore di tipo |
| T-C3-10 | Lista amici dopo la card fidanzata | Gli amici sono ancora visibili sotto `GirlfriendPanel` |

---

## NOTE FINALI PER COPILOT

- **Non eliminare** nessun file esistente.
- **Non modificare** la logica delle azioni in `girlfriend-system.ts`.
- Il narrowing TypeScript `{girlfriend && <GirlfriendPanel girlfriend={girlfriend} ...>}`
  è sufficiente per soddisfare il tipo `Ragazza` (non-null) — non serve un cast esplicito.
- Se TypeScript segnala ancora errore sul tipo, usare `girlfriend!` come non-null assertion
  solo come ultima risorsa: `<GirlfriendPanel girlfriend={girlfriend!} ...>`.
- L'import di `GirlfriendPanel` in `App.tsx` che era stato commentato/rimosso nel fix C2-3
  **non va ripristinato** — il componente ora è importato solo da `EnhancedFriendsPanel`.
