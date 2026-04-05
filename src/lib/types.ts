import type { TraitId } from '@/lib/character-traits'

  coattaggine: number
  media: number
  muscoli: number
  intelligenza:
}
export type Reputati
  muscoli: number
  reputazione: number
  intelligenza: number
  carisma: number
}

export type ReputationLevel =
  | 'Sfigato Totale'
export type S
  | 'Coatto Base'

  | 'Popolare'
  | 'Leggenda del Quartiere'

export type SchoolType = 'liceo' | 'tecnico' | 'professionale' | 'artistico'

export type SubjectGrades = {
  [subject: string]: number
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    storia: 0.8,
    italiano: 1.5,
    disegno: 1.7
    italiano: 1.2
    inglese: 1.0
  }

  currentYear: nu
  schoolEndDate: {

  da
  year: numb

export type DayT
export interface G
  schoolYear: Sc
  age: number
  extraActions?: 


  subject: string
  is
  announced: boole


  name: string
  traits?: TraitId[]


  assenze: numbe
  condotta: numbe
  we
}
export interfa
    disegno: 1.7,
    storia_arte: 1.5,
    italiano: 1.2,
    matematica: 0.8,
    inglese: 1.0,
    edFisica: 0.7
  }
}

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  schoolEndDate: { day: number; month: number }
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'
export type DayType = 'feriale' | 'sabato' | 'domenica'

export interface GameTime {
  currentDate: GameDate
  schoolYear: SchoolYear
  currentPhase: DayPhase
  age: number
  phaseActionsRemaining: number
  extraActions?: number
}

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export interface ScheduledExam {
  subject: string
  daysUntil: number
  isPrepared: boolean
  difficulty: ExamDifficulty
  announced: boolean
}

export type PlayerGender = 'maschio' | 'femmina'

export interface PlayerProfile {
  wentToSchool
  gender: PlayerGender
  traits?: TraitId[]
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface SchoolRecord {
  assenze: number
  note: number
  condotta: number
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays: number
}

export interface Friend {
    phaseAct
  name: string
  affinity: number
  intelligence?: number
  charisma?: number
  lastInteraction?: number
}

export interface Relationship {
  id: string
  name: string
  attractiveness: number
  successChance: number
  metAt?: string
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
    italiano: 'Itali
  gameOver: boolean
  gameOverReason: string
  schoolType?: SchoolType
  playerProfile?: PlayerProfile
  friends?: Friend[]
    informatica: 'Informatica',
  scheduledExams?: ScheduledExam[]
  schoolRecord?: SchoolRecord
}

export const DEFAULT_STATS: GameStats = {
}
  carisma: 10,
  coattaggine: 50,
  intelligenza: 50,
  reputazione: 0,
  muscoli: 30,

  media: 6,
  stanchezza: 0
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {

  condotta: 8.0,

  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0


export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,

    matematica: 6,

    storia: 6,
    edFisica: 6
  },

    age: 14,
    currentDate: { day: 15, month: 9, year: 2025 },
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolEndDate: { day: 10, month: 6 }
    },

    phaseActionsRemaining: 2
  },
  gameOver: false,

}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const baseGrade = 6
  const subjects: Record<SchoolType, string[]> = {
    liceo: ['matematica', 'italiano', 'fisica', 'inglese', 'storia', 'latino', 'filosofia', 'scienze', 'edFisica', 'arte'],
    tecnico: ['matematica', 'fisica', 'italiano', 'storia', 'informatica', 'scienze', 'elettronica', 'inglese', 'edFisica'],
    professionale: ['matematica', 'italiano', 'laboratorio', 'tecnologia', 'economia', 'inglese', 'storia', 'edFisica'],
    artistico: ['arte', 'disegno', 'storia_arte', 'italiano', 'matematica', 'inglese', 'edFisica']


  return subjects[schoolType].reduce((acc, subject) => {
    acc[subject] = baseGrade
    return acc
  }, {} as SubjectGrades)


export function getSubjectDisplayName(subject: string): string {
  const names: Record<string, string> = {

    italiano: 'Italiano',
    fisica: 'Fisica',
    inglese: 'Inglese',

    latino: 'Latino',
    filosofia: 'Filosofia',
    scienze: 'Scienze',
    edFisica: 'Ed. Fisica',
    arte: 'Arte',
    informatica: 'Informatica',
    elettronica: 'Elettronica',

    tecnologia: 'Tecnologia',
    economia: 'Economia',
    disegno: 'Disegno',
    storia_arte: 'Storia dell\'Arte'
  }
  return names[subject] || subject
}

export interface GamePreferences {
  theme: ThemeVariant
}
