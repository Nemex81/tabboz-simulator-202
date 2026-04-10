# Prompt per Copilot — Refactor: girlfriend slot → activePartners

## Obiettivo
Sostituire lo stato singolo `girlfriend: Ragazza | null` / `setGirlfriend` con una
collezionee `activePartners: ActivePartner[]` mantenendo piena retrocompatibilità
dei salvataggi e senza rompere nessun test esistente.

---

## Contesto architetturale (NON modificare questi elementi)

- `Relationship[]` è il summary model leggero già usato da `RelationshipsPanel`,
  `calcMaxRelazioni`, `canStartNewRomanticRelationship` → **NON toccare**
- `Ragazza` è il modello ricco (hobby, gelosia, trust, happiness, lastInteractionDate,
  stats) → usato da `GirlfriendPanel` e `useGirlfriendActions`
- Esiste già `generateGirlfriendFromRelationship` per creare una `Ragazza` da una
  `Relationship` → **NON rimuovere, verrà usata per creare ActivePartner**
- Lo slot singolo è persistito come chiave `tabboz-girlfriend` in `useHydratedKV`

---

## Nuovo tipo da introdurre

In `src/lib/girlfriend-system.ts` (o `src/lib/types.ts` se più appropriato):

```ts
export type ActivePartner = Ragazza & { relationshipSourceKey: string };
```

---

## BLOCCO 1 — Tipi e persistenza
**File:** `src/lib/girlfriend-system.ts`, `src/hooks/types.ts`,
`src/hooks/useHydratedKV.ts`, `src/hooks/useAppEffects.ts`, `src/App.tsx`

### hooks/types.ts
- Sostituire `girlfriend: Ragazza | null` con `activePartners: ActivePartner[]`
- Sostituire `setGirlfriend: (g: Ragazza | null) => void` con
  `setActivePartners: React.Dispatch<React.SetStateAction<ActivePartner[]>>`

### useHydratedKV.ts
- Aggiungere la nuova chiave save `tabboz-active-partners` di tipo `ActivePartner[]`

### useAppEffects.ts — migrazione legacy save (CRITICA)
Logica di bootstrap:
```
SE tabboz-active-partners assente O vuoto
E tabboz-girlfriend presente e valido
→ creare ActivePartner dal vecchio slot aggiungendo relationshipSourceKey
  (usare girlfriend.sourceKey se esiste, altrimenti generare un id stabile)
→ inizializzare activePartners con quell'unico elemento
→ NON persistere più in tabboz-girlfriend dopo la normalizzazione
```
La lettura di `tabboz-girlfriend` va mantenuta SOLO come fallback di migrazione.

### App.tsx
- Sostituire `useState<Ragazza | null>(null)` con `useState<ActivePartner[]>([])`
- Aggiornare tutti i passaggi di props verso hook e componenti
- Aggiornare la normalizzazione `rawGirlfriend` → `rawActivePartners`

### ✅ Dopo il blocco 1: eseguire `tsc --noEmit` e correggere prima di procedere

---

## BLOCCO 2 — Business logic hook
**File:** `src/hooks/useEventEngine.ts`, `src/hooks/useSocialActions.ts`,
`src/hooks/useGirlfriendActions.ts`, `src/hooks/useGameActions.ts`,
`src/hooks/useSchoolHandlers.ts`

### useSocialActions.ts e useEventEngine.ts
Quando una `Relationship` diventa attiva:
- Creare `ActivePartner` tramite `generateGirlfriendFromRelationship` + aggiunta di
  `relationshipSourceKey`
- Fare **upsert** in `activePartners`:
  - se esiste già un elemento con lo stesso `relationshipSourceKey` → aggiornare
  - altrimenti → aggiungere
- **NON** chiamare più `setGirlfriend(...)`, chiamare `setActivePartners(prev => ...)`

### useGirlfriendActions.ts
Nuova firma:
```ts
useGirlfriendActions(
  activePartners: ActivePartner[],
  setActivePartners: React.Dispatch<...>,
  partnerKey: string   // relationshipSourceKey del partner target
)
```
- `onPartnerBreakup(partnerKey)`: rimuovere il partner con quel key da `activePartners`
- `onPartnerUpdate(partnerKey, updates)`: aggiornare il partner corrispondente
- Mantenere la stessa logica di gelosia, trust, happiness — solo re-indirizzata al
  partner corretto tramite `partnerKey`

### useGameActions.ts
- Aggiornare il forwarding del contratto condiviso per passare `activePartners` e
  `setActivePartners` invece di `girlfriend` e `setGirlfriend`

