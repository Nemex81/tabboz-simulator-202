import type { TraitId } from '@/lib/character-traits'

export type ExamDifficulty = 'facile' | 'media' | 'difficile'

  stanchezza: number
  figosita: number
  intelligenza: n
}
export interface Fri
  relationshipLev
  carisma: number

  name: string
  attraction?: n


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
export function g
  month: number
    tecnico: 
  daysUntil: number
  difficulty: ExamDifficulty
  prepared: boolean


export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  traits?: TraitId[]
}

export type SchoolType = 'liceo' | 'tecnico' | 'artistico' | 'agrario'

export function getSchoolTypeName(schoolType: SchoolType): string {
  const names: Record<SchoolType, string> = {
    inglese: 1.0,
    tecnico: 'Istituto Tecnico',
    artistico: 'Istituto Artistico',
    agrario: 'Istituto Agrario'
  }
  return names[schoolType]
}

  },
  [subject: string]: number
 

export interface SchoolYear {
  currentYear: number

  wentToSchoolToday: boo
  note: number
 

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze:
  condotta: 8.0,
  consecutiveGoo

  switch (school
      return {
        fisica: 6
        storia: 6
    
      }
      return {
        pratica: 6
        italiano:
        storia: 6,
      }
      return {
        arte: 6,
    
        edFisi
    case 'agrario
        pratic
        matematica
        storia: 
        edFisica:
  }

  const disp
    fisica: 'Fisi
    storia: 'Stor
    scienze: 'Scienz
    pratica: 'Prat
    disegno: 'Di
  }
}
exp
e

    soldi: 100,
    figosita:
    intelligenz
    media: 6
 

    inglese: 6,

  } as SubjectGrades,
    currentDate: { day:
    currentPhase: 'mattina
      currentYear: 1,
      daysUntilBreak: 30
    },
    phaseActions:
      pomeriggio: 3
      notte: 1
  } as GameTime




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








































































































