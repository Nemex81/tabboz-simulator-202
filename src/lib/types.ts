import type { TraitId } from '@/lib/character-traits'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type DayType = 'feriale' | 'weekend'

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type SchoolType = 'liceo' | 'tecnico' | 'professionale' | 'artistico'

export type RelationshipDifficulty = 'facile' | 'media' | 'difficile'

export type ThemeVariant = 'default' | 'dark' | 'green'

export type ReputationLevel = 
  | 'Sfigato Totale' 
  | 'Nerd Anonimo' 
  | 'Tipo Normale' 
  | 'Abbastanza Figo' 
  | 'Re della Scuola' 
  | 'LEGGENDA VIVENTE'

export interface GameStats {
  figosita: number
  coattaggine: number
  muscoli: number
  intelligenza: number
  carisma: number
  soldi: number
  reputazione: number
  stanchezza: number
  media: number
}

export interface SubjectGrades {
  [subject: string]: number
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
}

export interface GameTime {
  currentDate: GameDate
  age: number
  schoolYear: SchoolYear
  phase: DayPhase
  phaseActions: {
    mattina: number
    pomeriggio: number
    sera: number
    notte: number
  }
}

export interface Friend {
  id: string
  name: string
  type: FriendType
  affinita: number
  intelligenza: number
  unlocked: boolean
  friendshipLevel: number
  lastInteraction?: number
  traits?: TraitId[]
}

export interface Relationship {
  id: string
  name: string
  difficulty: RelationshipDifficulty
  preference: RelationshipPreference
  relationshipLevel: number
  attraction: number
  isActive: boolean
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
  gender: 'maschio' | 'femmina'
}

export interface SchoolRecord {
  condotta: number
  assenze: number
  note: number
  sospensioni: number
  consecutiveGoodDays: number
  wentToSchoolToday: boolean
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    matematica: 1.5,
    italiano: 1.4,
    inglese: 1.3,
    storia: 1.2,
    filosofia: 1.2,
    fisica: 1.1,
    scienze: 1.0,
    edFisica: 0.7
  },
  tecnico: {
    matematica: 1.5,
    fisica: 1.4,
    informatica: 1.4,
    elettronica: 1.3,
    italiano: 1.2,
    inglese: 1.0,
    storia: 0.9,
    edFisica: 0.7
  },
  professionale: {
    pratica: 1.5,
    laboratorio: 1.4,
    italiano: 1.2,
    matematica: 1.1,
    inglese: 1.0,
    edFisica: 0.8
  },
  artistico: {
    disegno: 1.5,
    arte: 1.4,
    storia_arte: 1.3,
    italiano: 1.2,
    matematica: 1.0,
    inglese: 1.0,
    edFisica: 0.7
  }
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  condotta: 8.0,
  assenze: 0,
  note: 0,
  sospensioni: 0,
  consecutiveGoodDays: 0,
  wentToSchoolToday: false
}

export const DEFAULT_GAME_STATE = {
  stats: {
    figosita: 50,
    coattaggine: 50,
    muscoli: 50,
    intelligenza: 50,
    carisma: 50,
    soldi: 100,
    reputazione: 50,
    stanchezza: 0,
    media: 6.0
  } as GameStats,
  grades: {
    matematica: 6.0,
    italiano: 6.0,
    inglese: 6.0,
    storia: 6.0,
    fisica: 6.0,
    scienze: 6.0,
    edFisica: 6.0
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 1, month: 9, year: 2026 },
    age: 14,
    schoolYear: { currentYear: 1, isSchoolPeriod: true },
    phase: 'mattina' as DayPhase,
    phaseActions: {
      mattina: 2,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  } as GameTime
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const baseGrade = 6.0
  
  switch (schoolType) {
    case 'liceo':
      return {
        matematica: baseGrade,
        italiano: baseGrade,
        inglese: baseGrade,
        storia: baseGrade,
        filosofia: baseGrade,
        fisica: baseGrade,
        scienze: baseGrade,
        edFisica: baseGrade
      }
    case 'tecnico':
      return {
        matematica: baseGrade,
        fisica: baseGrade,
        informatica: baseGrade,
        elettronica: baseGrade,
        italiano: baseGrade,
        inglese: baseGrade,
        storia: baseGrade,
        edFisica: baseGrade
      }
    case 'professionale':
      return {
        pratica: baseGrade,
        laboratorio: baseGrade,
        italiano: baseGrade,
        matematica: baseGrade,
        inglese: baseGrade,
        edFisica: baseGrade
      }
    case 'artistico':
      return {
        disegno: baseGrade,
        arte: baseGrade,
        storia_arte: baseGrade,
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
    inglese: 'Inglese',
    storia: 'Storia',
    filosofia: 'Filosofia',
    fisica: 'Fisica',
    scienze: 'Scienze',
    edFisica: 'Ed. Fisica',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    pratica: 'Pratica',
    laboratorio: 'Laboratorio',
    disegno: 'Disegno',
    arte: 'Arte',
    storia_arte: 'Storia dell\'Arte'
  }
  return displayNames[subject] || subject
}
