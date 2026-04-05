import type { TraitId } from '@/lib/character-traits'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type Gender = 'maschio' | 'femmina'

export type RelationshipDifficulty = 'facile' | 'media'

export type Gender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export type RelationshipDifficulty = 'facile' | 'media' | 'difficile'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type TimePhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'weekend'

}
  coattaggine: number
  muscoli: number
  soldi: number
export interfac
  stanchezza: number
  figosita: number
  reputazione: number
export interface Schoo
  carisma: number
 

  type: FriendType
  intelligenza?: number
 

  id: string
  difficulty:
  relationshipL
  attraction: 
}

  daysUntil: number
  isPrepared: boolean
}
export interface PlayerProf
  gender: Gender
}
e

  sospensioni: number
  consecutiveGoodDays: 

  tecnico: {
    fisica: 1.4,
    elettroni
    inglese: 1.0,
  },
    matematica: 1.2,
 

  },
    arte: 1.
    disegno: 1
  type: FriendType
  affinita: number
  intelligenza?: number
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
    matematica: 0.9,
    edFisica: 0.7
exp
}

export const DEFAULT_STATS: GameStats = {
    storia: 'Stori
  muscoli: 50,
    fisica: '
  media: 6,
  stanchezza: 0,
  figosita: 50,
  reputazione: 50,
  intelligenza: 10,
    scienze: 
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  condotta: 8.0,
  assenze: 0,

  sospensioni: 0,

  consecutiveGoodDays: 0


export const DEFAULT_GAME_STATE = {
  stats: DEFAULT_STATS,

    italiano: 6,

    storia: 6,
    inglese: 6,
    edFisica: 6
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2026 },
    age: 14,

      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2026 },
      schoolEndDate: { day: 10, month: 6, year: 2027 },
















































