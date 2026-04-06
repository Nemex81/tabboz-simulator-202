# Piano Tecnico Implementativo — Sistema Materie Scolastiche Dinamico

> **Versione**: 1.3 — _riduzione volume dati (V10): 6×10 materie, range semplificati_  
> **Data**: 2026-04-06  
> **Stato**: ✅ Rivalidato — pronto per implementazione  
> **Ambientazione**: Roma, sistema scolastico italiano reale

---

## Risultato Validazione

| # | Problema rilevato | Gravità | Risoluzione |
|---|-------------------|---------|-------------|
| V1 | `liceo` esiste in `types.ts` ma è già rotto (`validateSchoolType` lo ignora, `SchoolSelection` non lo mostra) — mancava la strategia di migrazione `liceo → liceoScientifico` | 🔴 Critico | Aggiunta Fase 0 — Pre-migrazione |
| V2 | `calculateGPA` non esiste — la funzione si chiama `calculateWeightedMedia` in `game-utils.ts` | 🔴 Critico | Corretta nomenclatura in Fase 2 |
| V3 | `GradeProgressPanel` non esiste nel workspace — va creato, non aggiornato | 🔴 Critico | Spostato come nuovo componente in Fase 3 |
| V4 | `validateSchoolType` in `data-validation.ts` non menzionato — non copre i 6 nuovi valori | 🔴 Critico | Aggiunto in Fase 1 |
| V5 | `COMMON_SUBJECTS` e `SPECIFIC_SUBJECTS` non devono stare in `types.ts` (file di tipi puri) | 🔴 Critico | Spostati in nuovo file `src/lib/subjects.ts` |
| V6 | `gradesHistory` menzionato solo nelle Considerazioni, assente dalle fasi implementative | 🟡 Moderato | Aggiunto in Fase 1 — `GameState` |
| V7 | `DEFAULT_GAME_STATE.grades` (7 materie fisse) diventa obsoleto senza strategia | 🟡 Moderato | Aggiunto in Fase 1 — aggiornamento `DEFAULT_GAME_STATE` |
| V8 | Tab "Scuola/Voti" di `CharacterSheet` non esiste | 🟡 Moderato | Aggiunto come nuovo tab in Fase 3 |
| V9 | `getSchoolTypeName` non aggiornato per `conservatorio` e `alberghiero` | 🟡 Moderato | Aggiunto in Fase 0 |
| N1 | `gradesHistory` non gestito nel KV store di `App.tsx` — mancavano dichiarazione `useKV`, reset in `handleReset`, passaggio a `CharacterSheet` | 🔴 Critico | Aggiunto in Fase 5 |
| N2 | La generazione degli esami avviene in `useGameTime.ts` (riga ~299, `Object.keys(gradesRef.current)`), non in `ExamsPanel` — il piano modificava il punto sbagliato | 🔴 Critico | Fase 5 aggiornata: modifica spostata in `useGameTime.ts` |
| N3 | `useGameTime.ts` non era elencato nei file coinvolti | 🟡 Moderato | Aggiunto a File Coinvolti |
| N4 | `handleReset` in `App.tsx` non resettava `gradesHistory` | 🟡 Moderato | Aggiunto in Fase 5 |
| N5 | `calculateWeightedMedia` ha consumer multipli — va verificata la stabilità dell'interfaccia pre/post migrazione | 🟢 Basso | Nota aggiunta in Fase 2 |
| N6 | `SUBJECT_WEIGHTS` ha più consumer — la deprecazione deve avvenire dopo migrazione di tutti i consumer | 🟡 Moderato | Ordine migrazione esplicitato in Fase 2 |
| N7 | `data-validation.ts` appariva sia in Fase 0 (`validateSchoolType`) che in Fase 3 (`validateGrades`) senza distinzione — ambiguità nella numerazione | 🟢 Basso | Fase 3 rietichettata con scope esplicito |
| N8 | `SubjectGrades` è già `Record<string, number>` — la retrocompatibilità KV è garantita senza migrazione; non evidenziato nel piano | 🟢 Basso | Aggiunto in Considerazioni Tecniche |
| V10 | 163 materie specifiche producono `subjects.ts` ~1360 righe non gestibile in modalità agente | 🔴 Critico | Riduzione a 10 materie per istituto; range ammessi: solo `1→2`, `3→5`, `1→5` |

