import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  muscoli: number
  figosita: numbe
  stanchezza: number
}
export interfac
  date: { day: num
  difficulty: number
}
export type Sch
e

}
export inter
}
export interface 
  month: number
}
e

}

export interface PhaseActions {
  pomeriggio: number
  notte: number

 

  phaseActions: PhaseActions

 

export interface GameDate {
  day: number
  month: number
  year: number
}

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  daysUntilBreak: number
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export interface PhaseActions {
  mattina: number
  pomeriggio: number
  sera: number
  notte: number
}

export interface GameTime {
  currentDate: GameDate
  currentPhase: DayPhase
  age: number
  schoolYear: SchoolYear
  phaseActions: PhaseActions
}

export interface SchoolRecord {
  wentToSchoolToday: boolean
  assenze: number
  note: number
  condotta: number
}
  consecutiveGoodDays: number


export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  wentToSchoolToday: false,
    fisica: 1
  note: 0,
  condotta: 8.0,
  sospensioni: 0,
  consecutiveGoodDays: 0
}

export interface Friend {
    storia: 
  name: string
  },
  carisma: number
    fisica: 0.8,
  relationship: number
 

export interface Relationship {
  id: string
export functio
  type: 'ape' | 'dark' | 'metallara' | 'alternativa' | 'sportiva'
  compatibility: number
  met: boolean
 

export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  traits: TraitId[]
 

export type ThemeVariant = 'default' | 'dark' | 'green'

export type ReputationLevel = 'scarso' | 'basso' | 'medio' | 'alto' | 'leggenda'

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
        inglese: 6,
    fisica: 1.5,
        edFisica: 
    inglese: 1.0,
}
    scienze: 1.2,
    edFisica: 0.8
  },
    italiano
    matematica: 1.5,
    scienze: 'Sc
    italiano: 1.0,
    inglese: 1.2,
    storia: 0.8,
    scienze: 1.5,
    edFisica: 0.8
  ga
  artistico: {
export const DEFAULT
    fisica: 0.8,
    italiano: 1.2,
    inglese: 1.0,
    storia: 1.5,
    scienze: 1.0,
    carisma: 50,
  }
 

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  switch (schoolType) {
    case 'liceo':
      return {
        matematica: 6,
        fisica: 6,
    age: 14,
        inglese: 6,
      isSchoolPeri
        scienze: 6,
        edFisica: 6
      }
    case 'tecnico':
      return {
        matematica: 6,
        fisica: 6,
        italiano: 6,
        inglese: 6,

        scienze: 6,
        edFisica: 6
      }
    case 'artistico':
      return {

        fisica: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        scienze: 6,

      }

}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
    italiano: 'Italiano',
    inglese: 'Inglese',
    storia: 'Storia',

    edFisica: 'Ed. Fisica'

  return displayNames[subject] || subject



  stats: GameStats

  gameTime: GameTime


export const DEFAULT_GAME_STATE: GameState = {
  stats: {
    muscoli: 50,
    coattaggine: 50,


































