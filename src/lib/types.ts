import type { TraitId } from '@/lib/character-traits'
import { getActiveSubjectsForYear, COMMON_SUBJECTS, SPECIFIC_SUBJECTS } from '@/lib/subjects'
export type { SubjectDefinition } from '@/lib/subjects'

export interface GameStats {
  muscoli: number
  coattaggine: number
  soldi: number
  media: number
  stanchezza: number
  stress: number       // 0-100: stanchezza mentale
  morale: number       // 0-100: stato emotivo
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
  salute: number
  hasMotorino: boolean  // true dopo la prima azione motorino riuscita
}

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export interface ScheduledExam {
  id?: string
  subject: string
  date?: { day: number; month: number; year: number }
  daysUntil?: number
  type?: 'scritto' | 'orale'
  isPrepared: boolean
  difficulty: ExamDifficulty
  announced?: boolean
}

export type SchoolType =
  | 'tecnico'
  | 'agraria'
  | 'artistico'
  | 'conservatorio'
  | 'alberghiero'
  | 'liceoScientifico'

export interface SubjectGrades {
  [subject: string]: number
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  daysUntilBreak: number
  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

export interface DayPhaseConfig {
  label: string
  timeRange: string
  maxActions: number
  energyCost: number
  nightRecovery: number
}

export interface PhaseActions {
  mattina: number
  pomeriggio: number
  sera: number
  notte: number
}

export interface GameTime {
  currentDate: GameDate
  actionsRemaining: number
  maxActionsPerDay: number
  schoolYear: SchoolYear
  age: number
  lastPaghettaDate?: GameDate
  extraActions: number
  currentPhase: DayPhase
  phaseActions: PhaseActions
}

export interface GameTimeV2 extends GameTime {
  dayType: DayType
  phaseActionsRemaining: number
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export type NarrativePlayerGender = 'maschio' | 'femmina'

export type BinaryGenderCode = 'M' | 'F'

export type CharacterGender = BinaryGenderCode | NarrativePlayerGender

export type SexualOrientation =
  | 'eterosessuale'
  | 'omosessuale'
  | 'bisessuale'
  | 'pansessuale'
  | 'asessuale'

export type ReputationLevel = 'sfigato' | 'normale' | 'popolare' | 'leggenda'

export type RelationshipTier =
  | 'sconosciuto'
  | 'conoscente'
  | 'amico'
  | 'amico_stretto'
  | 'migliore_amico'
  | 'trombamica'
  | 'fidanzata'

export type SocialBondType = 'amicizia' | 'romantico'

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  return Object.fromEntries(
    getActiveSubjectsForYear(schoolType, 1)
      .filter(s => s.countsForGPA)
      .map(s => [s.key, 6])
  )
}

export function getSubjectDisplayName(subject: string): string {
  for (const s of COMMON_SUBJECTS) {
    if (s.key === subject) return s.displayName
  }
  for (const subjects of Object.values(SPECIFIC_SUBJECTS)) {
    const found = subjects.find(s => s.key === subject)
    if (found) return found.displayName
  }
  return subject.replace(/([A-Z])/g, ' $1').trim()
}

export function getSchoolTypeName(schoolType: SchoolType): string {
  const names: Record<SchoolType, string> = {
    liceoScientifico: 'Liceo Scientifico',
    tecnico:          'Istituto Tecnico Informatico',
    agraria:          'Istituto Tecnico Agrario',
    artistico:        'Liceo Artistico',
    conservatorio:    'Liceo Musicale',
    alberghiero:      'Istituto Alberghiero',
  }
  return names[schoolType] || schoolType
}

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

export const getRelationshipTierLabel = (tier: RelationshipTier): string => {
  const labels: Record<RelationshipTier, string> = {
    sconosciuto:    '\u{1F494} Sconosciuto',
    conoscente:     '\u{1F610} Conoscente',
    amico:          '\u{1F60A} Amico',
    amico_stretto:  '\u{1F60E} Amico Stretto',
    migliore_amico: '\u{1F451} Migliore Amico',
    trombamica:     '\u{1F48B} Trombamica',
    fidanzata:      '\u2764\uFE0F Fidanzata',
  }
  return labels[tier]
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gradesHistory: Record<number, SubjectGrades>
  gameTime: GameTime
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: {
    muscoli: 50,
    coattaggine: 50,
    soldi: 100,
    media: 6,
    stanchezza: 0,
    stress: 10,
    morale: 60,
    figosita: 50,
    reputazione: 50,
    intelligenza: 10,
    carisma: 10,
    salute: 100,
    hasMotorino: false,
  },
  grades: {
    matematica: 6,
    fisica: 6,
    italiano: 6,
    inglese: 6,
    storia: 6,
    edFisica: 6,
    diritto: 6,
    scienzeInt: 6,
    chimicaInt: 6,
    tecnInfo: 6,
  },
  gradesHistory: {},
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2026 },
    actionsRemaining: 3,
    maxActionsPerDay: 3,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      daysUntilBreak: 180,
      schoolStartDate: { day: 15, month: 9, year: 2026 },
      schoolEndDate: { day: 10, month: 6, year: 2027 },
      reportCardDate: { day: 10, month: 6, year: 2027 }
    },
    age: 14,
    extraActions: 0,
    currentPhase: 'mattina',
    phaseActions: {
      mattina: 3,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  }
}

