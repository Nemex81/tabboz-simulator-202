import type { TraitId } from '@/lib/character-traits'

export interface GameStats {

export interface GameStats {
  muscoli: number
  coattaggine: number
  reputazione: number
  carisma: numb
}
export interface F
  relationshipLevel: n
  carisma: number

 

export interface Friend {
  name: string
  relationshipLevel: number
  intelligenza: number
  carisma: number
}

export interface Relationship {
  name: string
  preference: RelationshipPreference
  attraction?: number
}

export type RelationshipPreference = 'muscoli' | 'intelligenza' | 'figosita' | 'coattaggine' | 'carisma'

export interface ScheduledExam {
export type Schoo
export function get
    liceo: 'Liceo Scientific
    artistico: 'Ist
 

export interface SubjectGrades {
}
export interface SchoolYear {
  isSchoolPeriod: bo
}

  assenze: number

  consecutiveGoodDays: number

  wentToSchoolToday: false,
  note: 0,
  sospensioni: 0,
}
  }
  return names[schoolType]
}

export interface SubjectGrades {
  [subject: string]: number
}

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  daysUntilBreak: number
}

export interface SchoolRecord {
  wentToSchoolToday: boolean
  assenze: number
  note: number
  condotta: number
  sospensioni: number
  consecutiveGoodDays: number
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  wentToSchoolToday: false,
  assenze: 0,
  note: 0,
  condotta: 8.0,
  sospensioni: 0,
  consecutiveGoodDays: 0
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  switch (schoolType) {
    case 'liceo':
      return {
        matematica: 6,
        fisica: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        scienze: 6,
        edFisica: 6,
      }
    case 'tecnico':
      return {
        matematica: 6,
        fisica: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        informatica: 6,
        edFisica: 6,
      }
    case 'artistico':
      return {
        arte: 6,
        disegno: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        edFisica: 6,
      }
    case 'agrario':
      return {
        pratica: 6,
        scienze: 6,
        matematica: 6,
        italiano: 6,
        storia: 6,
        edFisica: 6,
      }
  }
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
    italiano: 'Italiano',
    inglese: 'Inglese',
    storia: 'Storia',
    scienze: 'Scienze',
    pratica: 'Pratica',
    disegno: 'Disegno',
    arte: 'Arte',
    informatica: 'Informatica',
    edFisica: 'Ed. Fisica'
  }
  return displayNames[subject] || subject
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export interface PhaseActions {
  mattina: number
  pomeriggio: number
  sera: number
  notte: number
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export interface GameTime {
  currentDate: GameDate
  currentPhase: DayPhase
  age: number
  schoolYear: SchoolYear
  phaseActions: PhaseActions
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameTime: GameTime
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: {
    muscoli: 50,
    coattaggine: 50,
    reputazione: 50,
    soldi: 100,
    figosita: 50,
    intelligenza: 50,
    stanchezza: 0,
    carisma: 50,
    media: 6
  },
  grades: {
    matematica: 6,
    fisica: 6,
    italiano: 6,
    inglese: 6,
    storia: 6,
    scienze: 6,
    edFisica: 6,
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 1, month: 9, year: 2026 },
    currentPhase: 'mattina' as DayPhase,
    age: 14,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      daysUntilBreak: 30
    },
    phaseActions: {
      mattina: 2,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  } as GameTime
}
    reputazione: 50,
    soldi: 100,
    figosita: 50,
    intelligenza: 50,
    stanchezza: 0,
    carisma: 50,
    media: 6
  },
  grades: {
    matematica: 6,
    fisica: 6,
    italiano: 6,
    inglese: 6,
    storia: 6,
    scienze: 6,
    edFisica: 6,
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 1, month: 9, year: 2026 },
    currentPhase: 'mattina' as DayPhase,
    age: 14,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      daysUntilBreak: 30
    },
    phaseActions: {
      mattina: 2,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  } as GameTime
}
