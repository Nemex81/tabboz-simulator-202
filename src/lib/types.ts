import type { TraitId } from '@/lib/character-traits'

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

  coattaggine: number
  soldi: number

  reputazione: number
  carisma: number

  [subject: str

  day: number
  year: number

  currentYear: number
  carisma: number
 

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
  name: string
  affinita: number
  lastInteraction?: number


  attraction: number
  lastInteraction?: num

  subject: string
  isPrepared: boolean
  announced: boolean


 

    filosofia: 1.1,
    inglese: 1
  },
    matematica: 1.4
 

    edFisica: 0.7
  professionale: {
    laboratorio: 
    tecnologia
    storia: 0.8,
  },
    arte: 1.7,
 

  }

  coattaggine:
  soldi: 100,
  stanchezza: 0,
  reputazione: 50,
  carisma: 10


  note: 0,
  wentToScho
}
export const DEFAULT
  grades: {
    matematica: 6,
 

    currentDate: { day: 15, mont
    schoolYear: {
      isSchoolPerio
      schoolEndDate: 
    },
    maxActionsPerDay
 



  professionale: ['matematica', 'laboratorio', 'economia', 'tecnologia', 'it
}
export function getD
  return subjects.
    return acc
}
export function 
    matematica: '
    latino: 'Lati
    
    edFisica
    informatica: 'In
    laboratorio:
    tecnologia: 'Tecn
    storia_arte: 'Sto
  }
}






















  coattaggine: 50,
  muscoli: 50,
  soldi: 100,
  media: 6,
  stanchezza: 0,
  figosita: 50,
  reputazione: 50,
  intelligenza: 10,
  carisma: 10
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  condotta: 8.0,
  assenze: 0,
  note: 0,
  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0
}

export const DEFAULT_GAME_STATE = {
  stats: DEFAULT_STATS,
  grades: {
    italiano: 6,
    matematica: 6,
    storia: 6,
    inglese: 6,
    edFisica: 6
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2026 },
    age: 14,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2026 },
      schoolEndDate: { day: 10, month: 6, year: 2027 },
      reportCardDate: { day: 10, month: 6, year: 2027 }
    },
    actionsRemaining: 3,
    maxActionsPerDay: 3,
    currentPhase: 'mattina' as const,
    extraActions: 0
  } as GameTime,
  gameOverReason: ''
}

export const SCHOOL_SUBJECTS: Record<SchoolType, string[]> = {
  liceo: ['matematica', 'italiano', 'latino', 'filosofia', 'storia', 'inglese', 'edFisica'],
  tecnico: ['matematica', 'fisica', 'informatica', 'elettronica', 'italiano', 'inglese', 'edFisica'],
  professionale: ['matematica', 'laboratorio', 'economia', 'tecnologia', 'italiano', 'storia', 'edFisica'],
  artistico: ['arte', 'storia_arte', 'disegno', 'italiano', 'matematica', 'edFisica']
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const subjects = SCHOOL_SUBJECTS[schoolType]
  return subjects.reduce((acc, subject) => {
    acc[subject] = 6
    return acc
  }, {} as SubjectGrades)
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    italiano: 'Italiano',
    latino: 'Latino',
    filosofia: 'Filosofia',
    storia: 'Storia',
    inglese: 'Inglese',
    edFisica: 'Ed. Fisica',
    fisica: 'Fisica',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    laboratorio: 'Laboratorio',
    economia: 'Economia',
    tecnologia: 'Tecnologia',
    arte: 'Arte',
    storia_arte: 'Storia dell\'Arte',
    disegno: 'Disegno'
  }
  return displayNames[subject] || subject
}
