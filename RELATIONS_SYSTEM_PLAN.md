# RELATIONS_SYSTEM_PLAN.md
## Progetto Logico — Sistema Relazioni e Amicizie
**Versione:** 1.0  
**Data:** 2026-04-06  
**Stato:** BOZZA LOGICA — da convertire in piano tecnico implementativo  
**Autore:** Luca Profita + Perplexity AI

---

## 1. VISIONE GENERALE

Il sistema relazioni introduce la gestione strutturata dei legami interpersonali del personaggio giocante. Le relazioni si dividono in due macro-categorie con gestione UI separata:

- **Relazioni scolastiche** — compagni di classe e di istituto, gestite nel pannello Scuola (sotto-pannello "Compagni")
- **Relazioni extrascolastiche** — amici, conoscenti, interessi romantici conosciuti fuori dalla scuola, gestite nel pannello CharacterSheet (sotto-pannello "Relazioni")

Ogni NPC ha un profilo relazionale a **4 assi indipendenti** ispirato al sistema di Popomundo, con un catalogo di 32 interazioni suddivise in 8 categorie a soglia progressiva.

---

## 2. STATO DEL CODICE ESISTENTE

### 2.1 File già presenti (da NON riscrivere, solo estendere)

| File | Contenuto rilevante |
|---|---|
| `src/lib/enhanced-friend-system.ts` | Generazione NPC, 4 archetipi FriendType, 6 azioni base, applyFriendActionEffects |
| `src/lib/social-system.ts` | generateRandomFriend/Relationship, checkNewFriendEvent(carisma, location), getFriendStudyBonus |
| `src/lib/girlfriend-system.ts` | Sistema romantico separato per le fidanzate (19KB, NON toccare in questa fase) |
| `src/lib/types.ts` | Interfacce Friend, Relationship, GameState, RelationshipTier, SocialBondType |

### 2.2 Problema centrale — Friend è piatto

L'interfaccia `Friend` attuale non ha contesto di origine. Tutti gli amici vivono in un unico KV store indistinto in `App.tsx` senza distinzione tra compagni di scuola e amici extrascolastici. Il campo `affinita` (numero singolo 0-100) non è sufficiente per rappresentare legami complessi.

### 2.3 Ganci già presenti da sfruttare

- `checkNewFriendEvent(carisma, location)` in `social-system.ts` — il parametro `location` esiste ma non viene usato: è il punto di innesco perfetto per differenziare i tipi di amicizia
- `school-morning-events.ts` — trigger naturale per generare compagni di scuola
- `phase-actions.ts` — trigger naturale per generare amici extrascolastici nelle fasi pomeriggio/sera
- `RelationshipTier` e `SocialBondType` in `types.ts` — esistono ma verranno sostituiti da logica derivata

---

## 3. STRUTTURA DATI — RelationStats

Ogni NPC avrà 4 assi **indipendenti**, ciascuno nel range `0–100`.

```typescript
interface RelationStats {
  amicizia:  number  // vicinanza, fiducia, tempo passato insieme
  romantico: number  // attrazione, flirt, tensione sentimentale
  amore:     number  // legame profondo (condizionato, vedi regole)
  odio:      number  // risentimento, rivalità, tradimenti accumulati
}
```

### 3.1 Regole di interazione tra assi

1. **Amore condizionato** — `amore` può aumentare SOLO se `amicizia >= 40 && romantico >= 30`. Se una delle due condizioni cade sotto soglia, `amore` non scende automaticamente ma non può più salire.
2. **Erosione reciproca** — Se `odio > 60` → `amicizia -= 1` per ogni giorno di gioco trascorso. Se `amicizia > 70` → `odio -= 1` per ogni giorno. I due assi non si annullano mai direttamente.
3. **Romantico libero** — `romantico` non richiede `amicizia`. Il crush da lontano verso uno sconosciuto è rappresentabile (`amicizia = 0, romantico = 20`).
4. **Odio e amicizia coesistono** — Non si escludono. Un rivale rispettato con `amicizia = 40, odio = 55` è un profilo valido e narrativamente interessante.

### 3.2 Valori iniziali per tipo di origine

| originType | amicizia | romantico | amore | odio |
|---|---|---|---|---|
| compagno_classe | 15 | 0 | 0 | 0 |
| compagno_istituto | 5 | 0 | 0 | 0 |
| extrascolastico | 10 | 0 | 0 | 0 |
| (legacy migrazione) | affinita esistente | 0 | 0 | 0 |

