import type { TraitId } from '@/lib/character-traits'

  muscoli: number
  media: number
  muscoli: number
  soldi: number
  media: number
  stanchezza: number
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number


    filosofia: 1.1,
    inglese: 
    edFisica: 0.
  tecnico: {
    fisica: 1.3,

    scienze: 1.0,

  },
    matema
    laboratorio: 1.5
    economia: 1.
    storia: 0.8,
  },
    arte: 1.7,
    storia_arte:
    matematica: 0
    edFisica: 0.7
}
expo
}
export interface Gam
  month: number
}
export interface
  isSchoolPeriod: boo
  schoolEndDate: 
}
export interface 
  actionsRemainin
  sc
  lastPaghettaDate
  phaseActionsRemain

  id: string
  type: 'coatto' | '
  lastInteraction?

  id: string
  attractiveness:
  at

  id: string
  date: GameDate
  prepared: boolean
}
export interface Sch
  assenze: number
  sospensioni: nu
  c


  note: 0,
  wentToSchoolToday: false,
}

  gender: 'maschio' | 'femm
}
export type The
export interfa
 

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
 

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

  soldi: 50,

  stanchezza: 0,

  reputazione: 50,
  intelligenza: 10,
  carisma: 10
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,

    matematica: 6,

    storia: 6,

  },

    currentDate: { day: 15, month: 9, year: 2024 },
    actionsRemaining: 3,
    maxActionsPerDay: 3,

      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2024 },
      schoolEndDate: { day: 10, month: 6, year: 2025 },
      reportCardDate: { day: 10, month: 6, year: 2025 }
    },
    age: 14,
    extraActions: 0,
    phaseActionsRemaining: 2

  gameOver: false,
  gameOverReason: ''
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType, baseGrade: number = 6): SubjectGrades {

    liceo: ['matematica', 'fisica', 'italiano', 'storia', 'filosofia', 'latino', 'inglese', 'scienze', 'edFisica'],
    tecnico: ['matematica', 'fisica', 'italiano', 'storia', 'informatica', 'scienze', 'elettronica', 'inglese', 'edFisica'],
    professionale: ['matematica', 'italiano', 'laboratorio', 'tecnologia', 'economia', 'inglese', 'storia', 'edFisica'],



































