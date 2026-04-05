import type { TraitId } from '@/lib/character-traits'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type SchoolType = 'liceo' | 'tecnico' | 'professionale' | 'agraria' 

export type ReputationLevel = 

  | 'Abbastanza Figo' 

export interface GameStats {
  coattaggine: number
  soldi: number
  stanchezza: numbe
  intelligenza: number
}
export interface Frien

  affinita: number
  unlocked: boolea

  id: string
  difficulty: '
  relationshipL
  attraction: number

  subject: string
  difficulty: Exa
 

  name: string
}
export interfa
  assenze: number
  sospensioni: num
  consecutiveGoodDays: 

 


  currentYea
  schoolStartD
  reportCardDate: GameDate

  currentDate: GameDate
  maxActionsPerDay:
  age: number
 

    pomeriggio: number
    notte: number
}
export interface SubjectGrad
}
export const SUBJECT
 

    storia: 1.0,
    fisica: 1.
  },
 

    italiano: 1.0,
    storia: 0.8,
  assenze: number
  note: number
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays: number
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
  phase?: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
  phaseActions?: {
    mattina: number
    pomeriggio: number
    sera: number
    notte: number
  }
}

export interface SubjectGrades {
  [subject: string]: number
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    matematica: 1.5,
    italiano: 1.3,
    inglese: 1.3,
    filosofia: 1.2,
    storia: 1.0,
    scienze: 1.0,
    fisica: 1.0,
    edFisica: 0.7
  },
  tecnico: {
    matematica: 1.5,
    informatica: 1.5,
    fisica: 1.3,
    elettronica: 1.3,
    italiano: 1.0,
    inglese: 1.0,
    storia: 0.8,
    edFisica: 0.7
  },
  professionale: {
      schoolEndDa
    },
    extraActions:
    phaseActions: {
      pomeriggio
      notte: 1
  } 

  const baseGrade
  switch (schoolType)
      return {
        italiano: ba
        inglese: 
        scienze: 
    
    case 'te
        matematic
        fisica: b
        italiano: 
        storia: base
      }
      return {
   
 

    case 'artistico':
        disegno:
        arte:
        in
        edFisica:
    case 'agraria':
        scienze: baseGra
 

      }
}
export function getS
    matematica: 
    storia: 'Stor
    filosofia: 'Filos
    fisica: 'Fis
    informatica: 'In
    pratica: 'P
    storia_ar
  }
}











































        fisica: baseGrade,
        edFisica: baseGrade
      }
    case 'tecnico':
      return {
        matematica: baseGrade,
        informatica: baseGrade,
        fisica: baseGrade,
        elettronica: baseGrade,
        italiano: baseGrade,
        inglese: baseGrade,
        storia: baseGrade,
        edFisica: baseGrade
      }
    case 'professionale':
      return {
        pratica: baseGrade,
        italiano: baseGrade,
        inglese: baseGrade,
        matematica: baseGrade,
        storia: baseGrade,
        edFisica: baseGrade
      }
    case 'artistico':
      return {
        disegno: baseGrade,
        storia_arte: baseGrade,
        arte: baseGrade,
        italiano: baseGrade,
        inglese: baseGrade,
        matematica: baseGrade,
        edFisica: baseGrade
      }
    case 'agraria':
      return {
        scienze: baseGrade,
        pratica: baseGrade,
        italiano: baseGrade,
        matematica: baseGrade,
        inglese: baseGrade,
        edFisica: baseGrade
      }
  }
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    italiano: 'Italiano',
    storia: 'Storia',
    inglese: 'Inglese',
    filosofia: 'Filosofia',
    scienze: 'Scienze',
    fisica: 'Fisica',
    edFisica: 'Ed. Fisica',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    pratica: 'Pratica',
    disegno: 'Disegno',
    storia_arte: 'Storia dell\'Arte',
    arte: 'Arte'
  }
  return displayNames[subject] || subject
}