---

## Obiettivo

Sostituire il sistema statico di materie (lista fissa per istituto) con un sistema
**dinamico e per anno scolastico**: ogni anno il giocatore vede un sottoinsieme
coerente di materie, alcune delle quali entrano ed escono in base all'anno frequentato.

Questo permette di modellare fedelmente i 5 anni di scuola superiore italiana con
circa 10-14 materie attive per anno, che si evolvono nel tempo.

---

## File Coinvolti

| File | Tipo intervento |
|------|----------------|
| `src/lib/types.ts` | Modifica tipi + interfacce |
| `src/lib/subjects.ts` | **Nuovo file** — costanti dati |
| `src/lib/game-utils.ts` | Modifica funzioni di calcolo |
| `src/lib/data-validation.ts` | Modifica validatore |
| `src/hooks/useGameTime.ts` | Modifica — sorgente materie per `generateScheduledExam` |
| `src/components/SchoolSelection.tsx` | Modifica UI — aggiunte 3 scuole |
| `src/components/ExamsPanel.tsx` | Nessuna modifica logica — solo presentazione |
| `src/components/CharacterSheet.tsx` | Modifica — nuovo tab Scuola/Voti |
| `src/components/GradeProgressPanel.tsx` | **Nuovo componente** |

---

## Indirizzi Scolastici Supportati (6)

```ts
export type SchoolType =
  | 'tecnico'          // Istituto Tecnico Informatico
  | 'agraria'          // Istituto Tecnico Agrario
  | 'artistico'        // Istituto d'Arte / Liceo Artistico
  | 'conservatorio'    // Liceo Musicale
  | 'alberghiero'      // Istituto Professionale Alberghiero (es. Artusi Roma)
  | 'liceoScientifico' // Liceo Scientifico
```

---

## Struttura Dati — `SubjectDefinition`

```ts
export interface SubjectDefinition {
  key: string                    // identificatore univoco (snake_case)
  displayName: string            // nome visualizzato in UI
  weight: number                 // peso sulla media (0.0 = non fa media)
  fromYear: number               // anno in cui compare (1-5)
  toYear: number                 // ultimo anno in cui è presente (1-5)
  isCommon: boolean              // true = presente in TUTTI gli istituti
  countsForGPA: boolean          // false per religione e PCTO/stage
  weeklyHours?: number           // ore settimanali (opzionale)
  weightBySchoolType?: Partial<Record<SchoolType, number>>
  // override del peso per istituto specifico (usato per materie comuni
  // con peso diverso tra indirizzi, es. matematica o fisica)
}
```

---

## Funzione Principale

```ts
// Unico punto di verità per tutta l'app — sostituisce getDefaultGradesForSchoolType
export function getActiveSubjectsForYear(
  schoolType: SchoolType,
  schoolYear: number   // 1-5
): SubjectDefinition[] {
  const specific = SPECIFIC_SUBJECTS[schoolType]
    .filter(s => schoolYear >= s.fromYear && schoolYear <= s.toYear)
  const common = COMMON_SUBJECTS
    // fisica comune solo anni 1-2; dal 3° in poi solo come specifica del liceo
    .filter(s => schoolYear >= s.fromYear && schoolYear <= s.toYear)
  return [...common, ...specific]
}

// Wrapper retrocompatibile (usato da codice esistente che non conosce l'anno)
export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  return Object.fromEntries(
    getActiveSubjectsForYear(schoolType, 1)
      .filter(s => s.countsForGPA)
      .map(s => [s.key, 6])
  )
}
```

---

## Materie Comuni a Tutti gli Istituti (7)

