import type { TraitId } from '@/lib/character-traits'

export interface GameStats {

export interface GameStats {
  figosita: num
  intelligenza: numbe
  muscoli: number
  media: number
  | 'Sfigato Totale'
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
  psychStress: number
 

export type ReputationLevel = 
  | 'Sfigato Totale' 
  | 'Nessuno' 
  id: string
  | 'Rispettato' 
  | 'Leggenda del Quartiere'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

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
}
  affinita: number
  unlocked: boolean
  edFisica: number
  bondType?: SocialBondType
}

}
  id: string
  name: string
  difficulty: 'facile' | 'media' | 'difficile'
  preference: 'muscoli' | 'figosita' | 'intelligenza'
  storiaArte: number
  isActive: boolean
 

export interface SubjectGrades {
  [key: string]: number
 

export interface SchoolRecord {
    storia: 0.8,
  condotta: number
    matematica
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays?: number
  scheduledSchoolEvent?: { subject: string }
 

export interface TecnicoGrades extends SubjectGrades {
  matematica: number
  italiano: number
  storia: number
  edFisica: number
    edFisica: 0.5,
  elettronica: number
  meccanica: number
  sistemi: number
  inglese: number
  fisica: number
  tecnologia: number
 

export interface AgrariaGrades extends SubjectGrades {
  matematica: number
  maxActionsPerDay
  storia: number
  extraActions?: n

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
  blockedWhenExh
  edFisica: number

  pittura: number
  isPrepared: bool
  storiaArte: number

  anatomia: number
  grafica: number
  architettura: number
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  stats: Gam
    matematica: 1.5,
    italiano: 1.5,
    informatica: 1.3,
  relationships?: Rel
  traits?: TraitId[
}
export const DEF
  coattaggine: 50,
  media: 6,
  figosita: 50,
    edFisica: 0.5,
  },

    matematica: 1.5,
    italiano: 1.5,
    agronomia: 1.3,
        edFisica: 
        elettroni
        sistemi: 6.
        fisica: 6.
      }
      return {
        italiano
        edFisica: 
  },
        ecolog
    matematica: 1.5,
      }
    disegno: 1.3,
        italiano: 6.
        edFisica:
        pittura: 6
        storiaArt
        anatomia: 6.
        architettu
  }

  const displayNam
  },
 

    sistemi: 'Sistemi',
  day: number
  month: number
  year: number
}

    scultura: 'Scultura',
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
    age: 14,
  schoolYear: SchoolYear
  lastPaghettaDate?: GameDate
      reportCardDate: {
 

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

export interface DayPhaseConfig {
  label: string
  timeRange: string
  maxActions: number




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
  subject: string

  isPrepared: boolean
  difficulty: ExamDifficulty
  announced: boolean


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


  muscoli: 50,
  media: 6,
  stanchezza: 0,
  figosita: 50,

  intelligenza: 10,

  psychStress: 0,


export const getDefaultGradesForSchoolType = (schoolType: SchoolType): SubjectGrades => {
  switch (schoolType) {
    case 'tecnico':
      return {
        matematica: 6.0,
        italiano: 6.0,

        edFisica: 6.0,
















































































