### useSchoolHandlers.ts
- Il reset globale: `setActivePartners([])` invece di `setGirlfriend(null)`

### ✅ Dopo il blocco 2: eseguire `tsc --noEmit` e correggere prima di procedere

---

## BLOCCO 3 — UI container
**File:** `src/components/CharacterSheet.tsx`, `src/components/tabs/SchoolTab.tsx`,
`src/components/FriendshipsPanel.tsx`, `src/components/EnhancedFriendsPanel.tsx`

- Tutti ricevono `activePartners: ActivePartner[]` invece di `girlfriend: Ragazza | null`
- `EnhancedFriendsPanel`: diventare contenitore multi-partner
  ```tsx
  {activePartners.map(partner => (
    <GirlfriendPanel
      key={partner.relationshipSourceKey}
      girlfriend={partner}
      partnerKey={partner.relationshipSourceKey}
      onAction={...}
    />
  ))}
  ```
- Se `activePartners` è vuoto → mostrare lo stato vuoto già esistente (o equivalente)

### ✅ Dopo il blocco 3: eseguire `tsc --noEmit` e correggere prima di procedere

---

## BLOCCO 4 — UI dettaglio
**File:** `src/components/GirlfriendPanel.tsx`

- Il componente resta quasi identico come dettaglio di UN singolo partner
- Aggiungere la prop `partnerKey: string` per identificare quale partner è target
  delle azioni
- La prop `girlfriend: Ragazza` può restare invariata per il rendering interno
  (ActivePartner estende Ragazza, quindi è compatibile)

### ✅ Dopo il blocco 4: eseguire `tsc --noEmit` e correggere prima di procedere

---

## BLOCCO 5 — Test
**File:** `src/hooks/useSocialActions.test.ts`, `src/hooks/useEventEngine.test.ts`,
`src/hooks/useGameActions.test.ts`, `src/components/EnhancedFriendsPanel.test.tsx`,
`src/components/FriendshipsPanel.test.tsx`

- Sostituire tutti i mock `girlfriend: null` con `activePartners: []`
- Sostituire `setGirlfriend: vi.fn()` con `setActivePartners: vi.fn()`
- Sostituire le asserzioni `expect(setGirlfriend).toHaveBeenCalledWith(...)` con
  asserzioni sull'upsert in `activePartners`
- Aggiungere **almeno 1 test nuovo** in `EnhancedFriendsPanel.test.tsx`:
  rendering corretto con 2 partner attivi distinti
- `RelationshipsPanel.test.tsx` → **NON toccare** (già corretto)
- `src/lib/gender-utils.test.ts` → **NON toccare** (calcMaxRelazioni invariata)

### ✅ Dopo il blocco 5: eseguire `vitest run` — tutti i test esistenti devono passare

---

## BLOCCO 6 — Documentazione
**File:** `docs/TODO.md`, `docs/PLAN-social-network-expansion.md`

- Aggiornare le sezioni relative allo slot singolo `girlfriend`
- Segnare come completato il refactor verso `activePartners`
- Aggiornare eventuali riferimenti a `setGirlfriend` nella documentazione

---

## Regole critiche — rispettare sempre

1. **NON modificare** `Relationship`, `RelationshipsPanel`, `calcMaxRelazioni`,
   `canStartNewRomanticRelationship`
2. **NON rimuovere** `generateGirlfriendFromRelationship` — viene ancora usata
3. La **migrazione save è one-way**: si legge `tabboz-girlfriend`, si normalizza,
   si scrive `tabboz-active-partners`. Non si persiste MAI più in `tabboz-girlfriend`
4. `tsc --noEmit` obbligatorio dopo ogni blocco — se fallisce, correggere prima
   di procedere al blocco successivo
5. `vitest run` finale — tutti i test pre-esistenti devono passare
6. Ogni commit deve essere atomico per blocco

---

## Ordine commit consigliato

```
feat(types): add ActivePartner type and tabboz-active-partners save key
refactor(app): replace girlfriend slot with activePartners state
refactor(hooks): upsert activePartners in useEventEngine and useSocialActions
refactor(hooks): update useGirlfriendActions to multi-partner signature
refactor(hooks): update useGameActions and useSchoolHandlers contracts
refactor(ui): update container components to activePartners prop
refactor(ui): add partnerKey prop to GirlfriendPanel
test: update mocks and add multi-partner rendering test
docs: mark activePartners refactor as complete in TODO and PLAN
```