> Presenti ogni anno in tutti e 6 gli indirizzi.
> `fisica` è comune solo per gli anni 1-2; dal 3° anno diventa specifica del liceo.

| Key | Nome | Peso | Anni | Note |
|-----|------|------|------|------|
| `italiano` | Lingua e Letteratura Italiana | 1.3 | 1→5 | 4h/sett |
| `storia` | Storia | 1.0 | 1→5 | |
| `inglese` | Lingua Inglese | 1.1 | 1→5 | |
| `matematica` | Matematica | 1.2 | 1→5 | peso override per istituto |
| `edFisica` | Scienze Motorie e Sportive | 0.7 | 1→5 | |
| `religione` | Religione / Attività Alternative | 0.0 | 1→5 | non fa media |
| `fisica` | Fisica | 1.0 | 1→2 | comune solo biennio; poi specifica |

### Override peso `matematica` per istituto

| Istituto | Peso |
|----------|------|
| liceoScientifico | 1.5 |
| tecnico | 1.3 |
| agraria | 1.1 |
| artistico | 0.9 |
| conservatorio | 0.9 |
| alberghiero | 1.0 |

### Override peso `fisica` per istituto (anni 1-2)

| Istituto | Peso |
|----------|------|
| liceoScientifico | 1.1 |
| tecnico | 1.1 |
| agraria | 0.9 |
| artistico | 0.8 |
| conservatorio | 0.7 |
| alberghiero | 0.8 |

---

## Materie Specifiche per Istituto

### 🖥️ Istituto Tecnico Informatico (10 materie specifiche)

| Key | Nome | Anni | Peso |
|-----|------|------|------|
| `diritto` | Diritto ed Economia | 1→2 | 0.8 |
| `scienzeInt` | Scienze Integrate | 1→2 | 1.0 |
| `chimicaInt` | Chimica Integrata | 1→2 | 1.0 |
| `tecnInfo` | Tecnologie Informatiche | 1→2 | 1.2 |
| `informatica` | Informatica | 3→5 | 1.6 |
| `sistemi` | Sistemi e Reti | 3→5 | 1.5 |
| `tpsit` | TPSIT | 3→5 | 1.4 |
| `linguaggio` | Linguaggi di Programmazione | 3→5 | 1.4 |
| `basiDati` | Basi di Dati | 3→5 | 1.3 |
| `webDev` | Sviluppo Web e Sicurezza | 3→5 | 1.2 |

---

### 🌾 Istituto Agrario (10 materie specifiche)

| Key | Nome | Anni | Peso |
|-----|------|------|------|
| `diritto` | Diritto ed Economia | 1→2 | 0.8 |
| `scienzeInt` | Scienze Integrate Bio+Terra | 1→2 | 1.1 |
| `chimicaInt` | Chimica Integrata | 1→2 | 1.0 |
| `pedologia` | Pedologia e Chimica del Suolo | 1→2 | 0.9 |
| `agronomia` | Agronomia Territoriale | 3→5 | 1.4 |
| `zootecnia` | Zootecnia | 3→5 | 1.2 |
| `chimicaAgraria` | Chimica Agraria e Agroindustria | 3→5 | 1.4 |
| `economiaAgraria` | Economia Agraria | 3→5 | 1.3 |
| `biologia` | Biologia Applicata | 3→5 | 1.3 |
| `ambienteRurale` | Gestione Ambiente Rurale | 3→5 | 1.1 |

---

### 🎨 Istituto d'Arte / Liceo Artistico (10 materie specifiche)

