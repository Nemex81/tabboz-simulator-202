import type { TraitId } from '@/lib/character-traits'

export type SchoolType = 'liceo' | 'tecnico' | 'professionale' | 'artistico'

export interface GameStats {
  coattaggine: number
  muscoli: number
  media: number
  soldi: number
  stanchezza: number
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
}

export type SubjectGrades = Record<string, number>

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    filosofia: 1.1,
    latino: 1.2,
    inglese: 1.0,
    edFisica: 0.7
  },
  tecnico: {
    fisica: 1.3,
    informatica: 1.4,
    scienze: 1.0,
    edFisica: 0.7
  },
  professionale: {
    matematica: 0.9,
    laboratorio: 1.5,
    economia: 1.1,
    storia: 0.8,
    edFisica: 0.7
  },
  artistico: {
    arte: 1.7,
    storia_arte: 1.3,
    matematica: 0.8,
    edFisica: 0.7
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
}

export interface GameTime {
  currentDate: GameDate
  actionsRemaining: number
  maxActionsPerDay: number
  schoolYear: SchoolYear
  age: number
  lastPaghettaDate?: GameDate
  extraActions: number
  phaseActionsRemaining?: number
}

export interface Friend {
  id: string
  name: string
  type: 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'
  intelligence?: number
  lastInteraction?: GameDate
}

export interface Relationship {
  id: string
  name: string
  attractiveness: number
  difficulty: number
  attempts: number
}

export interface ScheduledExam {
  id: string
  subject: string
  date: GameDate
  difficulty: number
  prepared: boolean
  preparationLevel: number
}

export interface SchoolRecord {
  condotta: number
  assenze: number
  note: number
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays: number
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  condotta: 7.0,
  assenze: 0,
  note: 0,
  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0
}

export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  traits: TraitId[]
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameTime: GameTime
  gameOver: boolean
  gameOverReason: string
  playerProfile?: PlayerProfile
  scheduledExams?: ScheduledExam[]
}

export const DEFAULT_STATS: GameStats = {
  coattaggine: 50,
  muscoli: 50,
  media: 6,
  soldi: 50,
  stanchezza: 0,
  figosita: 50,
  reputazione: 50,
  intelligenza: 10,
  carisma: 10
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,
  grades: {
    matematica: 6,
    italiano: 6,
    storia: 6,
    inglese: 6
  },
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2024 },
    actionsRemaining: 3,
    maxActionsPerDay: 3,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2024 },
      schoolEndDate: { day: 10, month: 6, year: 2025 },
      reportCardDate: { day: 10, month: 6, year: 2025 }
    },
    age: 14,
    extraActions: 0,
    phaseActionsRemaining: 2
  },
  gameOver: false,
  gameOverReason: ''
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType, baseGrade: number = 6): SubjectGrades {
  const subjects: Record<SchoolType, string[]> = {
    liceo: ['matematica', 'fisica', 'italiano', 'storia', 'filosofia', 'latino', 'inglese', 'scienze', 'edFisica'],
    tecnico: ['matematica', 'fisica', 'italiano', 'storia', 'informatica', 'scienze', 'elettronica', 'inglese', 'edFisica'],
    professionale: ['matematica', 'italiano', 'laboratorio', 'tecnologia', 'economia', 'inglese', 'storia', 'edFisica'],
    artistico: ['matematica', 'italiano', 'storia', 'inglese', 'arte', 'storia_arte', 'disegno', 'edFisica']
  }

  const grades: SubjectGrades = {}
  subjects[schoolType].forEach(subject => {
    grades[subject] = baseGrade
  })
  return grades
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
    italiano: 'Italiano',
    storia: 'Storia',
    filosofia: 'Filosofia',
    latino: 'Latino',
    inglese: 'Inglese',
    scienze: 'Scienze',
    edFisica: 'Ed. Fisica',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    laboratorio: 'Laboratorio',
    tecnologia: 'Tecnologia',
    economia: 'Economia',
    arte: 'Arte',
    storia_arte: 'Storia dell\'Arte',
    disegno: 'Disegno'
  }
  return displayNames[subject] || subject
}