export interface Friend extends BaseCharacter {
  // ── campi esistenti (INVARIATI) ──────────────────────────────
  id:           string
  name:         string
  type:         FriendType
  intelligenza?: number
  gender?:      BinaryGenderCode
  carisma?:     number
  relazione?:   number
  unlocked:     boolean

  // ── NUOVO: contesto di origine ───────────────────────────────
  originType:   'compagno_classe' | 'compagno_istituto' | 'extrascolastico'
  metAt?:       'classe' | 'corridoio' | 'quartiere' | 'palestra'
              | 'online' | 'festa' | 'sport' | 'lavoro'
  schoolYearMet?: number

  // ── NUOVO: assi relazionali (import type da relation-system) ─
  rel?: import('@/lib/relation-system').RelationStats

  // ── NUOVO: tracking temporale per erosione inattività ────────
  lastInteractionDay?: number   // dayIndex (dateToDayIndex) dell'ultima interazione

  // ── DEPRECATO — mantenuto per migrazione KV legacy ───────────
  affinita?: number             // letto solo da migrateLegacyFriend()
  tier?:     RelationshipTier   // ora derivato, non stored
  bondType?: SocialBondType     // ora derivato, non stored
}

export interface BaseCharacter {
  id?: string
  name: string
  gender?: CharacterGender
  orientamentoSessuale?: SexualOrientation
  age?: number
  carisma?: number
  intelligenza?: number
  relazione?: number
  originType?: 'compagno_classe' | 'compagno_istituto' | 'extrascolastico' | 'player'
  metAt?: string
  interazioniPerFase?: number
}

export interface Relationship {
  id: string
  name: string
  gender?: BinaryGenderCode
  orientamentoSessuale?: SexualOrientation
  difficulty: 'facile' | 'media' | 'difficile'
  preference: 'muscoli' | 'figosita' | 'intelligenza'
  relationshipLevel: number
  isActive: boolean
}

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export interface EventConstraint {
  allowedPhases?: DayPhase[]
  allowedDayTypes?: DayType[]
  requiresSchoolPeriod?: boolean
  minSchoolYear?: number
  blockedWhenExhausted?: boolean
}

export interface PlayerProfile extends BaseCharacter {
  name: string
  gender: NarrativePlayerGender
  orientamentoSessuale: SexualOrientation
  selectedTraits?: TraitId[]
  traits?: string[]
}

export type MorningEventCategory =
  | 'didattica' | 'sociale' | 'istituto'
  | 'strada' | 'casa' | 'citta' | 'amici'

export interface SchoolRecord {
  assenze: number
  note: number
  sospensioni: number
  condotta: number
  wentToSchoolToday: boolean
  isAtSchool: boolean          // true solo se fisicamente a scuola oggi
  consecutiveGoodDays: number
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  note: 0,
  sospensioni: 0,
  condotta: 8.0,
  wentToSchoolToday: false,
  isAtSchool: false,
  consecutiveGoodDays: 0
}

export type LogEntryType =
  | 'action_success'   // azione del giocatore riuscita
  | 'action_failure'   // azione del giocatore fallita
  | 'action_neutral'   // azione del giocatore neutra (es. studia)
  | 'event_positive'   // evento automatico positivo
  | 'event_negative'   // evento automatico negativo
  | 'event_neutral'    // evento automatico neutro
  | 'school'           // evento scolastico (voto, nota, sospensione)
  | 'social'           // evento sociale (amico, ragazza)
  | 'system'           // evento di sistema (fine anno, game over, nuovo anno)
  | 'health'           // condizione di salute (insorgenza, guarigione, peggioramento)

export type DayPhaseLabel = 'Mattina' | 'Pomeriggio' | 'Sera' | 'Notte'

export interface GameLogEntry {
  id: string
  type: LogEntryType
  phase: DayPhaseLabel
  date: GameDate
  title: string
  description: string
  result: 'positive' | 'negative' | 'neutral'
}

export const MAX_LOG_ENTRIES = 200

// ── Health System ──────────────────────────────────────────────

export type HealthConditionId =
  | 'raffreddore'
  | 'influenza'
  | 'febbre_alta'
  | 'infortunio_lieve'
  | 'infortunio_grave'
  | 'sbornia'
  | 'dipendenza_fumo'
  | 'dipendenza_alcol'
  | 'esaurito'
  | 'depresso'
  | 'ciclo_mestruale'
  | 'gravidanza'