---

## 4. INTERFACCIA Friend AGGIORNATA

```typescript
interface Friend {
  // ── campi esistenti (invariati) ────────────────────────────────
  id:           string
  name:         string
  type:         FriendType          // 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'
  intelligenza?: number
  unlocked:     boolean

  // ── NUOVO: contesto di origine ─────────────────────────────────
  originType:     'compagno_classe' | 'compagno_istituto' | 'extrascolastico'
  metAt?:         'classe' | 'corridoio' | 'quartiere' | 'palestra'
                | 'online' | 'festa' | 'sport' | 'lavoro'
  schoolYearMet?: number            // anno scolastico in cui ci si è conosciuti

  // ── NUOVO: assi relazionali ────────────────────────────────────
  rel: RelationStats

  // ── DEPRECATO (mantenere per retrocompatibilità KV) ───────────
  affinita?: number                 // usato solo da migrateLegacyFriend()
  tier?:     RelationshipTier       // ora derivato, non stored
  bondType?: SocialBondType         // ora derivato, non stored
}
```

### 4.1 Migrazione dati legacy

```typescript
function migrateLegacyFriend(f: Friend): Friend {
  if (f.rel) return f  // già migrato
  return {
    ...f,
    originType: f.originType ?? 'extrascolastico',
    rel: {
      amicizia:  f.affinita ?? 50,
      romantico: 0,
      amore:     0,
      odio:      0,
    }
  }
}
```

Questa funzione va chiamata in `App.tsx` al caricamento del KV store `rawFriends`, prima di qualsiasi utilizzo.

---

## 5. TIER DERIVATO — getRelationTier()

Il tier NON viene salvato nel dato — viene calcolato al volo da `getRelationTier(rel: RelationStats)`. Priorità di valutazione dall'alto verso il basso:

```
odio >= 80                              → 'nemico_giurato'
odio >= 50                              → 'rivale'
amore >= 70 && romantico >= 60          → 'fidanzato_a'
amore >= 40 && romantico >= 50          → 'innamorato_a'
romantico >= 60                         → 'interesse_romantico'
amicizia >= 85                          → 'migliore_amico'
amicizia >= 60                          → 'amico_stretto'
amicizia >= 30                          → 'amico'
amicizia >= 10                          → 'conoscente'
default                                 → 'sconosciuto'
```

