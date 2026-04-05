import type { TraitId } from '@/lib/character-traits'

export type ExamDifficulty = 'facile' | 'media' | 'difficile'

  muscoli: number
  coattaggine: number
  muscoli: number
  soldi: number
  carisma: number
  figosita: number

  intelligenza: number
  relationshipLev
  media?: number
 

export interface Friend {
  name: string
  relationshipLevel: number
  intelligenza: number

  carisma: number
export interface Sch
}

export interface Relationship {
  prepared: bo
  preference: RelationshipPreference
  attraction?: number
}

export type RelationshipPreference = 'muscoli' | 'intelligenza' | 'figosita' | 'coattaggine' | 'carisma'

export interface ScheduledExam {
  subject: string
  month: number
    artistico
  daysUntil: number
  difficulty: ExamDifficulty
  prepared: boolean
e

export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  traits?: TraitId[]
 

export type SchoolType = 'liceo' | 'tecnico' | 'artistico' | 'agrario'

export function getSchoolTypeName(schoolType: SchoolType): string {
  const names: Record<SchoolType, string> = {
    liceo: 'Liceo Scientifico',
    tecnico: 'Istituto Tecnico',

    agrario: 'Istituto Agrario'
  t
  return names[schoolType]


export interface SubjectGrades {
  [subject: string]: number
 

export interface SchoolYear {
  currentYear: number
    inglese: 1.0,
    edFisica: 0.5
  tecnico: {
    matematica: 1.2,
    italiano: 1.0,
 

    disegno: 1.5,
    italiano:
    storia: 1.0
    edFisica: 
 

    matematica: 1.0,
    storia: 0.8,


  currentYear: 
  daysUntilBreak: 1
  schoolEndDate: { d
}

    case 'liceo':
        matematica: 6,
        italiano: 6,
        ingle
        edFisica: 6
    case 'tecnico':
        pratica: 6,
        elettronic
        inglese: 6,
        edFisica: 6
    case 'artist
        disegno: 
   
 

    case 'agrario':
        pratica: 6,
        italiano: 6,
 

  }

  const displayNa
    fisica: 'Fisic
    storia: 'Storia',
    scienze: 'Scienze',
    pratica: 'Pratica',
 

}
export typ
export const 
    coattaggine:
    soldi: 100,
    figosita: 50,
    intelligenza: 50,
 

    fisica: 6,
    ingles
    scienze: 6,
  } as SubjectGr
    currentDate: {
    currentPhase
      currentYear
      daysUntilBr
      schoolEndDa
    
    phaseAct
      pomeriggio:
      notte: 1
  } as GameTime


































export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  switch (schoolType) {
    case 'liceo':

        matematica: 6,
        fisica: 6,
        italiano: 6,


        scienze: 6,
        edFisica: 6
      }



































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