| Key | Nome | Anni | Peso |
|-----|------|------|------|
| `storiaArte` | Storia dell'Arte | 1→5 | 1.3 |
| `disegnoGeo` | Disegno Geometrico e Proiettivo | 1→2 | 1.0 |
| `disegnoArtist` | Disegno Artistico | 1→2 | 1.1 |
| `laboratorioPit` | Laboratorio Pittura | 1→2 | 1.0 |
| `chimicaInt` | Chimica dei Materiali | 1→2 | 0.9 |
| `filosofia` | Filosofia | 3→5 | 1.1 |
| `progettazioneArt` | Progettazione Artistica | 3→5 | 1.5 |
| `laboratorioProg` | Laboratorio di Indirizzo | 3→5 | 1.4 |
| `discipline` | Discipline Plastiche e Scultoree | 3→5 | 1.3 |
| `stageCulturale` | Stage Culturale (PCTO) | 3→5 | 0.0 |

---

### 🎵 Liceo Musicale / Conservatorio (10 materie specifiche)

| Key | Nome | Anni | Peso |
|-----|------|------|------|
| `strumento` | Esecuzione e Interpretazione | 1→5 | 2.0 |
| `teoriaMusicale` | Teoria, Analisi e Composizione | 1→5 | 1.5 |
| `storiaMusica` | Storia della Musica | 1→5 | 1.3 |
| `musicaInsieme` | Musica d'Insieme | 1→5 | 1.2 |
| `tecnologieMusic` | Tecnologie Musicali | 1→5 | 1.0 |
| `solfeggio` | Lettura, Solfeggio e Dettato | 1→2 | 1.2 |
| `scienze` | Scienze Naturali | 1→2 | 0.9 |
| `filosofia` | Filosofia | 3→5 | 1.1 |
| `armonia` | Armonia e Contrappunto | 3→5 | 1.4 |
| `stageMusica` | Stage Artistico (PCTO) | 3→5 | 0.0 |

---

### 🍽️ Istituto Alberghiero (10 materie specifiche)

| Key | Nome | Anni | Peso |
|-----|------|------|------|
| `secondaLingua` | Seconda Lingua Straniera | 1→5 | 1.2 |
| `scienzeAlim` | Scienze degli Alimenti | 1→5 | 1.3 |
| `laboratorioCucina` | Lab. Servizi Enogastronomici — Cucina | 1→5 | 1.5 |
| `laboratorioSala` | Lab. Servizi Sala e Vendita | 1→5 | 1.4 |
| `diritto` | Diritto ed Economia | 1→2 | 0.8 |
| `scienzeInt` | Scienze Integrate Bio+Terra | 1→2 | 1.0 |
| `chimicaInt` | Chimica e Laboratorio | 1→2 | 1.0 |
| `alimentazione` | Scienza e Cultura dell'Alimentazione | 3→5 | 1.3 |
| `enologia` | Enologia e Cultura del Vino | 3→5 | 1.3 |
| `stageAlberghiero` | Stage Alberghiero (PCTO) | 3→5 | 0.0 |

---

### 🔬 Liceo Scientifico (10 materie specifiche)

| Key | Nome | Anni | Peso |
|-----|------|------|------|
| `scienze` | Scienze Naturali (Bio+Chim+Terra) | 1→5 | 1.2 |
| `latino` | Latino | 1→5 | 1.2 |
| `geostoria` | Storia e Geografia | 1→2 | 0.9 |
| `disegnoST` | Disegno e Storia dell'Arte | 1→2 | 0.8 |
| `informaticaLiceo` | Informatica | 1→2 | 0.9 |
| `filosofia` | Filosofia | 3→5 | 1.2 |
| `fisicaAvanzata` | Fisica (triennio avanzato) | 3→5 | 1.4 |
| `chimicaOrg` | Chimica Organica e Biochimica | 3→5 | 1.2 |
| `laboratorioSci` | Laboratorio Scientifico | 3→5 | 1.0 |
| `alternanzaSci` | PCTO Scientifico | 3→5 | 0.0 |

---

## Piano di Implementazione — 5 Fasi

> Le fasi sono **sequenziali**: ogni fase dipende dalla precedente.  
> Spunta ogni checkbox `- [x]` al completamento dell'attività.

---

### Fase 0 — Pre-migrazione `liceo → liceoScientifico`

