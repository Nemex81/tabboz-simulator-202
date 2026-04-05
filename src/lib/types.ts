import type { TraitId } from '@/lib/character-traits'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type ExamDifficulty = 'facile' | 'media' | 'difficile'

export type FriendType = 'secchione' | 'sportivo' | 'artista' | 'normale'

export interface GameStats {
  coattaggine: number
  muscoli: number
  soldi: number
  stanchezza: number
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
  media: number
}

export interface Friend {
  id: string
  name: string
  type: FriendType
  relationshipLevel: number
  isActive: boolean
}

export interface Relationship {
  id: string
  name: string
  difficulty: 'facile' | 'media' | 'difficile'
  preference: RelationshipPreference
  relationshipLevel: number
  attraction?: number
  isActive: boolean
}

export interface ScheduledExam {
  id: string
  subject: string
  day: number
  month: number
  difficulty: ExamDifficulty
  daysUntil: number
  preparationLevel: number
}

export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  traits: TraitId[]
}

export type SchoolType = 'liceo' | 'tecnico' | 'artistico' | 'agrario'

export interface SubjectGrades {
  [subject: string]: number
}

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  daysUntilBreak: number
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export interface GameTime {
  currentDate: GameDate
  schoolYear: SchoolYear
  age: number
  currentPhase: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
  actionsRemaining: number
  phaseActions: {
    mattina: number
    pomeriggio: number
    sera: number
    notte: number
  }
}

export interface SchoolRecord {
  assenze: number
  note: number
  sospensioni: number
  condotta: number
  consecutiveGoodDays: number
  wentToSchoolToday: boolean
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  note: 0,
  sospensioni: 0,
  condotta: 8.0,
  consecutiveGoodDays: 0,
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
    edFisica: 0.6
  }
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  switch (schoolType) {
    case 'liceo':
      return {
        matematica: 6,
        fisica: 6,
        italiano: 6,
        storia: 6,
        inglese: 6,
        scienze: 6,
        edFisica: 6
      }
    case 'tecnico':
      return {
        pratica: 6,
        matematica: 6,
        elettronica: 6,
        italiano: 6,
        inglese: 6,
        fisica: 6,
        edFisica: 6
      }
    case 'artistico':
      return {
        disegno: 6,
        arte: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        matematica: 6,
        edFisica: 6
      }
    case 'agrario':
      return {
        pratica: 6,
        scienze: 6,
        italiano: 6,
        matematica: 6,
        inglese: 6,
        storia: 6,
        edFisica: 6
      }
  }
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
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