**Tipo aggiornato RelationTier:**
```typescript
type RelationTier =
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

---

## 6. CATALOGO INTERAZIONI — 32 azioni in 8 categorie

Ogni interazione ha:
- `id` — chiave univoca
- `category` — categoria di appartenenza
- `label` — nome visualizzato in UI
- `description` — testo descrittivo breve
- `prereq` — prerequisiti in termini di soglie RelationStats
- `effects` — delta applicati ai 4 assi + eventuali effetti su GameStats
- `failEffects?` — effetti alternativi in caso di fallimento (per azioni con esito casuale)
- `failChance?` — probabilità di fallimento (0-100), se assente = azione deterministica

### CATEGORIA 0 — CORTESIA
*Prerequisito: nessuno. Sempre disponibili.*

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `saluta` | Saluta | amicizia +2, odio -1 | — | — |
| `presenta_te` | Presentati | amicizia +3 *(solo se amicizia == 0)* | — | — |
| `fai_complimento` | Fai un complimento | amicizia +2, romantico +2 | — | — |
| `sorridi` | Sorridi | amicizia +1 | — | — |
| `ignora` | Ignoralo/a | amicizia -2, odio +3 | — | — |

### CATEGORIA 1 — CONOSCENZA
*Prerequisito: amicizia >= 10*

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `chiacchiera` | Chiacchiera | amicizia +4 | — | — |
| `fai_battuta` | Fai una battuta | amicizia +3 | amicizia -1, odio +2 | 25 |
| `chiedi_come_stai` | Chiedi come sta | amicizia +3, amore +1 *(se amore > 0)* | — | — |
| `scambia_contatto` | Scambia contatto | amicizia +5 | — | — |
| `racconta_barzelletta` | Racconta una barzelletta | amicizia +2, romantico +1 | amicizia -1 | 20 |

### CATEGORIA 2 — AMICIZIA
*Prerequisito: amicizia >= 30*

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `esci_insieme` | Esci insieme | amicizia +6, romantico +3, soldi -10 | — | — |
| `condividi_segreto` | Condividi un segreto | amicizia +8, odio -5 | amicizia -5, odio +10 | 15 |
| `chiedi_consiglio` | Chiedi consiglio | amicizia +5 | — | — |
| `fai_un_favore` | Fai un favore | amicizia +7, odio -3 | — | — |
| `prenditi_gioco` | Prenditi gioco di lui/lei | amicizia +3 | amicizia -5, odio +8 | 35 |
| `litiga` | Litiga | amicizia -10, odio +15 | — | — |

### CATEGORIA 3 — AMICIZIA STRETTA
*Prerequisito: amicizia >= 60*

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `confida_problema` | Confida un problema | amicizia +10, amore +5 *(se romantico >= 20)* | — | — |
| `chiedi_prestito` | Chiedi un prestito | soldi +20/+50 (random), amicizia -10 | — | — |
| `difendi` | Difendi dall'aggressore | amicizia +12, odio -8 | amicizia +5, reputazione -5 | 20 |
| `studia_insieme` | Studia insieme | amicizia +6, media +0.2 *(se type == secchione: +0.5)* | — | — |
| `festa_insieme` | Organizza una festa | amicizia +8, romantico +5, soldi -30 | — | — |

### CATEGORIA R1 — FLIRT LEGGERO
*Prerequisito: romantico >= 20, odio < 40*

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `flirta` | Flirta | romantico +5 | amicizia -5, odio +5 | 30 |
| `fai_occhiolino` | Fai l'occhiolino | romantico +3 | romantico -1 | 15 |
| `complimento_fisico` | Complimento fisico | romantico +4 | odio +2 | 25 |

### CATEGORIA R2 — INTERESSE ROMANTICO
*Prerequisito: romantico >= 50, amicizia >= 20*

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `invita_fuori` | Invita fuori | romantico +8, amicizia +5 | romantico -10 | 25 |
| `regala_qualcosa` | Regala qualcosa | romantico +8, amore +5, soldi -20 | — | — |
| `dedica_canzone` | Dedica una canzone | romantico +6, amore +4 | romantico -5 | 20 |

### CATEGORIA A — AMORE
*Prerequisito: amore >= 40, romantico >= 50*

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `dichiara_amore` | Dichiarati | tier → fidanzato_a, amore +15 | amore -15, romantico -10 | 30 |
| `bacio` | Bacio *(richiede tier == fidanzato_a)* | amore +10, romantico +5 | — | — |
| `litigate_coppia` | Litiga da coppia | amore -15, odio +10 | — | — |

### CATEGORIA N — CONFLITTO
*Prerequisito: odio >= 30 (ma chiedi_scusa disponibile sempre)*

| id | label | effects | failEffects | failChance |
|---|---|---|---|---|
| `insulta` | Insulta | odio +15, amicizia -10 | — | — |
| `sfida` | Sfida *(fisicamente o verbalmente)* | odio +20, reputazione +10 *(se vinci)* | odio +20, reputazione -5 | 40 |
| `chiedi_scusa` | Chiedi scusa | odio -15, amicizia +5 *(bonus solo se odio > 30)* | — | — |
| `ignora_volutamente` | Ignora volutamente | amicizia -8, odio +10 | — | — |

---

## 7. SEPARAZIONE UI — Dove va cosa

### 7.1 Pannello Scuola → sotto-pannello "Compagni"
- Mostra tutti i `Friend` con `originType == 'compagno_classe'` o `'compagno_istituto'`
- Raggruppati: prima i compagni di classe, poi quelli di istituto
- Badge visivo che indica l'anno scolastico in cui ci si è conosciuti (`schoolYearMet`)
- Interazioni disponibili: tutte le categorie 0, 1, 2, 3 (non R1/R2/A a meno che romantico non superi soglia)
- I compagni di classe si **perdono** (passano a `unlocked: false`) quando si cambia istituto o si sceglie una nuova scuola in `handleSchoolSelection`; i compagni di istituto rimangono

### 7.2 Pannello CharacterSheet → sotto-pannello "Relazioni"
- Mostra tutti i `Friend` con `originType == 'extrascolastico'`
- Mostra anche la fidanzata attuale (da `girlfriend-system.ts`) se presente, in sola lettura
- Per ogni NPC: 4 barre colorate (amicizia=verde, romantico=rosa, amore=rosso, odio=grigio scuro) + tier label
- Lista interazioni disponibili filtrata per soglie attuali
- Gli amici extrascolastici **NON si perdono** al cambio scuola

---

## 8. GENERAZIONE NPC — Trigger e Contesto

### 8.1 Compagni di scuola
- **Trigger:** `school-morning-events.ts` — evento di tipo `social` durante la mattina scolastica
- **Funzione:** `generateSchoolFriend(schoolType: SchoolType, schoolYear: number, isClassmate: boolean): Friend`
- **Probabilità base:** 8% per giorno scolastico, +carisma/15
- **Limite:** max 6 compagni di classe attivi, max 4 compagni di istituto

### 8.2 Amici extrascolastici
- **Trigger:** `phase-actions.ts` — azioni specifiche nel pomeriggio/sera (es. "Esci nel quartiere", "Vai in palestra", "Vai a una festa")
- **Funzione:** `generateExtraFriend(metAt: Friend['metAt']): Friend`
- **Probabilità base:** dipende dall'azione (es. festa = 60%, quartiere = 20%, palestra = 30%)
- **Limite:** max 8 amici extrascolastici attivi

### 8.3 Mappatura metAt → FriendType prevalente

| metAt | FriendType più probabile |
|---|---|
| classe / corridoio | tutti i tipi, equidistribuiti |
| quartiere | coatto 50%, ribelle 30%, altri 20% |
| palestra | sportivo 60%, coatto 30%, altri 10% |
| online | secchione 40%, generico 40%, ribelle 20% |
| festa | coatto 35%, sportivo 25%, ribelle 25%, altri 15% |
| sport | sportivo 70%, altri 30% |
| lavoro | generico 50%, secchione 30%, altri 20% |

---

## 9. EROSIONE TEMPORALE — Tick giornaliero

Ad ogni avanzamento di giorno in `useGameTime.ts` (o nel hook corrispondente), applicare per ogni `Friend` attivo:

```
SE odio > 60  → rel.amicizia = max(0, rel.amicizia - 1)
SE amicizia > 70 → rel.odio = max(0, rel.odio - 1)
SE giorni_senza_interazione > 30 → rel.amicizia = max(0, rel.amicizia - 0.5)
SE giorni_senza_interazione > 60 → rel.amicizia = max(0, rel.amicizia - 1)
```

Il campo `lastInteractionDate?: GameDate` va aggiunto a `Friend` per tracciare il decadimento da inattività.

---

## 10. INTEGRAZIONE CON SISTEMI ESISTENTI

### 10.1 Effetti delle relazioni su GameStats
- `amicizia >= 60` con almeno 1 amico `secchione` → bonus studio +0.2 media (già in `getFriendStudyBonus`)
- `amicizia >= 50` con almeno 1 amico `sportivo` → `muscoli` max +5 passivo
- `odio >= 70` con qualunque NPC → `stress += 2` per giorno (conflitto irrisolto)
- `amore >= 70` (fidanzato/a) → `morale += 3` per giorno

### 10.2 Compatibilità con girlfriend-system.ts
- `girlfriend-system.ts` gestisce il fidanzamento in modo autonomo e separato
- Il `Friend` corrispondente alla fidanzata può esistere in parallelo con `rel.amore` aggiornato
- **Non unificare** i due sistemi in questa fase: mostrare la fidanzata nel pannello Relazioni in sola lettura, con link al pannello fidanzata esistente

### 10.3 Effetti sul registro eventi (GameLog)
- Ogni interazione con NPC genera un `GameLogEntry` di tipo `'social'`
- Il tier raggiunto per la prima volta genera una notifica speciale (es. "Sei diventato amico stretto di Marco!")

---

## 11. FILE DA CREARE E MODIFICARE

### 11.1 File NUOVO
```
src/lib/relation-system.ts
```
Contiene:
- `RelationStats` (interfaccia)
- `RelationTier` (tipo aggiornato con nemico_giurato, rivale, ecc.)
- `getRelationTier(rel: RelationStats): RelationTier`
- `getRelationTierLabel(tier: RelationTier): string` (con emoji)
- `INTERACTION_CATALOG: InteractionDefinition[]` (32 interazioni)
- `checkInteractionAvailable(id, rel): { canUse: boolean; reason?: string }`
- `applyInteractionEffects(id, rel, stats): { newRel, newStats, message, success }`
- `applyDailyErosion(friends: Friend[], today: GameDate): Friend[]`
- `migrateLegacyFriend(f: Friend): Friend`

### 11.2 File MODIFICATI

| File | Modifiche |
|---|---|
| `src/lib/types.ts` | Aggiungere `RelationStats`, aggiornare `Friend` (originType, metAt, schoolYearMet, rel, lastInteractionDate), aggiungere `friends: Friend[]` a `GameState`, aggiornare `RelationTier` |
| `src/lib/enhanced-friend-system.ts` | Aggiungere `generateSchoolFriend()`, `generateExtraFriend()`, delegare `applyFriendActionEffects` a `relation-system.ts` mantenendo compatibilità firma |
| `src/lib/social-system.ts` | Usare `location` in `checkNewFriendEvent` per modulare probabilità per `metAt` |
| `src/lib/school-morning-events.ts` | Aggiungere trigger generazione compagni con `generateSchoolFriend()` |
| `src/lib/phase-actions.ts` | Aggiungere trigger generazione amici extrascolastici con `generateExtraFriend()` |
| `src/components/CharacterSheet.tsx` | Aggiungere tab "Relazioni" con lista amici extrascolastici, barre 4 assi, interazioni disponibili |
| `src/App.tsx` | Spostare `friends` in `GameState`, chiamare `migrateLegacyFriend` al caricamento KV, aggiungere `applyDailyErosion` nel tick giornaliero, reset compagni di classe in `handleSchoolSelection` |

### 11.3 File NUOVO UI (opzionale, se CharacterSheet diventa troppo grande)
```
src/components/RelationsPanel.tsx       → pannello completo relazioni extrascolastiche
src/components/SchoolFriendsPanel.tsx   → pannello compagni di scuola
src/components/RelationCard.tsx         → card singolo NPC con barre 4 assi
```

---

## 12. VINCOLI E NOTE PER COPILOT

1. **NON riscrivere** `girlfriend-system.ts` — è fuori scope di questa feature
2. **NON rimuovere** il campo `affinita` da `Friend` finché `migrateLegacyFriend` non è attivo e testato
3. **Mantenere compatibilità** con tutti i componenti che leggono `friend.affinita` — aggiungere getter computato se necessario
4. Il file `relation-system.ts` deve essere **zero-dipendenze** da React (solo TypeScript puro) per essere testabile in isolamento
5. Le **barre 4 assi** nella UI usano colori semantici: amicizia=verde, romantico=rosa/viola, amore=rosso caldo, odio=grigio antracite
6. Il **limite NPC attivi** (6 compagni classe, 4 istituto, 8 extra) va applicato nella funzione di generazione, non nella UI
7. `applyDailyErosion` va chiamata **una volta sola** per tick giornaliero, non per fase

---

## 13. PRIORITÀ IMPLEMENTATIVA SUGGERITA

```
Fase A — Fondamenta dati
  A1. relation-system.ts (interfacce + getRelationTier + migrateLegacyFriend)
  A2. types.ts (aggiornamento Friend + GameState)
  A3. App.tsx (migrazione KV + friends in GameState)

Fase B — Logica interazioni
  B1. relation-system.ts (INTERACTION_CATALOG completo + checkInteractionAvailable)
  B2. relation-system.ts (applyInteractionEffects + applyDailyErosion)
  B3. enhanced-friend-system.ts (generateSchoolFriend + generateExtraFriend)

Fase C — Trigger generazione NPC
  C1. school-morning-events.ts (trigger compagni)
  C2. phase-actions.ts (trigger extrascolastici)
  C3. social-system.ts (usa location in checkNewFriendEvent)

Fase D — UI
  D1. RelationCard.tsx (card NPC con 4 barre)
  D2. CharacterSheet.tsx (tab Relazioni)
  D3. SchoolFriendsPanel.tsx o sotto-pannello in pannello Scuola

Fase E — Integrazione effetti
  E1. Effetti passivi su GameStats (bonus studio, morale, stress)
  E2. GameLog entries per interazioni
  E3. Notifiche tier raggiunto per la prima volta
```

---

*Fine documento — versione 1.0*
