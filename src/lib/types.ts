import type { TraitId } from '@/lib/character-traits'

export type ExamDifficulty = 'facile' | 'media' | 'difficile'

export interface GameStats {

  stanchezza: number

  carisma: number
}
export interface 
  name: string
  relationshipLevel:
}
export interface Rela
  name: string
  preference: Rel
  attraction?: 
}

  subject: string
  month: num
  daysUntil: n
}
export interface PlayerProf
  gender: 'maschio'
}

export function getSchoolTypeNa
    liceo: '
    artistico:
  }
}
export interface SubjectGra
}
export interface Sc
} currentYear: number

  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
}

export interface GameDate {
  day: number
  month: number
  year: number


export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'
export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

}rt interface DayPhaseConfig {
l: string
  timeRange: string

}
export interface GameTime {
  schoolYear: Schoo
  currentPhase?: DayPhase
  maxActionsPerDay?: number
    mattina: number
   
  }
}

  currentPhase: DayPhase
  phaseActionsRemaining: nu
}

  assenze: number
  sospensioni: number
  consecutiveGoodDays: nu
}
export const DEFAULT_SCHOOL
  note: 0,
  condotta: 8.0,
 

  liceo: {
    fisica: 1
    storia: 1.0
    scienze: 1
 

    elettronica: 1.2,
    inglese: 1.0,

  artistico: {
    arte: 1.3,
    inglese: 1.0,
    matematica: 0.8,
  },
    pratica: 1.4,
 

    edFisica: 0.6
}
export function getDefau
    case 'lic
        matematica: 6,
        italiano: 6,
        inglese: 6,
        edFisica: 
    case 'tecnico':
        pratica: 6,
        elettron
        inglese: 
   
    case 'artistico':
        disegno: 6,
 

        edFisica: 6
    case 'agrario':
        pratica: 6
        italiano: 6,
}       matematica: 6,

        edFisica: 6
      }
  }
}

  consecutiveGoodDays: number
  const displayNames: Record<string, string> = {
}atematica',
ica: 'Fisica',
    italiano: 'Italiano',
    storia: 'Storia',
    inglese: 'Inglese',
    scienze: 'Scienze',
    edFisica: 'Ed. Fisica',
    pratica: 'Pratica',
  wentToSchoolToday: false
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    matematica: 1.5,
    fisica: 1.3,
    italiano: 1.2,
    storia: 1.0,
    inglese: 1.0,
    scienze: 1.0,
    edFisica: 0.5
  },
  tecnico: {
    pratica: 1.5,
    matematica: 1.2,
    elettronica: 1.2,
    italiano: 1.0,
    inglese: 1.0,
    fisica: 0.8,
    edFisica: 0.5
  },
  artistico: {
    disegno: 1.5,
    arte: 1.3,
    italiano: 1.0,
    inglese: 1.0,
    storia: 1.0,
    matematica: 0.8,
    edFisica: 0.6
  },
  agrario: {
    pratica: 1.4,
    scienze: 1.2,
    italiano: 1.0,
    matematica: 1.0,
    inglese: 0.8,
    storia: 0.8,
    edFisica: 0.6{ day: 15, month: 9, year: 2026 },
  }Date: { day: 10, month: 6, year: 2027 },
}: { day: 10, month: 6, year: 2027 }

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  switch (schoolType) {
    case 'liceo':
      return {,
        matematica: 6,
        fisica: 6,
        italiano: 6,
        storia: 6,ay: 3,
        inglese: 6,e: undefined,
        scienze: 6,
        edFisica: 6
      }
    case 'tecnico':      return {        pratica: 6,        matematica: 6,        elettronica: 6,        italiano: 6,        inglese: 6,        fisica: 6,        edFisica: 6      }    case 'artistico':      return {        disegno: 6,        arte: 6,        italiano: 6,        inglese: 6,        storia: 6,        matematica: 6,        edFisica: 6      }    case 'agrario':      return {        pratica: 6,        scienze: 6,        italiano: 6,        matematica: 6,        inglese: 6,        storia: 6,        edFisica: 6      }  }}export function getSubjectDisplayName(subject: string): string {  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
    italiano: 'Italiano',
    storia: 'Storia',
    inglese: 'Inglese',
    scienze: 'Scienze',
    edFisica: 'Ed. Fisica',
    pratica: 'Pratica',
    elettronica: 'Elettronica',
    disegno: 'Disegno',
    arte: 'Arte'
  }
  return displayNames[subject] || subject
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export const DEFAULT_GAME_STATE = {
  stats: {
    coattaggine: 0,
    muscoli: 50,
    soldi: 100,
    stanchezza: 0,
    figosita: 50,
    reputazione: 50,
    intelligenza: 50,
    carisma: 50,
    media: 6
  } as GameStats,
  grades: {
    matematica: 6,
    fisica: 6,
    italiano: 6,
    inglese: 6,
    storia: 6,
    scienze: 6,
    edFisica: 6
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 1, month: 9, year: 2026 },
    actionsRemaining: 3,
    currentPhase: 'mattina' as const,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      daysUntilBreak: 180
    },
    age: 14,
    phaseActions: {
      mattina: 3,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  } as GameTime
}