> ⚠️ Il tipo `liceo` esiste già nel codice ma è **già non funzionante** (`validateSchoolType` lo scarta, `SchoolSelection` non lo mostra). Va rimosso/rinominato prima di procedere.

**File: `src/lib/types.ts`**
- [ ] Rinominare valore `'liceo'` → `'liceoScientifico'` nel tipo `SchoolType` (rimuovere anche il duplicato `'tecnico'`)
- [ ] Nella costante `SUBJECT_WEIGHTS`: rinominare la chiave `liceo` → `liceoScientifico` e aggiungere le chiavi mancanti `conservatorio` e `alberghiero` (come placeholder con pesi identici a `artistico` fino a Fase 1)
- [ ] In `getDefaultGradesForSchoolType`: rinominare il `case 'liceo'` → `case 'liceoScientifico'`; aggiungere `case 'conservatorio'` e `case 'alberghiero'` come fallback su `tecnico`
- [ ] In `getSchoolTypeName`: aggiornare il `Record<SchoolType, string>` con tutti e 6 i valori:
  ```ts
  liceoScientifico: 'Liceo Scientifico',
  tecnico:          'Istituto Tecnico Informatico',
  agraria:          'Istituto Tecnico Agrario',
  artistico:        'Liceo Artistico',
  conservatorio:    'Liceo Musicale',
  alberghiero:      'Istituto Alberghiero',
  ```

**File: `src/lib/data-validation.ts` — funzione `validateSchoolType`**
- [ ] Aggiornare il guard per accettare tutti e 6 i valori validi:
  ```ts
  const VALID_SCHOOL_TYPES = ['tecnico','agraria','artistico','conservatorio','alberghiero','liceoScientifico'] as const
  if (VALID_SCHOOL_TYPES.includes(schoolType as SchoolType)) return schoolType as SchoolType
  ```

**Verifica Fase 0**
- [ ] `tsc --noEmit` senza errori su `types.ts` e `data-validation.ts`

---

### Fase 1 — Nuovo file `src/lib/subjects.ts` + aggiornamento `types.ts`

> Creare un file dedicato per i dati (materie), separando i tipi dalla logica di business.

**File nuovo: `src/lib/subjects.ts`**
- [ ] Importare `SchoolType` da `@/lib/types`
- [ ] Aggiungere interfaccia `SubjectDefinition` (come da spec):
  ```ts
  export interface SubjectDefinition {
    key: string
    displayName: string
    weight: number
    fromYear: number
    toYear: number
    isCommon: boolean
    countsForGPA: boolean
    weeklyHours?: number
    weightBySchoolType?: Partial<Record<SchoolType, number>>
  }
  ```
- [ ] Definire e esportare `COMMON_SUBJECTS: SubjectDefinition[]` (7 materie con override peso per `matematica` e `fisica`)
- [ ] Definire e esportare `SPECIFIC_SUBJECTS: Record<SchoolType, SubjectDefinition[]>` con tutte le materie per i 6 indirizzi (dati dalle tabelle di questo documento)
- [ ] Aggiungere e esportare funzione `getActiveSubjectsForYear(schoolType: SchoolType, schoolYear: number): SubjectDefinition[]`
- [ ] Aggiungere e esportare funzione `getGradeWeight(subject: SubjectDefinition, schoolType: SchoolType): number` — risolve `weightBySchoolType[schoolType] ?? weight`

**File: `src/lib/types.ts`**
- [ ] Spostare interfaccia `SubjectDefinition` → `src/lib/subjects.ts` (aggiungere re-export `export type { SubjectDefinition } from '@/lib/subjects'` per retrocompatibilità se importata altrove)
- [ ] Aggiornare `getDefaultGradesForSchoolType` come wrapper retrocompatibile:
  ```ts
  import { getActiveSubjectsForYear } from '@/lib/subjects'
  export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
    return Object.fromEntries(
      getActiveSubjectsForYear(schoolType, 1)
        .filter(s => s.countsForGPA)
        .map(s => [s.key, 6])
    )
  }
  ```
