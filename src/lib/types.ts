import type { TraitId } from '@/lib/character-traits'

export type Gender = 'maschio' | 'femmina'

export type Gender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export type RelationshipDifficulty = 'facile' | 'media' | 'difficile'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type ThemeVariant = 'default' | 'dark' | 'green'

export type DayType = 'feriale' | 'weekend'

  figosita: number

export type ThemeVariant = 'default' | 'dark' | 'green'

}
  intelligenza: number
  coattaggine: number
  muscoli: number
export interface G
  carisma: number
  reputazione: number
  stanchezza: number
export interfac
  media: number
}

  unlocked: boolean
}
e

  preference: RelationshipP
  isActive: b
  lastInteracti

 

  announced: boolean

  name: string
  traits: TraitId[]

  condotta: number
 

}
export const SUBJECT_WE
    matematic
    informatica: 1.5,
    italiano: 1.0,
    edFisica: 0.7
 

    chimica: 1.4,
    edFisica
  artistico: {
    storia_arte: 1
    italiano: 1.1,
    edFisica: 0.7
  unlocked: boolean
  lastInteraction?: number
}

export interface Relationship {
  id: string
  name: string
  difficulty: RelationshipDifficulty
  preference: RelationshipPreference
  relationshipLevel: number
  isActive: boolean
  attraction: number
  lastInteraction?: number
}

export interface ScheduledExam {
  subject: string
  daysUntil: number
  difficulty: ExamDifficulty
  isPrepared: boolean
  announced: boolean
}

export interface PlayerProfile {
  name: string
  gender: Gender
  traits: TraitId[]
}

export interface SchoolRecord {
  condotta: number
  assenze: number
  note: number
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays: number
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  tecnico: {
    matematica: 1.5,
    fisica: 1.4,
    informatica: 1.5,
    elettronica: 1.3,
    italiano: 1.0,
    inglese: 1.0,
    edFisica: 0.7
  },
  agraria: {
    matematica: 1.2,
    scienze: 1.5,
    agronomia: 1.6,
    chimica: 1.4,
    italiano: 1.0,
    edFisica: 0.8
  },
  artistico: {
    arte: 1.7,
    storia_arte: 1.5,
    disegno: 1.6,
    italiano: 1.1,















































































