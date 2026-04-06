# Piano Logico — Sistema Materie Scolastiche Dinamico

> **Versione**: 1.0  
> **Data**: 2026-04-06  
> **Stato**: Progettazione completata — implementazione da avviare  
> **Ambientazione**: Roma, sistema scolastico italiano reale

---

## Obiettivo

Sostituire il sistema statico di materie (lista fissa per istituto) con un sistema
**dinamico e per anno scolastico**: ogni anno il giocatore vede un sottoinsieme
coerente di materie, alcune delle quali entrano ed escono in base all'anno frequentato.

Questo permette di modellare fedelmente i 5 anni di scuola superiore italiana con
circa 10-14 materie attive per anno, che si evolvono nel tempo.

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

## Piano di Implementazione — 3 Fasi

### Fase 1 — `src/lib/types.ts` (nessun impatto su App.tsx)

- [ ] Aggiungere tipo `SchoolType` con 6 valori (rimuovere duplicato `tecnico`)
- [ ] Aggiungere interfaccia `SubjectDefinition`
- [ ] Definire costante `COMMON_SUBJECTS: SubjectDefinition[]` (7 materie)
- [ ] Definire costante `SPECIFIC_SUBJECTS: Record<SchoolType, SubjectDefinition[]>`
- [ ] Aggiungere funzione `getActiveSubjectsForYear(schoolType, year)`
- [ ] Aggiornare `getDefaultGradesForSchoolType` come wrapper retrocompatibile
- [ ] Aggiornare `getSubjectDisplayName` con tutti i display name
- [ ] Aggiornare `SUBJECT_WEIGHTS` o deprecarlo in favore del peso in `SubjectDefinition`

### Fase 2 — `src/lib/game-utils.ts`

- [ ] Aggiungere `getGPASubjectsForYear(schoolType, year)` — filtra solo `countsForGPA: true`
- [ ] Aggiungere `archiveYearGrades(grades, schoolType, fromYear)` — salva i voti
  dell'anno concluso e rimuove le materie uscenti
- [ ] Aggiornare `calculateGPA` per usare i pesi da `SubjectDefinition`

### Fase 3 — Componenti UI

- [ ] `ExamsPanel.tsx` — usa `getActiveSubjectsForYear` invece della lista statica
- [ ] `CharacterSheet.tsx` (tab Scuola/Voti) — lista materie dinamica
- [ ] `SchoolSetup` / `CharacterCreation` — mostra i 6 indirizzi disponibili
- [ ] `GradeProgressPanel` — mostra materie attive per anno corrente

---

## Considerazioni Tecniche

### Retrocompatibilità KV
Il salvataggio di `grades` nel KV store contiene le chiavi delle materie come stringhe.
Quando si passa all'anno successivo e alcune materie escono, i voti delle materie
archiviate restano nel KV ma non vengono più visualizzati. Considerare un campo
separato `gradesHistory: Record<number, SubjectGrades>` per anno.

### Media Annuale vs Media Corrente
- **Media corrente**: calcolata solo sulle materie attive nell'anno in corso
- **Media storica**: media dei 5 anni (o degli anni completati) — da calcolare
  aggregando `gradesHistory`

### Gestione PCTO / Stage
Le materie con `countsForGPA: false` (stage, religione) vengono mostrate in UI
ma non influenzano la media. Il giocatore può comunque guadagnare reputazione
e eventi narrativi da queste attività.

---

## Note di Ambientazione

Il gioco è ambientato a **Roma** — gli istituti di riferimento per il curriculum sono:

- **Tecnico**: ITIS Enrico Fermi (Via Casilina), ITIS Galilei
- **Agraria**: Istituto Tecnico Agrario San Michele (Via Nomentana)
- **Artistico**: Liceo Artistico di Via Ripetta / Liceo Artistico Enzo Rossi
- **Liceo Musicale**: Liceo Musicale Anco Marzio / Santa Cecilia
- **Alberghiero**: IPSEOA Pellegrino Artusi (Via Ferrini)
- **Liceo Scientifico**: Liceo Scientifico Giulio Cesare / Liceo Pasteur