export type HealthConditionSeverity = 'lieve' | 'moderata' | 'grave'

export interface HealthConditionTemplate {
  id: HealthConditionId
  label: string
  description: string
  severity: HealthConditionSeverity
  durationDays: number | null
  statModifiers: Partial<Record<keyof GameStats, number>>
  genderRestricted?: 'femmina'
  forcesAbsence?: boolean
  autoOnset?: {
    check: 'stress_high' | 'morale_low'
    threshold: number
  }
  autoResolve?: {
    check: 'stress_low' | 'morale_high'
    threshold: number
  }
  cumulative?: boolean
}

export interface ActiveCondition {
  id: HealthConditionId
  startDate: GameDate
  daysElapsed: number
  appliedModifiers: Partial<Record<keyof GameStats, number>>
}

export interface HealthRecord {
  conditions: ActiveCondition[]
  lastCheckupDate?: GameDate
  /** Data in cui è previsto il prossimo ciclo (solo per personaggi femminili). */
  nextCycleDate?: GameDate
}

export const DEFAULT_HEALTH_RECORD: HealthRecord = {
  conditions: [],
}

export const HEALTH_CONDITIONS: Record<HealthConditionId, HealthConditionTemplate> = {
  raffreddore: {
    id: 'raffreddore',
    label: 'Raffreddore',
    description: 'Naso chiuso e starnuti. Niente di grave, ma sei un po\' rimbambito.',
    severity: 'lieve',
    durationDays: 5,
    statModifiers: { intelligenza: -3, muscoli: -5 },
  },
  influenza: {
    id: 'influenza',
    label: 'Influenza',
    description: 'Febbre, dolori, e voglia di starsene a letto. Dura un bel po\'.',
    severity: 'moderata',
    durationDays: 10,
    statModifiers: { intelligenza: -10, muscoli: -15, morale: -10 },
  },
  febbre_alta: {
    id: 'febbre_alta',
    label: 'Febbre Alta',
    description: 'Temperatura alle stelle! Non puoi andare a scuola in queste condizioni.',
    severity: 'grave',
    durationDays: 7,
    statModifiers: { intelligenza: -20, muscoli: -20 },
    forcesAbsence: true,
  },
  infortunio_lieve: {
    id: 'infortunio_lieve',
    label: 'Infortunio Lieve',
    description: 'Una storta o un livido. Niente di rotto, ma fa male.',
    severity: 'lieve',
    durationDays: 7,
    statModifiers: { muscoli: -10, figosita: -5 },
  },
  infortunio_grave: {
    id: 'infortunio_grave',
    label: 'Infortunio Grave',
    description: 'Frattura o stiramento serio. Ci vorranno settimane per riprenderti.',
    severity: 'grave',
    durationDays: 21,
    statModifiers: { muscoli: -30, figosita: -15, morale: -10 },
  },
  sbornia: {
    id: 'sbornia',
    label: 'Sbornia',
    description: 'Testa che gira, stomaco in subbuglio. Mai pi\u00f9... fino alla prossima volta.',
    severity: 'lieve',
    durationDays: 1,
    statModifiers: { intelligenza: -15, muscoli: -10, morale: -5 },
  },
  dipendenza_fumo: {
    id: 'dipendenza_fumo',
    label: 'Dipendenza da Fumo',
    description: 'Le sigarette ti stanno consumando. Ogni giorno peggiori un po\'.',
    severity: 'moderata',
    durationDays: null,
    statModifiers: { muscoli: -5, salute: -3 },
    cumulative: true,
  },
  dipendenza_alcol: {
    id: 'dipendenza_alcol',
    label: 'Dipendenza da Alcol',
    description: 'L\'alcol ti sta rovinando la vita. Ogni giorno \u00e8 peggio del precedente.',
    severity: 'grave',
    durationDays: null,
    statModifiers: { intelligenza: -10, morale: -10, salute: -5 },
    cumulative: true,
  },
  esaurito: {
    id: 'esaurito',
    label: 'Esaurito',
    description: 'Troppo stress! Non riesci a concentrarti su nulla.',
    severity: 'moderata',
    durationDays: null,
    statModifiers: { intelligenza: -10, morale: -5 },
    autoOnset: { check: 'stress_high', threshold: 85 },
    autoResolve: { check: 'stress_low', threshold: 70 },
  },
  depresso: {
    id: 'depresso',
    label: 'Depresso',
    description: 'Non hai voglia di fare niente. Il mondo sembra grigio.',
    severity: 'grave',
    durationDays: null,
    statModifiers: { morale: -10, reputazione: -5, carisma: -5 },
    autoOnset: { check: 'morale_low', threshold: 15 },
    autoResolve: { check: 'morale_high', threshold: 25 },
  },
  // ── Gender-specific (STEP 9E) ──
  ciclo_mestruale: {
    id: 'ciclo_mestruale',
    label: 'Ciclo Mestruale',
    description: 'Quel periodo del mese. Crampi e malumore.',
    severity: 'lieve',
    durationDays: 5,
    statModifiers: { morale: -5, muscoli: -5 },
    genderRestricted: 'femmina',
  },
  gravidanza: {
    id: 'gravidanza',
    label: 'Gravidanza',
    description: 'Una situazione... complicata. Tutto cambier\u00e0.',
    severity: 'grave',
    durationDays: 280,
    statModifiers: { muscoli: -10, morale: -15, stress: 20 },
    genderRestricted: 'femmina',
  },
}
// ── Sistema Scolastico Avanzato — Fase 1B ─────────────────────

