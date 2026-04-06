# Piano Tecnico Implementativo — Sistema Materie Scolastiche Dinamico

> **Versione**: 1.1 — _revisione post-validazione_  
> **Data**: 2026-04-06  
> **Stato**: ✅ Validato con correzioni — pronto per implementazione  
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
| `src/components/SchoolSelection.tsx` | Modifica UI — aggiunte 3 scuole |
| `src/components/ExamsPanel.tsx` | Modifica — lista materie dinamica |
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

### 🖥️ Istituto Tecnico Informatico (28 materie specifiche)

| Key | Nome | Anni | Peso | Ore/sett |
|-----|------|------|------|----------|
| `diritto` | Diritto ed Economia | 1→2 | 0.8 | 2h |
| `scienzeInt` | Scienze Integrate Bio+Terra | 1→2 | 1.0 | 3h |
| `chimicaInt` | Chimica Integrata | 1→2 | 1.0 | 3h |
| `tecnRappres` | Tecnologie e Rappr. Grafica | 1→2 | 0.9 | 3h |
| `tecnInfo` | Tecnologie Informatiche | 1→1 | 1.2 | 3h |
| `scienzeAppl` | Scienze e Tecn. Applicate | 2→2 | 1.2 | 3h |
| `complementiMat` | Complementi di Matematica | 3→4 | 1.0 | 1h |
| `informatica` | Informatica | 3→5 | 1.6 | 6h |
| `sistemi` | Sistemi e Reti | 3→5 | 1.5 | 4h |
| `tpsit` | TPSIT | 3→5 | 1.4 | 4h |
| `elettronica` | Elettronica ed Elettrotecnica | 3→4 | 1.2 | 3h |
| `telecomunicazioni` | Telecomunicazioni | 3→4 | 1.1 | 3h |
| `sistemiOperativi` | Sistemi Operativi | 3→4 | 1.1 | 2h |
| `algoritmi` | Algoritmi e Strutture Dati | 3→4 | 1.3 | 3h |
| `linguaggio` | Linguaggi di Programmazione | 3→5 | 1.4 | 3h |
| `matematicaAppl` | Matematica Applicata | 3→5 | 1.1 | 2h |
| `labInformatica` | Laboratorio di Informatica | 3→5 | 1.0 | 2h |
| `basiDati` | Basi di Dati | 4→5 | 1.3 | 3h |
| `reti` | Reti di Calcolatori | 4→5 | 1.2 | 2h |
| `webDev` | Sviluppo Web | 4→5 | 1.2 | 3h |
| `sicurezzaReti` | Sicurezza Informatica | 4→5 | 1.3 | 2h |
| `cybersecurity` | Cybersecurity e Ethical Hacking | 4→5 | 1.3 | 2h |
| `gestioneProgetto` | Gestione Progetto e Organiz. | 5→5 | 1.2 | 3h |
| `progettazioneDB` | Progettazione DB Avanzata | 5→5 | 1.2 | 2h |
| `intelligenzaArt` | Intelligenza Artificiale | 5→5 | 1.1 | 2h |
| `tecnologieCloud` | Tecnologie Cloud e DevOps | 5→5 | 1.1 | 2h |
| `stageAziendale` | Stage Aziendale (PCTO) | 3→5 | 0.0 | — |
| `dirittoPCTO` | Diritto del Lavoro e Privacy | 5→5 | 0.9 | 1h |

---

### 🌾 Istituto Agrario (27 materie specifiche)

