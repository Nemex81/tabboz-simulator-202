import type { TraitId } from '@/lib/character-traits'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

  | 'Sfigato'

  | 'Leggenda'
export type Frien
  | 'Sfigato'
  | 'Normale'
  | 'Abbastanza Figo' 
  | 'Figo'
  | 'Leggenda'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle'

export type ExamDifficulty = 'facile' | 'media' | 'difficile'

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface GameStats {
  coattaggine: number
  muscoli: number
  soldi: number
  media: number
  stanchezza: number
  figosita: number
  reputazione: number
  id: string
  carisma: number
}

  isActive: boolean
  id: string
  name: string
  type: FriendType
  difficulty: Exam
  intelligenza: number
  unlocked: boolean
}

export interface Relationship {
}
  name: string
  difficulty: 'facile' | 'media' | 'difficile'
  preference: RelationshipPreference
  relationshipLevel: number
  attraction?: number
  isActive: boolean
}

export interface ScheduledExam {
  sospension
  subject: string
  difficulty: ExamDifficulty
  daysUntil: number
  day: number
}

export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  traits: TraitId[]
}

    matematica: 1.5,
    fisica: 1.3,
    italiano: 1.0
    storia: 0.
  },
    pratica: 1.5,
    matematica: 1.0,
 

    disegno: 1.5,
    arte: 1.3,
    inglese: 
    edFisi
  agraria: {
    pratica: 1.4,
    matematica: 1.0,
 

export const DEFAULT_GAME_S
    coattaggi
    soldi: 100,
    stanchezza
 

  grades: {
    italiano: 6,
    edFisica: 6
  gameTime: {
    actionsRemaining: 3,
    schoolYear: {
 

    },
    age: 14,
    phaseActions: {
      pomeriggio: 2,
      notte: 1
  } as GameTi

  const baseGrade = 6
    case 'liceo':
        matematica
        inglese: ba
        storia: baseGr
        fisica: 
      }
   
 

        inglese: baseGrade,
        edFisica: baseGrade
 

        inglese: baseGrade,
        st
      }
      return {
        storia_ar
        italiano: b
        matemati
      }
      return {
        pratica: 
    
        edFi
  }

  const displayN
    italiano: 'Italia
    inglese: 'Ingl
    scienze: 'Sci
    edFisica: 'E
    elettronica: 
    
    arte: 'Arte'
  return displayN













































































































