// 2.1 Orario Settimanale

export interface TimetableSlot {
  subjectKey: string   // chiave materia da SubjectDefinition
  teacherId: string    // id del Teacher assegnato
}

export type WeeklyTimetable = {
  [day in 0 | 1 | 2 | 3 | 4]: TimetableSlot[]  // 6 slot per giorno (lun-ven)
}

// 2.2 Compagno di Classe

export type ClassmatePersonality =
  | 'secchione' | 'bullo' | 'simpatico' | 'silenzioso'
  | 'sportivo' | 'ribelle' | 'nerd' | 'popolare'
  | 'timido' | 'leader'

export interface Classmate extends BaseCharacter {
  id: string
  name: string
  type: FriendType                    // coatto | secchione | sportivo | ribelle | generico
  intelligenza: number                // 20-100
  relation: number                    // [0,100], valore neutro 50
  relazione?: number                  // alias compatibile per BaseCharacter
  gender?: BinaryGenderCode
  carisma?: number
  personality: ClassmatePersonality   // archetipo narrativo
  promotedToFriend: boolean           // true quando il giocatore lo aggiunge agli amici
  yearJoined: number                  // anno scolastico in cui e entrato nella classe
}

// 2.3 Professore

export interface TeacherMemoryEntry {
  type: 'corruzione' | 'minaccia' | 'buon_voto' | 'cattivo_voto'
      | 'conversazione' | 'richiesta_spiegazione' | 'richiesta_revoca_voto'
  date: GameDate
  detail: string
  impactOnRelation: number   // quanto ha cambiato la relazione
}

export interface Teacher extends BaseCharacter {
  id: string
  name: string
  subjectKey: string              // materia insegnata
  gender: BinaryGenderCode

  // Attributi (1-10)
  severita: number
  simpatia: number
  corruttibilita: number
  resistenzaMinacce: number

  // Relazione col giocatore [0,100] — C2 (aggiornata da piano correttivo v3)
  relazione: number
  sogliaRottura: number           // sotto questo valore -> modalita ostile
  isOstile: boolean               // derivato da relazione < sogliaRottura

  // Memoria
  memoria: TeacherMemoryEntry[]
  corruptionCount: number         // tentativi corruzione riusciti
  threatCount: number             // tentativi minaccia subiti
}

// 2.4 Stato Mattinata Scolastica

export interface OrdinaryHourEvent {
  message: string
  statDelta: Partial<GameStats>   // tipicamente +1 intelligenza o +2 stanchezza
}

export interface HourSlot {
  hourIndex: number               // 0-5 (prima ora = 0, sesta ora = 5)
  type: 'lesson' | 'break'
  subjectKey?: string             // assente per break
  teacherId?: string              // assente per break
  ordinaryEvent: OrdinaryHourEvent
  structuredEvent?: import('@/lib/school-morning-events').SchoolMorningEvent
  schoolEvent?: import('@/lib/school-events').SchoolEvent
  schoolEventTriggered?: boolean
  completed: boolean
  playerChoice?: string           // id della scelta fatta (per log)
}

export interface SchoolDayState {
  date: GameDate                  // data della mattinata in corso
  slots: HourSlot[]               // 7 elementi: 3 ore + break + 3 ore
  currentSlotIndex: number        // 0-6, slot attivo
  isComplete: boolean
}

export const DEFAULT_SCHOOL_DAY_STATE: SchoolDayState = {
  date: { day: 1, month: 9, year: 2026 },
  slots: [],
  currentSlotIndex: 0,
  isComplete: false,
}

// Blocco 4 — anticipato per dipendenze (C11)
export type BreakActionType =
  | 'chiacchiera_compagno'
  | 'studia_insieme'
  | 'risolvi_conflitto'
  | 'conversazione_prof'
  | 'chiedi_spiegazione'
  | 'chiedi_revoca_voto'
  | 'corruzione_prof'
  | 'minaccia_prof'
  | 'bar_scolastico'
  | 'riposa'