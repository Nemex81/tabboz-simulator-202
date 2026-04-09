# API Reference — Tabboz Simulator 2026

> Riferimento completo delle funzionalità esposte dal gioco: librerie di dominio, custom hooks e componenti.

---

## Aggiornamenti recenti (08 Apr 2026)

- `useSchoolSystem` / flow scuole: introdotto `initSchoolYear` per inizializzare l'anno scolastico dall'onboarding (`SchoolSelection`).
- `SchoolRecord` ora include `isAtSchool: boolean` (flag persistente usato nelle routine mattutine).
- Nota implementativa: per evitare problemi di reconciliaton DOM durante la sequenza `SchoolMorningPanel`, alcune chiamate di aggiornamento parent vengono deferrate al prossimo tick (pattern `setTimeout(..., 0)`) — vedi `src/components/SchoolMorningPanel.tsx`.
- Il report di analisi codice completo è disponibile in `docs/ANALISI_CODEBASE_COMPLETA.md`.
- `ScheduledExam` supporta ora `type?: 'scritto' | 'orale'`; `generateScheduledExam()` può generare sia compiti scritti sia interrogazioni orali programmate.
- Configurata la suite unit test con Vitest + `jsdom`; il setup condiviso vive in `src/test-setup.ts`.


## Indice