- [ ] Aggiornare `getSubjectDisplayName` per delegare a `COMMON_SUBJECTS` + `SPECIFIC_SUBJECTS` per il display name, con fallback al key formattato
- [ ] Deprecare `SUBJECT_WEIGHTS` — aggiungere commento `/** @deprecated usare getGradeWeight() da subjects.ts */` (non rimuovere fino a Fase 2)
- [ ] Aggiungere campo `gradesHistory: Record<number, SubjectGrades>` all'interfaccia `GameState`
- [ ] Aggiornare `DEFAULT_GAME_STATE` — `grades` diventa il risultato di `getDefaultGradesForSchoolType('tecnico')` (default tecnico come da Fase 0)

**Verifica Fase 1**
- [ ] `tsc --noEmit` senza errori su tutti i file modificati
- [ ] `getDefaultGradesForSchoolType('tecnico')` restituisce esattamente le materie year=1 filtrate per `countsForGPA`
- [ ] `getActiveSubjectsForYear('liceoScientifico', 3)` include `fisicaAvanzata` ma non `fisica` (che esce anno 2)

---

### Fase 2 — `src/lib/game-utils.ts`

**Funzioni nuove**
- [ ] Aggiungere `getGPASubjectsForYear(schoolType: SchoolType, year: number): SubjectDefinition[]` — shortcut che filtra `getActiveSubjectsForYear` per `countsForGPA: true`
- [ ] Aggiungere `archiveYearGrades(grades: SubjectGrades, schoolType: SchoolType, fromYear: number): { archived: SubjectGrades; next: SubjectGrades }` — separa i voti delle materie uscenti (archived) da quelli delle materie che continuano nell'anno successivo (next)

**Funzioni aggiornate**
- [ ] Aggiornare `calculateWeightedMedia` per usare `getGradeWeight()` da `subjects.ts` invece di `SUBJECT_WEIGHTS` — nuovo import: `import { getGradeWeight, getActiveSubjectsForYear } from '@/lib/subjects'`
- [ ] Rimuovere import `SUBJECT_WEIGHTS` da `game-utils.ts` dopo l'aggiornamento

> ⚠️ **N5/N6 — Ordine migrazione consumer**: prima di rimuovere `SUBJECT_WEIGHTS` da `types.ts` verificare che tutti i consumer abbiano migrato. Consumer diretti attivi: solo `calculateWeightedMedia` in `game-utils.ts`. `App.tsx` e `CharacterSheet.tsx` chiamano `calculateWeightedMedia` ma non importano `SUBJECT_WEIGHTS` direttamente — la loro interfaccia non cambia.

**Verifica Fase 2**
- [ ] `calculateWeightedMedia` produce lo stesso risultato di prima per `tecnico`, `agraria`, `artistico` con le materie esistenti (test con valori noti)
- [ ] Nessun import diretto di `SUBJECT_WEIGHTS` rimasto fuori da `types.ts`
- [ ] `tsc --noEmit` senza errori

---

### Fase 3 — `src/lib/data-validation.ts` — funzione `validateGrades`

> `validateSchoolType` è già stato aggiornato in Fase 0. Questa fase copre **solo** `validateGrades` (N7).

- [ ] Aggiornare `validateGrades` — quando `schoolType` è fornito, usare `getDefaultGradesForSchoolType(schoolType)` come baseline per le chiavi attese, invece della lista hardcoded a 4 materie (`matematica`, `italiano`, `storia`, `edFisica`)

**Verifica Fase 3**
- [ ] `tsc --noEmit` senza errori
- [ ] `validateGrades(null, 'liceoScientifico')` restituisce i voti default del liceo scientifico year=1
- [ ] `validateGrades(null, 'alberghiero')` restituisce le materie alberghiero year=1
- [ ] `validateGrades(null, 'conservatorio')` restituisce le materie conservatorio year=1

---

### Fase 4 — Componenti UI

> Aggiornare i componenti esistenti e creare i nuovi. Ogni punto è indipendente dagli altri a parità di Fase 1-3 completate.