| Key | Nome | Anni | Peso | Ore/sett |
|-----|------|------|------|----------|
| `diritto` | Diritto ed Economia | 1→2 | 0.8 | 2h |
| `scienzeInt` | Scienze Integrate Bio+Terra | 1→2 | 1.1 | 3h |
| `chimicaInt` | Chimica Integrata | 1→2 | 1.0 | 3h |
| `pedologia` | Pedologia e Chimica del Suolo | 1→2 | 0.9 | 2h |
| `tecnRappres` | Tecnologie e Rappr. Grafica | 1→2 | 0.8 | 3h |
| `scienzeAppl` | Scienze e Tecn. Applicate | 2→2 | 1.1 | 3h |
| `complementiMat` | Complementi di Matematica | 3→4 | 1.0 | 1h |
| `biologia` | Biologia Applicata | 3→5 | 1.3 | 3h |
| `chimicaAgraria` | Chimica Agraria e Agroindustria | 3→5 | 1.4 | 4h |
| `agronomia` | Agronomia Territoriale | 3→5 | 1.4 | 4h |
| `zootecnia` | Zootecnia | 3→5 | 1.2 | 3h |
| `economiaAgraria` | Economia Agraria | 3→5 | 1.3 | 3h |
| `topografia` | Topografia | 3→4 | 1.0 | 2h |
| `botanica` | Botanica e Fitopatologia | 3→4 | 1.2 | 2h |
| `meccanicaAgr` | Meccanica Agraria | 3→4 | 1.0 | 2h |
| `orticoltura` | Orticoltura e Floricoltura | 3→4 | 1.0 | 2h |
| `entomologia` | Entomologia Agraria | 4→4 | 1.0 | 1h |
| `ambienteRurale` | Gestione Ambiente Rurale | 3→5 | 1.1 | 2h |
| `irrigazione` | Gestione Risorse Idriche | 4→5 | 1.0 | 2h |
| `industrie` | Industrie Agroalimentari | 4→5 | 1.2 | 3h |
| `viticultura` | Viticoltura ed Enologia | 4→5 | 1.1 | 2h |
| `valorizzazione` | Valorizzazione Attività Prod. | 4→5 | 1.1 | 2h |
| `genioBioedile` | Genio Rurale e Bioedilizia | 4→5 | 1.0 | 2h |
| `olivicoltura` | Olivicoltura e Oleicoltura | 5→5 | 1.0 | 1h |
| `marketing` | Marketing Agroalimentare | 5→5 | 1.1 | 2h |
| `legislazione` | Legislazione Agraria | 5→5 | 1.0 | 1h |
| `stageAgricolo` | Stage Agricolo (PCTO) | 3→5 | 0.0 | — |

---

### 🎨 Istituto d'Arte / Liceo Artistico (27 materie specifiche)

| Key | Nome | Anni | Peso | Ore/sett |
|-----|------|------|------|----------|
| `storiaArte` | Storia dell'Arte | 1→5 | 1.3 | 3h |
| `disegnoGeo` | Disegno Geometrico e Proiettivo | 1→2 | 1.0 | 2h |
| `disegnoArtist` | Disegno Artistico | 1→2 | 1.1 | 2h |
| `laboratorioPit` | Laboratorio Pittura | 1→2 | 1.0 | 3h |
| `laboratorioScult` | Laboratorio Scultura | 1→2 | 1.0 | 3h |
| `chimicaInt` | Chimica dei Materiali | 1→2 | 0.9 | 2h |
| `semiotica` | Semiotica e Linguaggi Visivi | 3→5 | 1.1 | 2h |
| `filosofia` | Filosofia | 3→5 | 1.1 | 2h |
| `progettazioneArt` | Progettazione Artistica | 3→5 | 1.5 | 6h |
| `laboratorioProg` | Laboratorio di Indirizzo | 3→5 | 1.4 | 6h |
| `discipline` | Discipline Plastiche e Scultoree | 3→5 | 1.3 | 4h |
| `graficaComm` | Grafica e Comunicazione Visiva | 3→5 | 1.2 | 3h |
| `design` | Design (Arredo / Moda / Orafo) | 3→5 | 1.3 | 3h |
| `fotografia` | Fotografia e Linguaggio Visivo | 3→5 | 1.1 | 2h |
| `colorimetria` | Colorimetria e Materiali | 3→4 | 1.0 | 2h |
| `anatomiaArt` | Anatomia Artistica | 3→4 | 1.0 | 2h |
| `prospettiva` | Prospettiva e Composizione | 3→4 | 1.1 | 2h |
| `computerArt` | Computer Art e Digital Media | 4→5 | 1.2 | 3h |
| `iconografia` | Iconografia e Iconologia | 4→5 | 1.0 | 1h |
| `restauro` | Tecniche di Restauro | 4→5 | 1.1 | 2h |
| `tecnicheIncisione` | Tecniche di Incisione e Stampa | 4→5 | 1.0 | 2h |
| `artContemporanea` | Arte Contemporanea | 4→5 | 1.1 | 2h |
| `estetica` | Estetica e Critica d'Arte | 5→5 | 1.0 | 2h |
| `portfolio` | Portfolio e Ricerca Personale | 5→5 | 1.2 | 2h |
| `artePublica` | Arte Pubblica e Installazione | 5→5 | 1.0 | 1h |
| `mostreEsibizioni` | Organizzazione Mostre ed Esibiz. | 5→5 | 0.9 | 1h |
| `stageCulturale` | Stage Culturale (PCTO) | 3→5 | 0.0 | — |