1. [Tipi e Interfacce Principali](#tipi-e-interfacce-principali)
2. [Librerie di Dominio (src/lib)](#librerie-di-dominio)
   - [game-utils.ts](#game-utilsts)
   - [time-utils.ts](#time-utilsts)
   - [subjects.ts](#subjectsts)
   - [exam-system.ts](#exam-systemts)
   - [social-system.ts](#social-systemts)
   - [relation-system.ts](#relation-systemts)
   - [girlfriend-system.ts](#girlfriend-systemts)
   - [enhanced-friend-system.ts](#enhanced-friend-systemts)
   - [character-traits.ts](#character-traitsts)
   - [school-events.ts](#school-eventsts)
   - [school-morning-events.ts](#school-morning-eventsts)
   - [afternoon-events.ts](#afternoon-eventsts)
   - [phase-actions.ts](#phase-actionsts)
   - [bet-system.ts](#bet-systemts)
   - [sound-effects.ts](#sound-effectsts)
   - [data-validation.ts](#data-validationts)
3. [Custom Hooks (src/hooks)](#custom-hooks)
   - [useGameStats](#usegamestats)
   - [useGameTime](#usegametime)
   - [useGameActions](#usegameactions)
   - [useEventEngine](#useeventengine)
   - [useGameRelations](#usegamerelations)
   - [useHealthSystem](#usehealthsystem)
   - [useGameLog](#usegamelog)
   - [useAppDialogs](#useappdialogs)
   - [useKeyboardShortcuts](#usekeyboardshortcuts)
4. [Costanti di Configurazione](#costanti-di-configurazione)

---

## Tipi e Interfacce Principali

> Definiti in `src/lib/types.ts`

### GameStats

```typescript
interface GameStats {
  muscoli: number;        // 0-100 — Forza fisica
  coattaggine: number;    // 0-100 — Street credibility
  soldi: number;          // 0-1000 — Denaro disponibile (€)
  media: number;          // 0-10  — Media scolastica (GPA)
  stanchezza: number;     // 0-100 — Livello di fatica
  stress: number;         // 0-100 — Stress mentale
  morale: number;         // 0-100 — Stato emotivo
  figosita: number;       // 0-100 — Aspetto/coolness
  reputazione: number;    // 0-100 — Reputazione (calcolata)
  intelligenza: number;   // 0-100 — Intelligenza
  carisma: number;        // 0-100 — Carisma sociale
  salute: number;         // 0-100 — Salute fisica
}
```

### GameTime

```typescript
interface GameTime {
  currentDate: GameDate;              // { day, month, year }
  actionsRemaining: number;
  maxActionsPerDay: number;
  schoolYear: SchoolYear;
  age: number;
  currentPhase: DayPhase;
  phaseActions: Record<DayPhase, number>;
  extraActions: number;
}
```

### Friend

```typescript
interface Friend {
  id: string;
  name: string;
  type: 'coatto' | 'secchione' | 'sportivo' | 'ribelle';
  affinita: number;                  // 0-100 (legacy, compatibilità)
  intelligenza?: number;
  unlocked: boolean;
  originType: 'compagno_classe' | 'compagno_istituto' | 'extrascolastico';
  metAt?: 'classe' | 'corridoio' | 'quartiere' | 'palestra';
  rel?: RelationStats;               // Sistema 4 assi (nuovo)
  lastInteractionDay?: number;
}
```

### RelationStats (Sistema 4 Assi)

```typescript
interface RelationStats {
  amicizia: number;      // 0-100 — Fiducia/vicinanza
  romantico: number;     // 0-100 — Attrazione/flirt
  amore: number;         // 0-100 — Legame profondo
  odio: number;          // 0-100 — Risentimento/rivalità
  rivalita?: number;     // 0-100 — Competizione pubblica
}
```

### Ragazza (Fidanzata)

```typescript
interface Ragazza {
  id: string;
  nome: string;
  cognome: string;
  eta: number;
  classe: string;
  aspetto: 'carina' | 'bellissima' | 'normale' | 'alternativa';
  personalita: 'timida' | 'estroversa' | 'secchiona' | 'ribelle' | 'vanitosa';
  interessePerTe: number;            // 0-100
  figositaRichiesta: number;
  statusSociale: number;
  gelosa: boolean;
  hobby: Hobby[];
  statPreferita: 'figosita' | 'muscoli' | 'intelligenza' | 'carisma';
  relationshipStatus: RelationshipStatus;
  stats: RelationshipStats;
  lastInteractionDate?: string;
}

type RelationshipStatus =
  | 'sconosciuta' | 'conoscente' | 'amica'
  | 'interessata' | 'fidanzata' | 'ex';
```

### ScheduledExam

```typescript
interface ScheduledExam {
  id?: string;
  subject: string;
  date?: { day: number; month: number; year: number };
  daysUntil?: number;
  type?: 'scritto' | 'orale';
  isPrepared: boolean;
  difficulty: 'facile' | 'normale' | 'difficile' | 'brutale';
  announced?: boolean;
}
```

### Enumerazioni Chiave

```typescript
type SchoolType = 'tecnico' | 'agraria' | 'artistico'
  | 'conservatorio' | 'alberghiero' | 'liceoScientifico';

type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte';
type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo';

type ReputationLevel = 'sfigato' | 'normale' | 'popolare' | 'leggenda';

type HealthConditionId =
  | 'ciclo_doloroso' | 'influenza' | 'intossicazione' | 'infortunio'
  | 'tossicchiella' | 'pancia_gonfia' | 'sfogo_acne' | 'herpes_labiale';

// Nuovo: tipo unificato per categorie eventi mattutini
type MorningEventCategory =
  | 'didattica' | 'sociale' | 'istituto'
  | 'strada' | 'casa' | 'citta' | 'amici';

// SchoolRecord: ora include `isAtSchool` (flag persistente KV)
interface SchoolRecord {
  wentToSchoolToday: boolean;
  notes?: string[];
  conduct?: number;
  isAtSchool: boolean; // true se il giocatore si è recato fisicamente a scuola nella mattina corrente
}
```

---

## Librerie di Dominio

### game-utils.ts

Utility generiche per statistiche, calcoli e probabilità.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `clampStat` | `(value: number, min?: number, max?: number) → number` | Limita un valore nell'intervallo (default 0–100) |
| `spendMoney` | `(soldi: number, amount: number, actionName: string) → { success, newSoldi, errorMessage? }` | Transazione monetaria con validazione |
| `calculateMedia` | `(grades: SubjectGrades) → number` | Media aritmetica dei voti |
| `calculateWeightedMedia` | `(grades: SubjectGrades, schoolType: SchoolType) → number` | Media ponderata con pesi per indirizzo |
| `getWorstSubjects` | `(grades: SubjectGrades, count: number) → string[]` | Le N materie con voto più basso |
| `randomChance` | `(percentage: number) → boolean` | Check probabilistico (percentuale) |
| `getGPASubjectsForYear` | `(schoolType, year) → SubjectDefinition[]` | Materie che contano per la media |
| `archiveYearGrades` | `(grades, schoolType, year) → { archived, next }` | Archivia voti e prepara anno successivo |
| `calculateReputationFromStats` | `(stats: GameStats) → number` | Calcola reputazione dalla formula pesata |
| `getReputationLevel` | `(rep: number) → { label, color }` | Mappa valore → livello reputazione |
| `getReputationEventModifier` | `(rep: number) → number` | Modificatore difficoltà eventi per reputazione |
| `getMentalStateModifiers` | `(stress, morale) → { modifier }` | Impatto stress/morale sulle azioni |
| `calculateStudyGradeIncrease` | `(intel, media, subject, difficulty) → number` | Incremento voto da sessione di studio |
| `canAvoidNegativeEventWithCharisma` | `(carisma: number) → boolean` | Check Carisma per evitare eventi negativi |

---

### time-utils.ts

Gestione calendario, fasi giornata e avanzamento tempo.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `isLeapYear` | `(year) → boolean` | Anno bisestile |
| `getDaysInMonth` | `(month, year) → number` | Giorni nel mese |
| `formatDate` | `(date: GameDate) → string` | Formattazione leggibile della data |
| `advanceDay` | `(date: GameDate) → GameDate` | Avanza la data di 1 giorno |
| `compareDates` | `(d1, d2) → -1 \| 0 \| 1` | Confronto ordinale tra date |
| `isDateAfterOrEqual` | `(d1, d2) → boolean` | d1 ≥ d2 |
| `isDateBefore` | `(d1, d2) → boolean` | d1 < d2 |
| `isSchoolPeriod` | `(date, schoolYear) → boolean` | La data è nel periodo scolastico? |
| `shouldShowReportCard` | `(date, reportCardDate) → boolean` | È il giorno della pagella? |
| `calculateNextSchoolYear` | `(current: SchoolYear) → SchoolYear` | Calcola anno scolastico successivo |
| `advanceGameTime` | `(gameTime: GameTime) → GameTime` | Avanza 1 giorno con tutte le regole |
| `getDayType` | `(date) → DayType` | Tipo giorno (feriale, sabato, ecc.) |
| `shouldReceivePaghetta` | `(lastPayment, currentDate) → boolean` | È il giorno della paghetta? |

**Costanti:**

| Nome | Tipo | Descrizione |
| --- | --- | --- |
| `DAY_PHASE_CONFIG` | `Record<DayType, Record<DayPhase, DayPhaseConfig>>` | Azioni max e energia per fase/giorno |
| `PHASE_SEQUENCE` | `DayPhase[]` | Ordine fasi: mattina → notte |

---

### subjects.ts

Definizioni materie per indirizzo scolastico e anno.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `getActiveSubjectsForYear` | `(schoolType, year) → SubjectDefinition[]` | Materie attive per indirizzo/anno |
| `getGradeWeight` | `(subject, schoolType) → number` | Peso della materia per la media |
| `getSubjectDisplayName` | `(key: string) → string` | Nome visualizzato della materia |

**Struttura `SubjectDefinition`:**

```typescript
interface SubjectDefinition {
  key: string;
  displayName: string;
  weight: number;            // Peso per la media
  fromYear: number;          // Primo anno di disponibilità
  toYear: number;            // Ultimo anno di disponibilità
  isCommon: boolean;         // Materia comune a tutti gli indirizzi
  countsForGPA: boolean;     // Conta per la media
  weeklyHours?: number;
  weightBySchoolType?: Record<SchoolType, number>;
}
```

**Materie comuni:** Italiano (1.3), Storia (1.0), Inglese (1.1), Matematica (1.2), Scienze Motorie (0.7), Religione (0.0), Fisica (1.0).
**Materie specifiche:** definite in `SPECIFIC_SUBJECTS` per ogni `SchoolType`.

---

### exam-system.ts

Generazione e valutazione verifiche ed interrogazioni.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `generateScheduledExam` | `(subjects: string[]) → ScheduledExam` | Genera una prova programmata casuale, scritta o orale |
| `getDifficultyMultiplier` | `(difficulty) → number` | Moltiplicatore: facile=1.5, normale=1.0, difficile=0.7, brutale=0.5 |
| `getDifficultyText` | `(difficulty) → string` | Label testuale della difficoltà |
| `getDifficultyAnnouncement` | `(subject, difficulty) → string` | Compat wrapper per annunci di verifiche scritte |
| `getScheduledExamTypeText` | `(type?) → string` | Restituisce `SCRITTO` o `ORALE` per la UI |
| `getScheduledExamAnnouncement` | `(subject, difficulty, type?) → string` | Testo narrativo coerente con prova scritta/orale |
| `calculateExamGrade` | `(currentGrade, intel, isPrepared, media, difficulty) → number` | Calcolo voto verifica |
| `calculateSurpriseQuizGrade` | `(intel, media, currentGrade) → number` | Calcolo voto interrogazione a sorpresa |
| `shouldTriggerSurpriseQuiz` | `(absentDays, media) → boolean` | Probabilità interrogazione (10% base) |
| `prepareForExam` | `(exam: ScheduledExam, intelligenza: number) → { newIsPrepared, intelligenceGain, message }` | Marca la prova come preparata e restituisce il messaggio di studio |

---

### social-system.ts

Generazione amici/relazioni e calcolo probabilità incontri.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `generateRandomFriend` | `(location?) → Friend` | Genera amico casuale |
| `generateRandomRelationship` | `() → Relationship` | Genera interesse sentimentale |
| `checkNewFriendEvent` | `(carisma, location) → boolean` | 15% base + Carisma/10 |
| `calculateRelationshipSuccess` | `(stats, relationship) → number` | Chance successo azione romantica (0–95%) |
| `getFriendStudyBonus` | `(friend: Friend) → number` | Bonus studio da amico secchione |

**Costanti:** `FRIEND_NAMES`, `GIRL_NAMES`, `LOCATION_PROB_BONUS`, `MET_AT_TYPE_WEIGHTS`

---

### relation-system.ts

Sistema relazionale a 4 assi con catalogo interazioni e prerequisiti.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `checkInteractionAvailable` | `(rel: RelationStats, interaction: InteractionDef) → boolean` | Verifica prerequisiti interazione |
| `applyInteractionEffects` | `(rel, interaction, success) → RelationStats` | Applica effetti dell'interazione alla relazione |
| `migrateLegacyFriend` | `(friend: Friend) → Friend` | Aggiunge campo `rel` se mancante (migrazione) |
| `applyDailyErosion` | `(rel: RelationStats) → RelationStats` | Decadimento giornaliero relazioni |
| `dateToDayIndex` | `(date: GameDate) → number` | Converte data in indice giorno sequenziale |
| `generateSchoolFriend` | `(originType?, year?) → Friend` | Genera amico scolastico con `rel` |
| `generateExtraFriend` | `(location?) → Friend` | Genera amico extrascolastico |
| `getAffinita` | `(friend: Friend) → number` | Affinità (compatibile legacy e nuovo) |

**Costanti:**

| Nome | Descrizione |
| --- | --- |
| `DEFAULT_RELATION_STATS` | Valori iniziali: `{ amicizia: 10, romantico: 0, amore: 0, odio: 0 }` |
| `ORIGIN_INITIAL_STATS` | Valori iniziali per tipo di incontro |
| `INTERACTION_CATALOG` | Array di `InteractionDef` — tutte le interazioni con prerequisiti ed effetti |

**Struttura `InteractionDef`:**

```typescript
interface InteractionDef {
  id: string;
  category: number;           // 0-7 (categorie tematiche)
  label: string;
  description: string;
  prereq: {
    amicizia?: number;
    romantico?: number;
    amore?: number;
    odio?: number;
    odioMax?: number;
    amiciziaMin?: number;
  };
  effects: RelationEffects;
  failEffects?: RelationEffects;
  failChance?: number;        // 0-100%
}
```

**Tier relazionali (`RelationTierV2`):**

| Tier | Descrizione |
| --- | --- |
| `sconosciuto` | Appena incontrato |
| `conoscente` | Conoscenza superficiale |
| `amico` | Amicizia base |
| `amico_stretto` | Amicizia consolidata |
| `migliore_amico` | Best friend (badge Crown) |
| `interesse_romantico` | Attrazione riconosciuta |
| `innamorato_a` | Sentimenti profondi |
| `fidanzato_a` | Relazione ufficiale |
| `rivale` | Competizione attiva |
| `nemico_giurato` | Ostilità aperta |

---

### girlfriend-system.ts

Generazione, gestione e interazioni con la fidanzata.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `generateRandomGirlfriend` | `() → Ragazza` | Genera ragazza casuale con profilo completo |
| `generateGirlfriendFromRelationship` | `(rel: Relationship) → Ragazza` | Converte Relationship in Ragazza |
| `performGirlfriendAction` | `(girlfriend, actionType, stats) → { updatedGirlfriend, statChanges, message }` | Esegue azione con fidanzata |
| `shouldGirlfriendBreakup` | `(girlfriend: Ragazza) → boolean` | Controlla se la ragazza lascia il giocatore |

**Costanti:** `NOMI_FEMMINILI`, `COGNOMI`, `SCUOLE`, `HOBBY_OPTIONS`, `COLORI_CAPELLI`

---

### enhanced-friend-system.ts

Azioni amicizia avanzate con effetti su statistiche.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `generateRandomEnhancedFriend` | `() → Friend` | Genera amico con `rel` |
| `generateSchoolFriend` | `(originType?, year?) → Friend` | Amico scolastico |
| `generateExtraFriend` | `(location?) → Friend` | Amico extrascolastico |

**`FRIEND_ACTIONS`** — Azioni predefinite per tipo amico, con effetti su `GameStats` e `RelationStats`.

---

### character-traits.ts

Tratti caratteriali ispirati a Crusader Kings 3.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `generateRandomTraits` | `(count?: 2\|3) → CharacterTrait[]` | Genera 2-3 tratti non incompatibili |
| `getTraitsStressModifier` | `(traits: CharacterTrait[]) → number` | Modificatore stress totale dai tratti |
| `getTraitsStatBonuses` | `(traits: CharacterTrait[]) → Partial<GameStats>` | Bonus/malus statistiche dai tratti |

**Tratti disponibili (16):**

| ID | Emoji | Opposto | Effetto principale |
| --- | --- | --- | --- |
| `gregario` | 🤝 | `solitario` | +Carisma, -Stress sociale |
| `solitario` | 🌙 | `gregario` | +Intelligenza, +Stress sociale |
| `coraggioso` | 🦁 | `codardo` | +Muscoli combattimento |
| `codardo` | 🐁 | `coraggioso` | -Penalità fuga |
| `ambizioso` | 🎯 | `pigro` | +Studio, +Stress |
| `pigro` | 🛋️ | `ambizioso` | -Stanchezza, -Studio |
| `onesto` | ⚖️ | `bugiardo` | +Carisma, -Corruzione |
| `bugiardo` | 🎭 | `onesto` | +Corruzione, -Fiducia |
| `calmo` | 🧘 | `irascibile` | -Stress |
| `irascibile` | 🔥 | `calmo` | +Combattimento, +Stress |
| `carismatico` | ✨ | `timido` | +Carisma |
| `timido` | 😶 | `carismatico` | -Incontri sociali |
| `atletico` | 💪 | `imbranato` | +Muscoli, +Figosità |
| `imbranato` | 🤕 | `atletico` | -Muscoli |
| `creativo` | 🎨 | `conformista` | +Intelligenza artistica |
| `conformista` | 📋 | `creativo` | +Reputazione |

---

### school-events.ts

Eventi scolastici narrativi con scelte e conseguenze.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `getParentEventByMedia` | `(media, stats) → SchoolEvent \| null` | Evento genitori se media < 7 |
| `getTeacherEvent` | `() → SchoolEvent` | Evento professore casuale |
| `getConductEvent` | `() → SchoolEvent` | Evento disciplinare |
| `getScaledTeacherEvent` | `() → SchoolEvent` | Evento professore con difficoltà scalata |
| `getSchoolSpecificEvent` | `() → SchoolEvent` | Evento specifico per indirizzo |

**Struttura `SchoolEvent`:**

```typescript
interface SchoolEvent {
  type: 'teacher' | 'parent' | 'schoolSpecific';
  title: string;
  description: string;
  choices: EventChoice[];
  tier?: 1 | 2 | 3;           // 1=piccolo, 2=medio (warning), 3=boss
}
```

---

### school-morning-events.ts

Eventi narrativi della mattina scolastica.

Nota: il pool pre-scuola disambigua ora l'ansia del tragitto (`sm_ansia_interrogazione`) dagli eventi che avvengono già in aula.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `drawSchoolMorningEvents` | `(stats: GameStats, count?: number) → SchoolMorningEvent[]` | Pesca 1-2 eventi mattutini casuali |

### school-structured-events.ts

Eventi contestuali in aula e builder per prove programmate strutturate.

| Export | Firma | Descrizione |
| --- | --- | --- |
| `ContextualSchoolEvent` | `interface` | Estende `SchoolMorningEvent` con filtri `subjectFilter`, `severityRange`, `relationRange` |
| `StructuredScheduledExam` | `interface` | Estende `ScheduledExam` con `title`, `description` e `type?: 'scritto' | 'orale'` |
| `createScheduledWrittenExam` | `(subject, difficulty, daysUntil) → StructuredScheduledExam` | Builder per compiti scritti programmati |
| `createScheduledOralExam` | `(subject, difficulty, daysUntil) → StructuredScheduledExam` | Builder per interrogazioni orali programmate |
| `STRUCTURED_SCHEDULED_EXAMS` | `StructuredScheduledExam[]` | Pool di esempi strutturati, inclusi Storia, Italiano e Scienze orali |
| `getContextualEvents` | `(subjectKey, teacherSeverita, teacherRelazione) → ContextualSchoolEvent[]` | Filtra il pool contestuale della mattinata scolastica sequenziale |

---

### street-morning-events.ts

Eventi narrativi mattutini per la scelta di non andare a scuola (es. "marinare").

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `drawStreetMorningEvents` | `(stats: GameStats, count?: number) → SchoolMorningEvent[]` | Pesca eventi mattutini dal pool strada/marina (usa `MorningEventCategory`) |

---

### afternoon-events.ts

Eventi narrativi pomeridiani basati sulla location.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `getAfternoonEvent` | `(location: AfternoonLocation) → AfternoonEvent \| null` | Evento pomeridiano per location |

**Location:** `palestra`, `festa`, `sport`, `online`, `quartiere`, `lavoro`, `centro_commerciale`

---

### phase-actions.ts

Mappa delle azioni disponibili per fase giornata e tipo giorno.

**Costante principale:**

```typescript
const PHASE_ACTIONS: Record<DayType, Record<DayPhase, PhaseActionEntry[]>>
```

**Tipi di azione (`ActionId`):**

`palestra` · `lampada` · `lavoro` · `motorino` · `studia` · `corrompi` · `minaccia` · `riposa` · `dormi` · `disco` · `cinema` · `shopping` · `chiacchiera` · `parco` · `telefona` · `studia_gruppo`

**Azioni per fase:**

| Fase | Azioni Max | Note |
| --- | --- | --- |
| `mattina` | 3 | Azioni scolastiche + "Vai a scuola" nei feriali |
| `pomeriggio` | 3 | Azioni sociali, studio, lavoro |
| `sera` | 2 | Disco, cinema, relax |
| `notte` | 1 | Solo dormire |

---

### bet-system.ts

Sistema scommesse per gare motorini.

| Funzione | Firma | Descrizione |
| --- | --- | --- |
| `calculateBetAmount` | `(rep: number, difficulty: number) → number` | Formula: `10 + floor(rep/20)*5 + diff*5` (max 60€) |
| `generateStreetRace` | `(reputazione: number) → BetInfo` | Genera info gara con importo, avversario, difficoltà |
| `getDifficoltaText` | `(difficulty: number) → string` | 1=Facile, 2=Media, 3=Difficile, 4=Boss |

---

### sound-effects.ts

Effetti sonori sintetizzati via Web Audio API.

**Oggetto `playSound`:**

| Metodo | Frequenza | Descrizione |
| --- | --- | --- |
| `statIncrease()` | 400→800 Hz sweep | Aumento statistica |
| `statDecrease()` | 600→200 Hz sweep | Calo statistica |
| `bigWin()` | 523, 659, 783 Hz | Arpeggio vittoria |
| `bigLoss()` | Tono basso singolo | Sconfitta |
| `moneySpent()` | — | Spesa denaro |
| `moneyEarned()` | — | Guadagno denaro |
| `eventTrigger()` | — | Attivazione evento |
| `dangerAlert()` | — | Allarme pericolo |
| `success()` | — | Successo generico |
| `failure()` | — | Fallimento generico |
| `reputationUp()` | 3 note | Aumento livello reputazione |
| `gameOver()` | Tono discendente | Fine partita |
| `buttonClick()` | — | Click pulsante |
| `reset()` | — | Reset gioco |

Tutti i suoni: volume 0.1–0.3, durata 50–400 ms, nessun file esterno.

---

### data-validation.ts

Validazione e sanitizzazione di tutti i dati persistiti.

| Funzione | Argomento | Ritorno | Descrizione |
| --- | --- | --- | --- |
| `validateStats` | `unknown` | `GameStats` | Valida + clamp statistiche |
| `validateGrades` | `unknown, SchoolType` | `SubjectGrades` | Valida voti + default per indirizzo |
| `validateGameTime` | `unknown` | `GameTime` | Valida struttura tempo |
| `validateFriends` | `unknown` | `Friend[]` | Valida array amici + coercizione tipi |
| `validateRelationships` | `unknown` | `Relationship[]` | Valida array relazioni |
| `validateScheduledExams` | `unknown` | `ScheduledExam[]` | Valida array esami |
| `validateSchoolType` | `unknown` | `SchoolType \| null` | Valida enum indirizzo |
| `validatePlayerProfile` | `unknown` | `PlayerProfile \| null` | Valida profilo giocatore |

---

## Custom Hooks

### useGameStats

**File:** `src/hooks/useGameStats.ts`

Gestisce le 12 statistiche di gioco con calcolo automatico della reputazione.

```typescript
function useGameStats(announce: (msg: string) => void): {
  stats: GameStats;
  setStats: (updater: (prev: GameStats) => GameStats) => void;
}
```

**Comportamento:**
- Ricalcola `reputazione` automaticamente ad ogni modifica stat.
- Annuncia cambiamenti significativi (≥ 5 punti) e soglie critiche via `announce()`.
- Riproduce `playSound.reputationUp()` al cambio livello.

---

### useGameTime

**File:** `src/hooks/useGameTime.ts`

Gestisce data, fase giornata, azioni rimanenti e logica di avanzamento.

```typescript
function useGameTime(config: {
  grades: SubjectGrades;
  stats: GameStats;
  schoolType: SchoolType;
  setStats: Setter<GameStats>;
  announce: (msg: string) => void;
  // ... altri setter
}): {
  gameTime: GameTime;
  setGameTime: Setter<GameTime>;
  scheduledExams: ScheduledExam[];
  setScheduledExams: Setter<ScheduledExam[]>;
  currentPhase: DayPhase;
  dayType: DayType;
  phaseActionsRemaining: number;
  consumeAction: () => void;
  advanceToNextDay: () => void;
  advancePhaseOnly: () => void;
  gainExtraAction: () => void;
  handleDormi: () => void;
}
```

**Funzionalità chiave:**
- Avanzamento giorno/fase con regole calendario.
- Tracking assenze (marina la scuola → -0.2 condotta).
- Trigger pagella automatico al 10 giugno.
- Promozione/bocciatura con reset appropriato.
- Distribuzione paghetta.
- Generazione esami programmati (30% chance/giorno, max 3).

---

### useGameActions

**File:** `src/hooks/useGameActions.ts`

Facciata/orchestratore delle azioni di gioco: compone i sotto-hook tematici (`useEconomyActions`, `useStudyActions`, `useSocialActions`, `useGirlfriendActions`, `useLifestyleActions`) ed espone un contratto pubblico stabile verso `App.tsx`.

```typescript
function useGameActions(config: {
  stats: GameStats;
  grades: SubjectGrades;
  friends: Friend[];
  // ... dependencies
}): {
  handlePalestra: () => void;       // +Muscoli, -Soldi, +Stanchezza
  handleStudia: (subject?: string) => void;  // +Media(soggetto), +Intelligenza
  handleLavoro: () => void;         // +Soldi, +Stanchezza
  handleMotorino: () => void;       // +Figosità, eventi random
  handleCorrompi: () => void;       // Dialog selezione professore
  handleMinaccia: () => void;       // Dialog selezione professore
  handleDisco: () => void;          // Social, nuovi amici
  handleCinema: () => void;         // +Morale, relax
  handleShopping: () => void;       // -Soldi, +Figosità
  handleLampada: () => void;        // +Coattaggine
  handleRiposa: () => void;         // -25/35% Stanchezza
  handleChiacchiera: () => void;    // Social leggero
  handleParco: () => void;          // Relax all'aperto
  handleTelefona: () => void;       // Contatta amici
  handleStudiaGruppo: () => void;   // Studio con bonus amico
  availableActions: PhaseActionEntry[];
  getHandlerForAction: (id: ActionId) => (() => void) | undefined;
}
```

`availableActions` deriva da `getAvailableActions()` in `src/lib/phase-actions.ts`, mentre `getHandlerForAction()` instrada gli `ActionId` verso l'handler effettivo esposto dai sotto-hook.

**Pattern comune:** Ogni handler → `consumeAction()` → calcolo logica pura → `setStats()` → `addLogEntry()` → `triggerRandomEvent()` → `announce()`

---

### useEventEngine

**File:** `src/hooks/useEventEngine.ts`

Motore per la generazione e risoluzione di eventi casuali.

```typescript
function useEventEngine(config: {
  stats: GameStats;
  friends: Friend[];
  // ... dependencies
}): {
  triggerRandomEvent: () => void;
  checkForNewFriend: (location: string) => void;
  checkForNewRelationship: () => void;
  checkForNewGirlfriend: () => void;
  handleMetallariEvent: () => void;
  handlePoliceEvent: () => void;
  handleStreetRaceEvent: () => void;
  handleBulliEvent: () => void;
  // ... state setters per dialog eventi
}
```

**Eventi casuali (36% probabilità base, modificata da reputazione):**

| Evento | Chance Base | Auto-risoluzione |
| --- | --- | --- |
| Metallari | 12% | Alta Reputazione → ti salutano |
| Polizia | 10% | Leggenda → ti lasciano andare |
| Gara Motorini | 8% | Da scommesse dinamiche |
| Bulli | 6% | Rispettato+ → scappano |

---

### useGameRelations

**File:** `src/hooks/useGameRelations.ts`

Sistema di interazioni relazionali a 4 assi.

```typescript
function useGameRelations(config: {
  friends: Friend[];
  setFriends: Setter<Friend[]>;
  stats: GameStats;
  setStats: Setter<GameStats>;
  gameDate: GameDate;
  announce: (msg: string) => void;
}): {
  doInteraction: (friendId: string, interactionId: string) => DoInteractionResult;
}
```

**`DoInteractionResult`:**

```typescript
interface DoInteractionResult {
  success: boolean;
  message: string;
  newTierLabel?: string;    // Se il tier relazionale è cambiato
}
```

**Flusso `doInteraction`:**
1. Trova amico per `friendId`.
2. Trova interazione nel `INTERACTION_CATALOG` per `interactionId`.
3. Verifica `checkInteractionAvailable(rel, interaction)`.
4. Calcola successo/fallimento (se `failChance > 0`).
5. Applica `effects` o `failEffects` alla relazione.
6. Aggiorna `lastInteractionDay`.
7. Ritorna risultato con eventuale cambio tier.

---

### useHealthSystem

**File:** `src/hooks/useHealthSystem.ts`

Sistema di condizioni di salute e status effect.

```typescript
function useHealthSystem(config: {
  stats: GameStats;
  setStats: Setter<GameStats>;
  playerGender: string;
  addLogEntry: LogAdder;
}): {
  healthRecord: HealthRecord;
  setHealthRecord: Setter<HealthRecord>;
  applyCondition: (id: HealthConditionId, date: GameDate, phase: DayPhase) => void;
  tickConditions: (date: GameDate) => void;
  checkAutoConditions: (date: GameDate, phase: DayPhase) => void;
  canAttendSchool: () => boolean;
}
```

**Condizioni disponibili:**

| ID | Durata | Gender | Effetto principale |
| --- | --- | --- | --- |
| `ciclo_doloroso` | 3-5 gg | Femmina | -Salute, +Stress |
| `influenza` | 5-7 gg | Tutti | -Salute, no scuola |
| `intossicazione` | 2-3 gg | Tutti | -Salute, -Morale |
| `infortunio` | 7-14 gg | Tutti | -Muscoli, -Salute |
| `tossicchiella` | 3 gg | Tutti | Lieve -Salute |
| `pancia_gonfia` | 1-2 gg | Tutti | -Morale |
| `sfogo_acne` | 5-10 gg | Tutti | -Figosità |
| `herpes_labiale` | 7 gg | Tutti | -Figosità, -Carisma |

---

### useGameLog

**File:** `src/hooks/useGameLog.ts`

Diario giornaliero con entry strutturate.

```typescript
function useGameLog(): {
  gameLog: GameLogEntry[];
  addLogEntry: (
    type: 'azione' | 'evento' | 'ripercussione' | 'risultato',
    title: string,
    description: string,
    result: 'successo' | 'fallimento' | 'neutro',
    date: GameDate,
    phase: DayPhaseLabel
  ) => void;
  clearLog: () => void;
}
```

**Limite:** max 50 entry (FIFO — le più vecchie vengono scartate).

---

### useAppDialogs

**File:** `src/hooks/useAppDialogs.ts`

Gestione centralizzata dello stato di tutti i dialog modali.

```typescript
function useAppDialogs(): {
  gameOver: boolean;                setGameOver: Setter<boolean>;
  gameOverReason: string;           setGameOverReason: Setter<string>;
  showResetDialog: boolean;         setShowResetDialog: Setter<boolean>;
  showReportCard: boolean;          setShowReportCard: Setter<boolean>;
  reportCardPassed: boolean;        setReportCardPassed: Setter<boolean>;
  gameWon: boolean;                 setGameWon: Setter<boolean>;
  schoolEvent: SchoolEvent | null;  setSchoolEvent: Setter<SchoolEvent | null>;
  showSchoolEvent: boolean;         setShowSchoolEvent: Setter<boolean>;
  showKeyboardHelp: boolean;        setShowKeyboardHelp: Setter<boolean>;
  showSubjectDialog: boolean;       setShowSubjectDialog: Setter<boolean>;
  showTeacherDialog: boolean;       setShowTeacherDialog: Setter<boolean>;
  teacherActionType: 'corrompi' | 'minaccia';
  setTeacherActionType: Setter<'corrompi' | 'minaccia'>;
  schoolMorningEvents: SchoolMorningEvent[];
  setSchoolMorningEvents: Setter<SchoolMorningEvent[]>;
  streetMorningEvents: SchoolMorningEvent[];
  setStreetMorningEvents: Setter<SchoolMorningEvent[]>;
  morningDisplay: 'school' | 'street' | null;
  setMorningDisplay: Setter<'school' | 'street' | null>;
  showJobSelectionDialog: boolean;
  setShowJobSelectionDialog: Setter<boolean>;
  availableJobsForDialog: JobDefinition[];
  setAvailableJobsForDialog: Setter<JobDefinition[]>;
}
```

Note:
- `morningDisplay` sostituisce i precedenti boolean `showSchoolMorning` e `showStreetMorning` come singola source of truth per il rendering mattutino.
- Lo stato del job dialog viene usato dal flusso lavoro part-time per aprire `JobSelectionDialog` con il pool già filtrato di lavori disponibili.

---

### useKeyboardShortcuts

**File:** `src/hooks/useKeyboardShortcuts.ts`

Scorciatoie da tastiera per accessibilità e navigazione rapida.

**Binding predefiniti:**

| Scorciatoia | Azione |
| --- | --- |
| `?` | Mostra dialog aiuto scorciatoie |
| `Ctrl+R` | Mostra dialog reset gioco |
| `Ctrl+1` – `Ctrl+8` | Cambia tab principale |
| `Space` | Esegui azione corrente |
| `Escape` | Chiudi dialog aperto |

---

## Costanti di Configurazione

### Stato Iniziale di Default

```typescript
const DEFAULT_GAME_STATE = {
  stats: {
    muscoli: 50,
    coattaggine: 50,
    soldi: 100,
    media: 6,
    stanchezza: 0,
    stress: 20,
    morale: 70,
    figosita: 50,
    reputazione: 50,
    intelligenza: 10,
    carisma: 10,
    salute: 100,
  },
  grades: { matematica: 6, italiano: 6, /* ... */ },
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2026 },
    schoolYear: { year: 1, startDate: { day: 15, month: 9, year: 2026 } },
    age: 14,
    // ...
  },
};
```

### Livelli di Reputazione

| Range | Label | Effetto |
| --- | --- | --- |
| 0–19 | Sfigato Totale | Eventi negativi +50% |
| 20–39 | Nessuno | Nessun modificatore |
| 40–59 | Coatto Base | Bonus leggeri |
| 60–79 | Rispettato | Bulli/Metallari auto-risolti |
| 80–100 | Leggenda del Quartiere | Quasi tutti gli eventi auto-risolti |

### Formula Reputazione

```
Reputazione = Coattaggine × 30%
            + Muscoli × 20%
            + Figosità × 25%
            + Soldi × 15%
            + Media Scolastica × 10%
```
