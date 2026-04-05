import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  muscoli: number
  carisma: number
  reputazione: number
  intelligenza: n
  soldi: number
  relationshipLeve
  carisma: number

  name: string
 


  subject: str
  difficulty: number
}
export type Schoo
e

    artistico: 'Istituto Artist
  }
}
export interface Subj
}

  isSchoolPeriod: boolean

export interface SchoolRecord {
  assenze: number
  condotta: number
  consecutiveGoodDay

 

  sospensioni: 0,

export function getDefaultGradesForSchoolType(schoolType: SchoolTyp
    case 'liceo':
        matematica: 6,
        italiano: 6,
        storia: 6,
        edFisica: 6,
   
        matematica: 6,
 

        edFisica: 6,
    case 'artistico':
 

        storia: 6,
      }
      return {
        scienze: 6,
 

  }

  const displayNa
    fisica: 'F
    inglese: 'Ingl
    scienze: 'Scienze
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
  traits: TraitId[]

  stats: GameStats
  gameTime: GameTim

  stats
    coattaggine: 50
    soldi: 100
    intelligenza: 50,
    carisma: 50,
  },
    matematica: 6,
    italiano: 6,
    storia: 6,
    edFisica: 6,
  gameT
    currentPhase: 'ma
    schoolYear
      isSchoolPe
    },
      mattina: 2,
      sera: 2,
    }
}











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