---

### 🎵 Liceo Musicale / Conservatorio (27 materie specifiche)

| Key | Nome | Anni | Peso | Ore/sett |
|-----|------|------|------|----------|
| `storiaArte` | Storia dell'Arte | 1→5 | 1.0 | 2h |
| `scienze` | Scienze Naturali | 1→2 | 0.9 | 2h |
| `filosofia` | Filosofia | 3→5 | 1.1 | 2h |
| `strumento` | Esecuzione e Interpretazione | 1→5 | 2.0 | 4h |
| `teoriaMusicale` | Teoria, Analisi e Composizione | 1→5 | 1.5 | 3h |
| `storiaMusica` | Storia della Musica | 1→5 | 1.3 | 2h |
| `musicaInsieme` | Musica d'Insieme | 1→5 | 1.2 | 2h |
| `laboratorioMusic` | Laboratorio Musicale | 1→5 | 1.1 | 2h |
| `tecnologieMusic` | Tecnologie Musicali | 1→5 | 1.0 | 2h |
| `solfeggio` | Lettura, Solfeggio e Dettato | 1→2 | 1.2 | 2h |
| `pianoCompl` | Pianoforte Complementare | 1→3 | 1.0 | 2h |
| `armonia` | Armonia e Contrappunto | 2→5 | 1.4 | 2h |
| `acusticaFisica` | Acustica Fisica e Psicoacustica | 2→4 | 1.0 | 2h |
| `earTraining` | Ear Training Avanzato | 3→5 | 1.2 | 2h |
| `improvvisazione` | Improvvisazione e Composizione | 3→5 | 1.2 | 2h |
| `informaticaMusic` | Informatica Musicale e DAW | 3→5 | 1.1 | 2h |
| `concertismoEsib` | Concertismo ed Esibizioni Pubbl. | 3→5 | 1.0 | 2h |
| `orchestrazione` | Orchestrazione e Arrangiamento | 4→5 | 1.3 | 2h |
| `composizione` | Composizione Avanzata | 4→5 | 1.3 | 2h |
| `direttoraCoro` | Direzione Corale | 4→5 | 1.1 | 2h |
| `laboratorioOpera` | Lab. Opera e Teatro Musicale | 4→5 | 1.1 | 2h |
| `etnomusicologia` | Etnomusicologia | 4→5 | 1.0 | 1h |
| `critica` | Critica e Giornalismo Musicale | 5→5 | 1.0 | 1h |
| `dirittoDAutore` | Diritto d'Autore e Mercato Music. | 5→5 | 0.9 | 1h |
| `management` | Management e Produzione Musicale | 5→5 | 1.0 | 1h |
| `stageMusica` | Stage Artistico (PCTO) | 3→5 | 0.0 | — |
| `linguaFrancese` | Lingua Francese (Musica Lirica) | 3→5 | 1.0 | 1h |

---

### 🍽️ Istituto Alberghiero (28 materie specifiche)

