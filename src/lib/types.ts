import type { TraitId } from '@/lib/character-traits'

export type FriendType = 'coatto' | 'secch

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type DayType = 'feriale' | 'weekend'

export type ExamDifficulty = 'easy' | 'medium' | 'hard'

export interface GameStats {

  coattaggine: number

  stanchezza: number

export interface SubjectGrades {

export interface GameDate {

}
export interfac
  isSchoolPeriod: 

  currentDate: GameDa
  age: number
  phaseActions: {
    pomeriggio: numbe
    notte: number
}
e

  friendshipLevel: number
  lastInteraction?: number


  difficulty: RelationshipD
  relationshi
  attraction: n
}
e

  isPrepared: boolean
}
export interface PlayerPr
 

export interface SchoolReco
  assenze: number
  sospensioni: number
  consecutive

  tecnico: {
    fisica: 1.4,
    elettronica: 1.3,
    inglese: 1.0
  },
   
 

  },
    arte: 1.
    disegno: 1
    edFisica: 0.7
}
export const DEFAUL
  assenze: 0,
 


  stats: {
    figosita: 
    coattaggine: 50,
    carisma: 50,
    stanchezza: 0,
  } as GameStats,
    matematica: 6.0,
    inglese: 6.0,
 

    schoolYear: { currentYear: 1
    phase: 'matti
      mattina: 3,
      sera: 2,
    }
}
e

    case 'tecnico':
        matema
        informat
        italiano: b
 

        matematica: baseGrade,
        agronomia:
        italiano:
      }
      return {
        storia_arte: baseGra
        italiano: baseGrade,
 

        italiano: baseGrade,
        fisi
      }
}
export function getSu
    matematica: 'Mate
    informatica: '
    italiano: 'It
    edFisica: 'Ed
    
    arte: 'A
    disegno: 'Disegn
  return displayN




















































































































