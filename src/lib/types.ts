import type { TraitId } from '@/lib/character-traits'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

  | 'Figo'



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
  intelligenza: numb
  figosita: number
  reputazione: number
  intelligenza: number
  id: string
}

export interface Friend {
  isActive: 
  name: string
  type: FriendType
  intelligenza: number
  difficulty: ExamD
  isActive: boolean
}

export interface Relationship {
  id: string
}
  difficulty: 'facile' | 'media' | 'difficile'
  preference: RelationshipPreference
  relationshipLevel: number
  attraction?: number
  isActive: boolean
 

export interface ScheduledExam {
  id: string
  day: number
  difficulty: ExamDifficulty
  daysUntil: number
  preparationLevel: number
 

export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  traits: TraitId[]
 

export type SchoolType = 'liceo' | 'tecnico' | 'artistico' | 'agrario'

export interface SubjectGrades {
  [subject: string]: number
 

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  daysUntilBreak: number
 

export interface GameDate {
  day: number
    matematica:
  year: number
 

export interface GameTime {
  currentDate: GameDate
    pratica: 1.5,
  age: number
    italiano: 1.0,
  currentPhase: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
    edFisica: 0.5
    mattina: number
    pomeriggio: number
    sera: number
    italiano: 1.0
  }
 

export interface SchoolRecord {
  assenze: number
    italiano: 
  sospensioni: number
  condotta: number
  consecutiveGoodDays: number
  wentToSchoolToday: boolean
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
    stanchezz
  note: 0,
    intelligenza:
  condotta: 8.0,
  consecutiveGoodDays: 0,
  wentToSchoolToday: false
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    matematica: 1.5,
    fisica: 1.3,
    currentPhase: 
    storia: 1.0,
      isSchoolPer
    scienze: 1.0,
    edFisica: 0.5
  },
  tecnico: {
    pratica: 1.5,
    }
    elettronica: 1.2,
    italiano: 1.0,
    inglese: 1.0,
  switch (school
    edFisica: 0.5
    
  artistico: {
    disegno: 1.5,
    arte: 1.3,
    inglese: 1.0,
    italiano: 1.0,
      return {
    matematica: 0.8,
        elettroni
  },
        stor
    pratica: 1.4,
    case 'artistico'
    scienze: 1.2,
    italiano: 1.0,
    inglese: 0.8,
    storia: 0.8,
    edFisica: 0.6
   
}

export const DEFAULT_GAME_STATE = {
        it
    coattaggine: 0,
    muscoli: 50,
    soldi: 100,
    stanchezza: 0,
    figosita: 50,
    reputazione: 50,
    intelligenza: 50,
    inglese: 'In
    media: 6
    fisica: 'Fisi
  grades: {
    elettronica:
    matematica: 6,
    inglese: 6,
    storia: 6,

    edFisica: 6

  gameTime: {
    currentDate: { day: 1, month: 9, year: 2026 },
    actionsRemaining: 3,
    currentPhase: 'mattina' as const,
    schoolYear: {

      isSchoolPeriod: true,
      daysUntilBreak: 180









































































