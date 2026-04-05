import type { TraitId } from '@/lib/character-traits'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export type SchoolType = 'liceo' | 'tecnico' | 'professionale' | 'agraria' | 'artistico'

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
  soldi: number
  media: number
  stanchezza: number
  reputazione: number
  intelligenza: number
  carisma: number
}

export interface Friend {
  id: string
  name: string
  type: 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'
  affinita: number
  intelligenza?: number
  unlocked: boolean
}

export interface Relationship {
  id: string
  name: string
  difficulty: 'facile' | 'media' | 'difficile'
  preference: RelationshipPreference
  relationshipLevel: number
  isActive: boolean
  attraction: number
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
    pratica: 1.5,
    italiano: 1.2,
    inglese: 1.0,
    matematica: 1.0,
    storia: 0.8,
    edFisica: 0.7
  },
  artistico: {
    disegno: 1.5,
    storia_arte: 1.3,
    italiano: 1.2,
    matematica: 1.0,
    inglese: 1.0,
    edFisica: 0.7
  },
  agraria: {
    scienze: 1.5,
    pratica: 1.3,
    italiano: 1.0,
    matematica: 1.0,
    inglese: 0.8,
    edFisica: 0.7
  }
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  condotta: 8.0,
  assenze: 0,
  note: 0,
  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0
}

export const DEFAULT_GAME_STATE = {
  stats: {
    coattaggine: 50,
    muscoli: 50,
    figosita: 50,
    intelligenza: 10,
    carisma: 10,
    reputazione: 50,
    soldi: 100,
    media: 6,
    stanchezza: 0,
  } as GameStats,
  grades: {
    matematica: 6.0,
    italiano: 6.0,
    storia: 6.0,
    inglese: 6.0,
    fisica: 6.0,
    edFisica: 6.0
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2024 },
    actionsRemaining: 3,
    maxActionsPerDay: 3,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2024 },
      schoolEndDate: { day: 10, month: 6, year: 2025 },
      reportCardDate: { day: 10, month: 6, year: 2025 }
    },
    age: 14,
    extraActions: 0,
    phase: 'mattina' as const,
    phaseActions: {
      mattina: 2,
      pomeriggio: 2,
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
        storia: baseGrade,
        inglese: baseGrade,
        filosofia: baseGrade,
        scienze: baseGrade,
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