**`src/components/SchoolSelection.tsx`**
- [ ] Aggiungere 3 nuove card per `conservatorio`, `alberghiero`, `liceoScientifico` con icone appropriate (`MusicNote`, `ForkKnife`/`ChefHat`, `Atom` da `@phosphor-icons/react`)
- [ ] Aggiornare la griglia da `md:grid-cols-3` a `md:grid-cols-3 lg:grid-cols-3` con 2 righe (o `grid-cols-2 md:grid-cols-3`) per 6 card

**`src/components/ExamsPanel.tsx`**
- [ ] Nessuna modifica alla logica interna — `ExamsPanel` è un componente di sola presentazione che riceve `exams: ScheduledExam[]` già generati a monte (N2)
- [ ] _(La sorgente dei soggetti per la generazione esami è in `useGameTime.ts` — aggiornata in Fase 5)_

**`src/components/CharacterSheet.tsx`**
- [ ] Aggiungere tab **"Scuola"** (`value="scuola"`) alla `TabsList` (aggiornare `grid-cols-5` → `grid-cols-6`)
- [ ] Aggiungere `TabsContent` per il tab Scuola: lista materie attive per anno corrente con voto e peso, media pesata corrente, storico anni precedenti da `gradesHistory`
- [ ] Aggiungere props necessarie al componente: `grades: SubjectGrades` e `gradesHistory: Record<number, SubjectGrades>`

**`src/components/GradeProgressPanel.tsx` — Nuovo componente**
- [ ] Creare componente `GradeProgressPanel` che mostra:
  - Lista materie attive per anno corrente con barra progresso (voto/10)
  - Indicatore visivo per materie con `countsForGPA: false` (badge "Non fa media")
  - Media pesata corrente calcolata con `calculateWeightedMedia`
- [ ] Props: `grades: SubjectGrades`, `schoolType: SchoolType`, `schoolYear: number`

**Verifica Fase 4**
- [ ] Tutte le 6 scuole selezionabili in `SchoolSelection` senza errori TypeScript
- [ ] `ExamsPanel` mostra solo materie dell'anno corrente
- [ ] `CharacterSheet` mostra il tab Scuola con materie corrette per tipo/anno
- [ ] `GradeProgressPanel` renderizza senza crash per tutti e 6 i tipi di scuola

---

### Fase 5 — `src/hooks/useGameTime.ts` + `src/App.tsx`

> ⚠️ **N2/N3**: La generazione degli esami è in `useGameTime.ts` riga ~299:
> ```ts
> const subjects = Object.keys(gradesRef.current)
> const newExam = generateScheduledExam(subjects)
> ```
> Questa riga usa tutte le chiavi del KV grades (comprese materie di anni passati). Va sostituita con `getActiveSubjectsForYear`.

**File: `src/hooks/useGameTime.ts`**
- [ ] Aggiungere import `getActiveSubjectsForYear` da `@/lib/subjects`
- [ ] Sostituire `Object.keys(gradesRef.current)` con:
  ```ts
  getActiveSubjectsForYear(schoolType, gameTimeRef.current.schoolYear.currentYear)
    .filter(s => s.countsForGPA)
    .map(s => s.key)
  ```
  _(N.B.: `schoolType` è già un parametro del hook; `gameTimeRef.current` è già disponibile)_
- [ ] Al completamento anno scolastico (nella callback esistente che chiama `calculateNextSchoolYear`): richiamare `archiveYearGrades(gradesRef.current, schoolType, currentYear)` e propagare i due risultati (`archived`, `next`) tramite callback verso `App.tsx`

**File: `src/App.tsx`**
- [ ] Aggiungere KV store cronologia voti (N1):
  ```ts
  const [rawGradesHistory, setRawGradesHistory] = useKV<Record<number, SubjectGrades>>('tabboz-grades-history', {})
  ```
