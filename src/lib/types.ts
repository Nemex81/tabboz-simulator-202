import type { TraitId } from '@/lib/character-traits'

  muscoli: number
  media: number
  figosita: numbe
  intelligenza:
  psychStress: 

  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
  psychStress: number
}

export type ReputationLevel = 
  | 'Sfigato Totale' 
  | 'Nessuno' 
export type Relati
  | 'Rispettato' 
  | 'Leggenda del Quartiere'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

/** C2-2: livelli di profondità relazionale */
export type RelationshipTier =
  | 'sconosciuto'
  | 'conoscente'
  unlocked:
  | 'amico_stretto'
}
  | 'trombamica'
  | 'fidanzata'

/** C2-2: tipo del legame — amicizia vs relazione romantica */
export type SocialBondType = 'amicizia' | 'romantico'

export interface Friend {
  [key: stri
  name: string
  type: FriendType
  affinita: number
  note: number
  unlocked: boolean
  tier?: RelationshipTier
  bondType?: SocialBondType


export interface Relationship {
  id: string
  informatica:
  difficulty: 'facile' | 'media' | 'difficile'
  preference: 'muscoli' | 'figosita' | 'intelligenza'
  relationshipLevel: number
  isActive: boolean
}

export interface SubjectGrades {
  [key: string]: number
}

export interface SchoolRecord {
  ecologia: numbe
  condotta: number
  botanica: nu
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays?: number
  scheduledSchoolEvent?: { subject: string }
}

export interface TecnicoGrades extends SubjectGrades {
  storiaArte: number
  italiano: number
  storia: number
  edFisica: number

  elettronica: number
  meccanica: number
  sistemi: number
  inglese: number
  fisica: number
  agraria: {
  tecnologia: number
 

export interface AgrariaGrades extends SubjectGrades {
  matematica: number
    disegno: 1.3,
  storia: number
}
  biologia: number
  day: number
  zootecnia: number
  ecologia: number
  inglese: number
  chimica: number
  botanica: number
  schoolEndDate: GameDa
}

export interface ArtisticoGrades extends SubjectGrades {
  matematica: number
  italiano: number
  schoolYear: Sc
  edFisica: number
  extraActions?: 
  pittura: number
// ─── Fasce Orari
  storiaArte: number

  anatomia: number
  grafica: number
  architettura: number
}

// Pesi per il calcolo della media pesata (Step 2)
export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
export inter
    matematica: 1.5,
    italiano: 1.5,
    informatica: 1.3,
    edFisica: 0.5,
  },
  requiresSc
    matematica: 1.5,
    italiano: 1.5,
    agronomia: 1.3,

  },
export interfa
    matematica: 1.5,
  isPrepared: bool
    disegno: 1.3,
}
  },


export interface PlayerProf
  day: number
  month: number
  year: number
}


  currentYear: number
  isSchoolPeriod: boolean
  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
  schoolType?: SchoolType
}

export interface GameTime {
  currentDate: GameDate
  actionsRemaining: number
  maxActionsPerDay: number
  schoolYear: SchoolYear
  stanchezza:
  lastPaghettaDate?: GameDate
  extraActions?: number   // azioni bonus guadagnate tramite eventi speciali
 

// ─── Fasce Orarie (Fase B) ──────────────────────────────────────────────────

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

export interface DayPhaseConfig {
  label: string
  timeRange: string
  maxActions: number
  energyCost: number   // stanchezza aggiunta per azione
  nightRecovery: number // riduzione stanchezza durante la notte (negativo = recupero)
 

/** Estensione di GameTime con supporto fasce orarie. Compatibile con GameTime. */
export interface GameTimeV2 extends GameTime {
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
}

export interface EventConstraint {
  allowedPhases: DayPhase[]
  allowedDayTypes: DayType[]
  requiresSchoolPeriod?: boolean
  minSchoolYear?: number
  blockedWhenExhausted?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export interface ScheduledExam {
  subject: string
  italiano: 6,
  isPrepared: boolean
  difficulty: ExamDifficulty
  announced: boolean
}

  schoolYear: {

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface PlayerProfile {
  name: string
  gender: PlayerGender
  age: number
 

export interface GamePreferences {
  theme: ThemeVariant
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameTime: GameTime
  gameOver: boolean
  gameOverReason: string
  schoolType?: SchoolType
  playerProfile?: PlayerProfile
  friends?: Friend[]
  relationships?: Relationship[]
  scheduledExams?: ScheduledExam[]
  traits?: TraitId[]
  schoolRecord?: SchoolRecord
}

export const DEFAULT_STATS: GameStats = {
    edFisica: 'Ed.
  muscoli: 50,
    meccanica
  media: 6,
  stanchezza: 0,
  figosita: 50,
    biologia: 'Bio
  intelligenza: 10,
    ecologia: 
  psychStress: 0,
 

export const getDefaultGradesForSchoolType = (schoolType: SchoolType): SubjectGrades => {
  switch (schoolType) {
    case 'tecnico':
      return {
        matematica: 6.0,
        italiano: 6.0,
export const getRela
        edFisica: 6.0,



























































































































































