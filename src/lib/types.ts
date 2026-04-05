import type { TraitId } from '@/lib/character-traits'

  figosita: number
  coattaggine: nu
  media: number
  intelligenza: numb
}
export interfac
  media: number
  reputazione: number
  intelligenza: number
  carisma: number
}

export interface ScheduledExam {
  id: string
  subject: string
  date: { day: number; month: number; year: number }

  prepared: boolean
 

export type SchoolType = 'liceo' | 'tecnico' | 'artistico'

export interface SubjectGrades {
  [subject: string]: number
}


  day: number
  month: number
  year: number
 


  currentYear: number
  isSchoolPeriod: boolean
  daysUntilBreak: number
  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export interface PhaseActions {
  mattina: number
  pomeriggio: number
}
export interfac
 

export type ThemeVariant = 
export type ReputationL
export const SUBJECT_WEI
    matematic
    italiano: 1.0,
    storia: 1.0,
    edFisica: 0.8
  tecnico: {
    fisica: 1.5,
    inglese: 1.2,
 

    matematica: 0.8,
    italiano: 1.2,
    storia: 1.5,
    edFisica: 
}
export function getDe
    case 'liceo':
 

        storia: 6,
        edFisica: 6
    case 'tec
        ma
        italiano
        storia: 6
        edFisica: 6
 

        italiano: 6,
        stor
        edFisi
  }

  const displayNames: 
 

    scienze: 'Scienze',
  }
}
export interface GameState {
  grades: SubjectGrades
}
e

    figosita: 50,
    media: 6,
    reputazione: 50,
    carisma: 10
 

    inglese: 6,

  },

    maxActionsPerDay: 3,
      curr
      daysUntilBreak
      schoolEndD
    },
    extraActions:
    phaseActions
      pomeriggio:
      notte: 1
  }

























        fisica: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        scienze: 6,

      }





















}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
    italiano: 'Italiano',
    inglese: 'Inglese',
    storia: 'Storia',

    edFisica: 'Ed. Fisica'

  return displayNames[subject] || subject



  stats: GameStats

  gameTime: GameTime


export const DEFAULT_GAME_STATE: GameState = {
  stats: {
    muscoli: 50,
    coattaggine: 50,








