| Key | Nome | Anni | Peso | Ore/sett |
|-----|------|------|------|----------|
| `diritto` | Diritto ed Economia | 1→2 | 0.8 | 2h |
| `scienzeInt` | Scienze Integrate Bio+Terra | 1→2 | 1.0 | 2h |
| `chimicaInt` | Chimica e Laboratorio | 1→2 | 1.0 | 2h |
| `tecnRappres` | Tecnologie e Rappr. Grafica | 1→2 | 0.8 | 2h |
| `ticAlb` | TIC — Tecnol. Informazione Comun. | 1→2 | 1.0 | 2h |
| `geografia` | Geografia del Turismo | 1→2 | 1.0 | 2h |
| `secondaLingua` | Seconda Lingua Straniera | 1→5 | 1.2 | 3h |
| `scienzeAlim` | Scienze degli Alimenti | 1→5 | 1.3 | 3h |
| `laboratorioCucina` | Lab. Servizi Enogastronomici — Cucina | 1→5 | 1.5 | 6h |
| `laboratorioSala` | Lab. Servizi Sala e Vendita | 1→5 | 1.4 | 4h |
| `laboratorioAccogl` | Lab. Servizi Accoglienza Turistica | 1→5 | 1.3 | 4h |
| `alimentazione` | Scienza e Cultura dell'Alimentazione | 3→5 | 1.3 | 3h |
| `microbiologia` | Microbiologia e Igiene Alimentare | 3→5 | 1.2 | 2h |
| `haccpSicurezza` | HACCP e Sicurezza Alimentare | 3→5 | 1.1 | 2h |
| `enologia` | Enologia e Cultura del Vino | 3→5 | 1.3 | 2h |
| `legislazioneRist` | Legislazione Ristorativa e Turistica | 3→5 | 1.0 | 2h |
| `economiaAz` | Economia e Gestione Aziendale | 3→5 | 1.2 | 3h |
| `reception` | Tecniche di Reception e Front Office | 3→5 | 1.2 | 2h |
| `pasticceria` | Pasticceria e Panificazione | 3→4 | 1.2 | 3h |
| `linguaFrancese` | Lingua Francese per la Ristorazione | 3→5 | 1.1 | 2h |
| `marketingTur` | Marketing Turistico e Digitale | 4→5 | 1.2 | 2h |
| `nutrizione` | Nutrizione, Dietetica e Benessere | 4→5 | 1.1 | 2h |
| `cucinaIntern` | Cucina Internazionale e Fusion | 4→5 | 1.2 | 3h |
| `sommelier` | Tecniche da Sommelier e Degust. | 4→5 | 1.1 | 2h |
| `eventi` | Organizzazione Eventi e Banchetti | 4→5 | 1.1 | 2h |
| `gestioneStruttura` | Gestione Struttura Ricettiva | 5→5 | 1.2 | 2h |
| `businessPlan` | Business Plan e Imprenditorialità | 5→5 | 1.1 | 2h |
| `stageAlberghiero` | Stage Alberghiero (PCTO) | 3→5 | 0.0 | — |

---

### 🔬 Liceo Scientifico (26 materie specifiche)

| Key | Nome | Anni | Peso | Ore/sett |
|-----|------|------|------|----------|
| `geostoria` | Storia e Geografia | 1→2 | 0.9 | 3h |
| `latino` | Latino | 1→5 | 1.2 | 3h |
| `disegnoST` | Disegno e Storia dell'Arte | 1→3 | 0.8 | 2h |
| `informaticaLiceo` | Informatica | 1→2 | 0.9 | 2h |
| `scienze` | Scienze Naturali (Bio+Chim+Terra) | 1→5 | 1.2 | 2h(1-2), 3h(3-5) |
| `filosofia` | Filosofia | 3→5 | 1.2 | 3h |
| `fisicaAvanzata` | Fisica (triennio avanzato) | 3→5 | 1.4 | 3h |
| `chimicaOrg` | Chimica Organica e Biochimica | 3→5 | 1.2 | 2h |
| `matematicaAppl` | Matematica Applicata | 3→5 | 1.1 | 1h |
| `laboratorioSci` | Laboratorio Scientifico | 3→5 | 1.0 | 2h |
| `statisticaProb` | Statistica e Probabilità | 3→4 | 1.0 | 1h |
| `ottica` | Ottica, Onde e Termodinamica | 3→4 | 1.1 | 2h |
| `geologia` | Geologia e Mineralogia | 3→4 | 1.0 | 1h |
| `laboratorioChim` | Laboratorio di Chimica | 3→4 | 1.0 | 2h |
| `biologiaMol` | Biologia Molecolare e Genetica | 4→5 | 1.2 | 2h |
| `fisicaModerna` | Fisica Moderna e Quantistica | 4→5 | 1.3 | 2h |
| `biotecnologie` | Biotecnologie | 4→5 | 1.1 | 2h |
| `geoFisica` | Geofisica e Astronomia | 4→5 | 1.0 | 1h |
| `matematicaDisc` | Matematica Discreta | 4→5 | 1.0 | 1h |
| `ambienteSosten` | Scienze Ambiente e Sostenibilità | 4→5 | 1.0 | 1h |
| `calcolo` | Calcolo Differenziale e Integrale | 5→5 | 1.2 | 2h |
| `relativita` | Relatività e Cosmologia | 5→5 | 1.1 | 1h |
| `neuroscienze` | Neuroscienze Cognitive | 5→5 | 1.0 | 1h |
| `etica` | Etica della Scienza e Bioetica | 5→5 | 0.9 | 1h |
| `secondaLingua` | Seconda Lingua Straniera (opz.) | 3→5 | 1.0 | 2h |
| `alternanzaSci` | PCTO Scientifico | 3→5 | 0.0 | — |

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

