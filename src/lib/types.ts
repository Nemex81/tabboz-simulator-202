export interface GameStats {
  coattaggine: number
  muscoli: number
  soldi: number
  media: number
  stanchezza: number
  figosita: number
  reputazione: number
}

export type ReputationLevel = 
  | 'Sfigato Totale' 
  | 'Nessuno' 
  | 'Coatto Base' 
  | 'Rispettato' 
  | 'Leggenda del Quartiere'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export interface SubjectGrades {
  [key: string]: number
}

export interface TecnicoGrades extends SubjectGrades {
  matematica: number
  italiano: number
  storia: number
  edFisica: number
  informatica: number
  elettronica: number
  meccanica: number
  sistemi: number
  inglese: number
  fisica: number
  chimica: number
  tecnologia: number
}

export interface AgrariaGrades extends SubjectGrades {
  matematica: number
  italiano: number
  storia: number
  edFisica: number
  biologia: number
  agronomia: number
  zootecnia: number
  ecologia: number
  inglese: number
  chimica: number
  botanica: number
  gestAziendale: number
}

export interface ArtisticoGrades extends SubjectGrades {
  matematica: number
  italiano: number
  storia: number
  edFisica: number
  disegno: number
  pittura: number
  scultura: number
  storiaArte: number
  inglese: number
  anatomia: number
  grafica: number
  architettura: number
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
  schoolType?: SchoolType
}

export interface GameTime {
  currentDate: GameDate
  actionsRemaining: number
  maxActionsPerDay: number
  schoolYear: SchoolYear
  age: number
  lastPaghettaDate?: GameDate
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameTime: GameTime
  gameOver: boolean
  gameOverReason: string
  schoolType?: SchoolType
}

export const DEFAULT_STATS: GameStats = {
  coattaggine: 50,
  muscoli: 50,
  soldi: 100,
  media: 6,
  stanchezza: 0,
  figosita: 50,
  reputazione: 50
}

export const getDefaultGradesForSchoolType = (schoolType: SchoolType): SubjectGrades => {
  switch (schoolType) {
    case 'tecnico':
      return {
        matematica: 6,
        italiano: 6,
        storia: 6,
        edFisica: 6,
        informatica: 6,
        elettronica: 6,
        meccanica: 6,
        sistemi: 6,
        inglese: 6,
        fisica: 6,
        chimica: 6,
        tecnologia: 6
      } as TecnicoGrades
    case 'agraria':
      return {
        matematica: 6,
        italiano: 6,
        storia: 6,
        edFisica: 6,
        biologia: 6,
        agronomia: 6,
        zootecnia: 6,
        ecologia: 6,
        inglese: 6,
        chimica: 6,
        botanica: 6,
        gestAziendale: 6
      } as AgrariaGrades
    case 'artistico':
      return {
        matematica: 6,
        italiano: 6,
        storia: 6,
        edFisica: 6,
        disegno: 6,
        pittura: 6,
        scultura: 6,
        storiaArte: 6,
        inglese: 6,
        anatomia: 6,
        grafica: 6,
        architettura: 6
      } as ArtisticoGrades
  }
}

export const DEFAULT_GRADES: SubjectGrades = {
  matematica: 6,
  italiano: 6,
  storia: 6,
  edFisica: 6
}

export const DEFAULT_GAME_TIME: GameTime = {
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
  lastPaghettaDate: undefined
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,
  grades: DEFAULT_GRADES,
  gameTime: DEFAULT_GAME_TIME,
  gameOver: false,
  gameOverReason: ''
}

export const getSchoolTypeName = (schoolType: SchoolType): string => {
  switch (schoolType) {
    case 'tecnico':
      return 'Istituto Tecnico Professionale'
    case 'agraria':
      return 'Istituto Agrario'
    case 'artistico':
      return 'Liceo Artistico'
  }
}

export const getSubjectDisplayName = (subjectKey: string): string => {
  const displayNames: { [key: string]: string } = {
    matematica: 'Matematica',
    italiano: 'Italiano',
    storia: 'Storia',
    edFisica: 'Ed. Fisica',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    meccanica: 'Meccanica',
    sistemi: 'Sistemi',
    inglese: 'Inglese',
    fisica: 'Fisica',
    chimica: 'Chimica',
    tecnologia: 'Tecnologia',
    biologia: 'Biologia',
    agronomia: 'Agronomia',
    zootecnia: 'Zootecnia',
    ecologia: 'Ecologia',
    botanica: 'Botanica',
    gestAziendale: 'Gest. Aziendale',
    disegno: 'Disegno',
    pittura: 'Pittura',
    scultura: 'Scultura',
    storiaArte: 'Storia dell\'Arte',
    anatomia: 'Anatomia',
    grafica: 'Grafica',
    architettura: 'Architettura'
  }
  return displayNames[subjectKey] || subjectKey
}
