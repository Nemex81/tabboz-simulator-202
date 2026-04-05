import type { TraitId } from '@/lib/character-traits'

export type SchoolType = 'liceo' | 'tecnico' | 'professionale' | 'artistico'

  soldi: number
  figosita: number
  intelligenza: n
}
  soldi: number
  stanchezza: number
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
 

    matematica: 0.9,

    edFisica: 0.7
  artistic
    storia_arte: 1.
    edFisica: 0.
}
export interface 
  mo
}
export interface
  isSchoolPeriod: boo
  schoolEndDate: 
}
expo
  actionsRemaining
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
  playerProfile?: Player
}
export const DEFAULT_STATS: G
  muscoli: 50,
  soldi: 50,
 

}
export const
  grades: {
    italiano: 6,
    inglese: 6
  gameTime: {
 

      isSchoolPeriod: true,
      school
    },
    extraActions: 0,
  },
  gameOverReason: 


    tecnico: ['matematica', 'fis
    artistic

  subjects[schoo
  })
}
export function getSubject
 

    filosofia: 'Filosofia',
    inglese: 'Ingl
    edFisica: 'Ed
    elettronic
    tecnologia: 'Tecn
    arte: 'Arte',
    disegno: 'Disegno'
 








































































