**Verifica Fase 2**
- [ ] `calculateWeightedMedia` produce lo stesso risultato di prima per `tecnico`, `agraria`, `artistico` con le materie esistenti (test con valori noti)
- [ ] `tsc --noEmit` senza errori

---

### Fase 3 — `src/lib/data-validation.ts`

- [ ] Aggiornare `validateGrades` — quando `schoolType` è fornito, usare `getDefaultGradesForSchoolType(schoolType)` come baseline per le chiavi attese (invece di una lista hardcoded)

**Verifica Fase 3**
- [ ] `tsc --noEmit` senza errori
- [ ] `validateGrades(null, 'liceoScientifico')` restituisce i voti default del liceo scientifico year=1

---

### Fase 4 — Componenti UI

> Aggiornare i componenti esistenti e creare i nuovi. Ogni punto è indipendente dagli altri a parità di Fase 1-3 completate.

**`src/components/SchoolSelection.tsx`**
- [ ] Aggiungere 3 nuove card per `conservatorio`, `alberghiero`, `liceoScientifico` con icone appropriate (`MusicNote`, `ForkKnife`/`ChefHat`, `Atom` da `@phosphor-icons/react`)
- [ ] Aggiornare la griglia da `md:grid-cols-3` a `md:grid-cols-3 lg:grid-cols-3` con 2 righe (o `grid-cols-2 md:grid-cols-3`) per 6 card

**`src/components/ExamsPanel.tsx`**
- [ ] Aggiungere prop `schoolType: SchoolType` e `schoolYear: number` al component
- [ ] Sostituire la lista statica di soggetti con `getActiveSubjectsForYear(schoolType, schoolYear).map(s => s.key)` per `generateScheduledExam`

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

### Fase 5 — Integrazione in `App.tsx`

- [ ] Aggiornare `handleSchoolSelection` per inizializzare `gradesHistory: {}` nel KV
- [ ] Passare `schoolYear` a `ExamsPanel` come prop
- [ ] Aggiungere `gradesHistory` allo stato KV: `useKV<Record<number, SubjectGrades>>('tabboz-grades-history', {})`
- [ ] Passare `GradeProgressPanel` o il tab Scuola dove necessario nella UI principale
- [ ] Al completamento dell'anno scolastico (logica esistente in `useGameTime`): chiamare `archiveYearGrades` e aggiornare `gradesHistory`

**Verifica Fase 5**
- [ ] Nuovo gioco con `liceoScientifico`: anno 1 ha le materie corrette, anno 3 ha `fisicaAvanzata` al posto di `fisica`
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
e per la UI)  ma non viene usato nella logica di `getActiveSubjectsForYear`, che
separa i dati strutturalmente in `COMMON_SUBJECTS` e `SPECIFIC_SUBJECTS`.

---

## Note di Ambientazione

Il gioco è ambientato a **Roma** — gli istituti di riferimento per il curriculum sono:

- **Tecnico**: ITIS Enrico Fermi (Via Casilina), ITIS Galilei
- **Agraria**: Istituto Tecnico Agrario San Michele (Via Nomentana)
- **Artistico**: Liceo Artistico di Via Ripetta / Liceo Artistico Enzo Rossi
- **Liceo Musicale**: Liceo Musicale Anco Marzio / Santa Cecilia
- **Alberghiero**: IPSEOA Pellegrino Artusi (Via Ferrini)
- **Liceo Scientifico**: Liceo Scientifico Giulio Cesare / Liceo Pasteur