- [ ] In `handleSchoolSelection`: aggiungere `setRawGradesHistory({})` per azzerare la cronologia al primo avvio
- [ ] In `handleReset` (N4): aggiungere `setRawGradesHistory({})` accanto agli altri reset di stato
- [ ] Passare `gradesHistory={rawGradesHistory}` a `CharacterSheet` come prop
- [ ] Collegare la callback di `archiveYearGrades` a `setRawGradesHistory(prev => ({ ...prev, [archivedYear]: archived }))` e `setGrades(next)`
- [ ] Rimuovere `Passare schoolYear a ExamsPanel` — non necessario (ExamsPanel è solo presentazione)

**Verifica Fase 5**
- [ ] Nuovo gioco con `liceoScientifico`: anno 1 → materie corrette; passaggio ad anno 3 → `fisicaAvanzata` al posto di `fisica`
- [ ] `generateScheduledExam` non propone mai materie fuori dall'anno corrente
- [ ] `handleReset` azzera `gradesHistory` nel KV store
- [ ] `CharacterSheet` riceve e mostra `gradesHistory` nel tab Scuola
- [ ] `tsc --noEmit` senza errori sull'intero workspace
- [ ] Nessuna regressione nei test esistenti (se presenti)

---

---

## Considerazioni Tecniche

### Retrocompatibilità KV
Il salvataggio di `grades` nel KV store contiene le chiavi delle materie come stringhe.
Quando si passa all'anno successivo e alcune materie escono, i voti delle materie
archiviate restano nel KV ma non vengono più visualizzati. Il campo separato
`gradesHistory: Record<number, SubjectGrades>` (aggiunto in Fase 1) gestisce
l'archiviazione dei voti per anno tramite la funzione `archiveYearGrades` (Fase 2).

### Media Annuale vs Media Corrente
- **Media corrente**: calcolata solo sulle materie attive nell'anno in corso
- **Media storica**: media dei 5 anni (o degli anni completati) — da calcolare
  aggregando `gradesHistory`

### Gestione PCTO / Stage
Le materie con `countsForGPA: false` (stage, religione) vengono mostrate in UI
ma non influenzano la media. Il giocatore può comunque guadagnare reputazione
e eventi narrativi da queste attività.

### Priorità `weightBySchoolType`
La funzione `getGradeWeight(subject, schoolType)` usa la seguente logica:
```ts
return subject.weightBySchoolType?.[schoolType] ?? subject.weight
```
Il campo `weightBySchoolType` ha sempre precedenza sul `weight` base.

### `isCommon` — nota
Il campo `isCommon: boolean` in `SubjectDefinition` è descrittivo (utile per filtri futuri
e per la UI) ma non viene usato nella logica di `getActiveSubjectsForYear`, che
separa i dati strutturalmente in `COMMON_SUBJECTS` e `SPECIFIC_SUBJECTS`.

### Retrocompatibilità `SubjectGrades` (N8)
`SubjectGrades` è già definita come `Record<string, number>` (indice stringa generico).
Non è necessaria alcuna migrazione del KV store `'tabboz-grades'`: le nuove chiavi
(materie dinamiche) vengono scritte con il normale `setGrades(...)` senza breaking
change. I voti con chiavi non rilevanti per l'anno corrente restano nel KV ma vengono
semplicemente ignorati — non visualizzati, non inclusi nel calcolo della media.

---

## Note di Ambientazione

Il gioco è ambientato a **Roma** — gli istituti di riferimento per il curriculum sono:

- **Tecnico**: ITIS Enrico Fermi (Via Casilina), ITIS Galilei
- **Agraria**: Istituto Tecnico Agrario San Michele (Via Nomentana)
- **Artistico**: Liceo Artistico di Via Ripetta / Liceo Artistico Enzo Rossi
- **Liceo Musicale**: Liceo Musicale Anco Marzio / Santa Cecilia
- **Alberghiero**: IPSEOA Pellegrino Artusi (Via Ferrini)
- **Liceo Scientifico**: Liceo Scientifico Giulio Cesare / Liceo Pasteur
