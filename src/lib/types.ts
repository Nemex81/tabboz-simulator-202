import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  coattaggine: number
  muscoli: number
  soldi: number
  media: number
  stanchezza: number
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
  psychStress: number
}

export type ReputationLevel = 
  | 'Sfigato Totale' 
  | 'Nessuno' 
  | 'Coatto Base' 
  | 'Rispettato' 
  | 'Leggenda del Quartiere'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

/** C2-2: livelli di profondità relazionale */
export type RelationshipTier =
  | 'sconosciuto'
  | 'conoscente'
  | 'amico'
  | 'amico_stretto'
  | 'migliore_amico'
  | 'trombamica'
  | 'fidanzata'

/** C2-2: tipo del legame — amicizia vs relazione romantica */
export type SocialBondType = 'amicizia' | 'romantico'

export interface Friend {
  id: string
  name: string
  type: FriendType
  affinita: number
  intelligenza?: number
  unlocked: boolean
  tier?: RelationshipTier
  bondType?: SocialBondType
}

export interface Relationship {
  id: string
  name: string
  difficulty: 'facile' | 'media' | 'difficile'
  preference: 'muscoli' | 'figosita' | 'intelligenza'
  relationshipLevel: number
  isActive: boolean
}

export interface SubjectGrades {
  [key: string]: number
}

export interface SchoolRecord {
  assenze: number
  condotta: number
  note: number
  sospensioni: number
  wentToSchoolToday: boolean
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
  extraActions?: number   // azioni bonus guadagnate tramite eventi speciali
}

// ─── Fasce Orarie (Fase B) ──────────────────────────────────────────────────

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

export interface DayPhaseConfig {
  label: string
  timeRange: string
  maxActions: number
  energyCost: number   // stanchezza aggiunta per azione
  nightRecovery: number // riduzione stanchezza durante la notte (negativo = recupero)
}

/** Estensione di GameTime con supporto fasce orarie. Compatibile con GameTime. */
export interface GameTimeV2 extends GameTime {
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
}

export interface EventConstraint {
  allowedPhases: DayPhase[]
  allowedDayTypes: DayType[]
  requiresSchoolPeriod?: boolean
  minSchoolYear?: number
  blockedWhenExhausted?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export interface ScheduledExam {
  subject: string
  daysUntil: number
  isPrepared: boolean
  difficulty: ExamDifficulty
  announced: boolean
}

export type PlayerGender = 'maschio' | 'femmina'

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface PlayerProfile {
  name: string
  gender: PlayerGender
  age: number
}

export interface GamePreferences {
  theme: ThemeVariant
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameTime: GameTime
  gameOver: boolean
  gameOverReason: string
  schoolType?: SchoolType
  playerProfile?: PlayerProfile
  friends?: Friend[]
  relationships?: Relationship[]
  scheduledExams?: ScheduledExam[]
  traits?: TraitId[]
  schoolRecord?: SchoolRecord
}

export const DEFAULT_STATS: GameStats = {
  coattaggine: 50,
  muscoli: 50,
  soldi: 100,
  media: 6,
  stanchezza: 0,
  figosita: 50,
  reputazione: 50,
  intelligenza: 10,
  carisma: 10,
  psychStress: 0,
}

export const getDefaultGradesForSchoolType = (schoolType: SchoolType): SubjectGrades => {
  switch (schoolType) {
    case 'tecnico':
      return {
        matematica: 6.0,
        italiano: 6.0,
        storia: 6.0,
        edFisica: 6.0,
        informatica: 6.0,
        elettronica: 6.0,
        meccanica: 6.0,
        sistemi: 6.0,
        inglese: 6.0,
        fisica: 6.0,
        chimica: 6.0,
        tecnologia: 6.0
      } as TecnicoGrades
    case 'agraria':
      return {
        matematica: 6.0,
        italiano: 6.0,
        storia: 6.0,
        edFisica: 6.0,
        biologia: 6.0,
        agronomia: 6.0,
        zootecnia: 6.0,
        ecologia: 6.0,
        inglese: 6.0,
        chimica: 6.0,
        botanica: 6.0,
        gestAziendale: 6.0
      } as AgrariaGrades
    case 'artistico':
      return {
        matematica: 6.0,
        italiano: 6.0,
        storia: 6.0,
        edFisica: 6.0,
        disegno: 6.0,
        pittura: 6.0,
        scultura: 6.0,
        storiaArte: 6.0,
        inglese: 6.0,
        anatomia: 6.0,
        grafica: 6.0,
        architettura: 6.0
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

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  condotta: 10,
  note: 0,
  sospensioni: 0,
  wentToSchoolToday: false
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,
  grades: DEFAULT_GRADES,
  gameTime: DEFAULT_GAME_TIME,
  gameOver: false,
  gameOverReason: '',
  schoolRecord: DEFAULT_SCHOOL_RECORD
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

/** C2-2: calcola il tier della relazione in base ad affinita e bondType */
export const getRelationshipTier = (
  affinita: number,
  bondType: SocialBondType = 'amicizia'
): RelationshipTier => {
  if (affinita <= 0) return 'sconosciuto'
  if (bondType === 'romantico') {
    if (affinita >= 80) return 'fidanzata'
    if (affinita >= 70) return 'trombamica'
    return 'conoscente'
  }
  if (affinita >= 90) return 'migliore_amico'
  if (affinita >= 60) return 'amico_stretto'
  if (affinita >= 30) return 'amico'
  return 'conoscente'
}

/** C2-2: etichetta emoji + testo per ciascun tier */
export const getRelationshipTierLabel = (tier: RelationshipTier): string => {
  const labels: Record<RelationshipTier, string> = {
    sconosciuto:    '💔 Sconosciuto',
    conoscente:     '😐 Conoscente',
    amico:          '😊 Amico',
    amico_stretto:  '😎 Amico Stretto',
    migliore_amico: '👑 Migliore Amico',
    trombamica:     '💋 Trombamica',
    fidanzata:      '❤️ Fidanzata',
  }
  return labels[tier]
}
