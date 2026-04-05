import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  figosita: number
  intelligenza: number
  muscoli: number
  media: number
  coattaggine: number
  reputazione: number
  carisma: number
  soldi: number
  stanchezza: number
}

export type ReputationLevel = 
  | 'Sfigato Totale' 
  | 'Nessuno' 
  | 'Conosciuto'
  | 'Rispettato' 
  | 'Leggenda del Quartiere'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type PlayerGender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export type RelationshipTier =
  | 'sconosciuto'
  | 'conoscente'
  | 'amico'
  | 'amico_stretto'
  | 'migliore_amico'
  | 'trombamica'
  | 'fidanzata'

export type SocialBondType = 'amicizia' | 'romantico'

export interface Friend {
  id: string
  name: string
  type: FriendType
  affinita: number
  unlocked: boolean
  bondType?: SocialBondType
}

export interface Relationship {
  id: string
  name: string
  difficulty: 'facile' | 'media' | 'difficile'
  preference: 'muscoli' | 'figosita' | 'intelligenza'
  isActive: boolean
}

export interface SubjectGrades {
  [key: string]: number
}

export interface SchoolRecord {
  assenze: number
  condotta: number
  note: number
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays?: number
  scheduledSchoolEvent?: { subject: string }
}

export interface TecnicoGrades extends SubjectGrades {
  matematica: number
  italiano: number
  storia: number
  edFisica: number
  informatica: number
  elettronica: number
  meccanica: number
  sistemi: number
  inglese: number
  fisica: number
  tecnologia: number
}

export interface AgrariaGrades extends SubjectGrades {
  matematica: number
  italiano: number
  storia: number
  edFisica: number
  agronomia: number
  biologia: number
  zootecnia: number
  ecologia: number
  inglese: number
  chimica: number
  botanica: number
}

export interface ArtisticoGrades extends SubjectGrades {
  matematica: number
  italiano: number
  storia: number
  edFisica: number
  disegno: number
  pittura: number
  storiaArte: number
  scultura: number
  anatomia: number
  grafica: number
  architettura: number
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  tecnico: {
    matematica: 1.5,
    italiano: 1.5,
    informatica: 1.3,
    elettronica: 1.2,
    sistemi: 1.2,
    meccanica: 1.1,
    fisica: 1.0,
    storia: 0.8,
    inglese: 0.9,
    tecnologia: 1.0,
    edFisica: 0.5,
  },
  agraria: {
    matematica: 1.5,
    italiano: 1.5,
    agronomia: 1.3,
    biologia: 1.2,
    chimica: 1.2,
    zootecnia: 1.1,
    ecologia: 1.0,
    botanica: 1.0,
    storia: 0.8,
    inglese: 0.9,
    edFisica: 0.5,
  },
  artistico: {
    matematica: 1.5,
    italiano: 1.5,
    storiaArte: 1.4,
    disegno: 1.3,
    pittura: 1.2,
    scultura: 1.2,
    anatomia: 1.1,
    grafica: 1.0,
    architettura: 1.0,
    storia: 0.8,
    edFisica: 0.5,
  }
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export interface SchoolYear {
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
  age: number
  schoolYear: SchoolYear
  lastPaghettaDate?: GameDate
  extraActions?: number
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

export interface DayPhaseConfig {
  label: string
  timeRange: string
  maxActions: number
}

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

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export interface ScheduledExam {
  id: string
  subject: string
  difficulty: ExamDifficulty
  isPrepared: boolean
  announced: boolean
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface PlayerProfile {
  name: string
  gender: PlayerGender
  age: number
}

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
  coattaggine: 50,
  muscoli: 50,
  media: 6,
  stanchezza: 0,
  figosita: 50,
  soldi: 100,
  intelligenza: 10,
  reputazione: 50,
  carisma: 10,
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  condotta: 8.0,
  note: 0,
  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0,
}

export const getDefaultGradesForSchoolType = (schoolType: SchoolType): SubjectGrades => {
  switch (schoolType) {
    case 'tecnico':
      return {
        matematica: 6.0,
        italiano: 6.0,
        storia: 6.0,
        edFisica: 6.0,
        informatica: 6.0,
        elettronica: 6.0,
        meccanica: 6.0,
        sistemi: 6.0,
        inglese: 6.0,
        fisica: 6.0,
        tecnologia: 6.0,
      }
    case 'agraria':
      return {
        matematica: 6.0,
        italiano: 6.0,
        storia: 6.0,
        edFisica: 6.0,
        agronomia: 6.0,
        biologia: 6.0,
        zootecnia: 6.0,
        ecologia: 6.0,
        inglese: 6.0,
        chimica: 6.0,
        botanica: 6.0,
      }
    case 'artistico':
      return {
        matematica: 6.0,
        italiano: 6.0,
        storia: 6.0,
        edFisica: 6.0,
        disegno: 6.0,
        pittura: 6.0,
        storiaArte: 6.0,
        scultura: 6.0,
        anatomia: 6.0,
        grafica: 6.0,
        architettura: 6.0,
      }
  }
}

export const getSubjectDisplayName = (subject: string): string => {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    italiano: 'Italiano',
    storia: 'Storia',
    edFisica: 'Ed. Fisica',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    meccanica: 'Meccanica',
    sistemi: 'Sistemi',
    inglese: 'Inglese',
    fisica: 'Fisica',
    tecnologia: 'Tecnologia',
    agronomia: 'Agronomia',
    biologia: 'Biologia',
    zootecnia: 'Zootecnia',
    ecologia: 'Ecologia',
    chimica: 'Chimica',
    botanica: 'Botanica',
    disegno: 'Disegno',
    pittura: 'Pittura',
    storiaArte: 'Storia dell\'Arte',
    scultura: 'Scultura',
    anatomia: 'Anatomia',
    grafica: 'Grafica',
    architettura: 'Architettura',
  }
  return displayNames[subject] || subject
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,
  grades: {
    matematica: 6,
    italiano: 6,
    storia: 6,
    edFisica: 6,
  },
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2026 },
    actionsRemaining: 6,
    maxActionsPerDay: 6,
    age: 14,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2026 },
      schoolEndDate: { day: 10, month: 6, year: 2027 },
      reportCardDate: { day: 10, month: 6, year: 2027 },
    }
  },
  gameOver: false,
  gameOverReason: '',
  friends: [],
  relationships: [],
  scheduledExams: [],
  schoolRecord: DEFAULT_SCHOOL_RECORD,
}
