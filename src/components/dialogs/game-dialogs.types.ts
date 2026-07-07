import type { SubjectGrades, GameStats, NarrativePlayerGender } from '@/lib/types'
import type { SchoolEvent } from '@/lib/school-events'
import type { BetInfo } from '@/lib/bet-system'
import type { JobDefinition, JobId } from '@/lib/job-system'

export interface SchoolDialogsProps {
  showReportCard: boolean
  grades: SubjectGrades
  currentMedia: number
  reportCardPassed: boolean
  schoolYear: number
  handleReportCardContinue: () => void
  condotta: number
  assenze: number
  showSchoolEvent: boolean
  schoolEvent: SchoolEvent | null
  handleSchoolEventChoice: (choiceIndex: number) => void
  setShowSchoolEvent: (value: boolean) => void
  showSubjectDialog: boolean
  setShowSubjectDialog: (value: boolean) => void
  handleStudySubject: (subject: string) => void
  stanchezza: number
  playerGender: NarrativePlayerGender
  showTeacherDialog: boolean
  setShowTeacherDialog: (value: boolean) => void
  handleTeacherSelection: (subject: string) => void
  teacherActionType: 'corrompi' | 'minaccia'
  soldi: number
}

export interface CityDialogsProps {
  showMetallariEvent: boolean
  setShowMetallariEvent: (value: boolean) => void
  currentEvent: string
  handleMetallariScappa: () => void
  handleMetallariCombatti: () => void
  showPoliceEvent: boolean
  setShowPoliceEvent: (value: boolean) => void
  handlePoliceScappa: () => void
  handlePoliceCollabora: () => void
  showStreetRaceEvent: boolean
  setShowStreetRaceEvent: (value: boolean) => void
  raceWinChance: number
  handleStreetRaceRifiuta: () => void
  handleStreetRaceAccetta: () => void
  betInfo: BetInfo | null
  // TASK-B: job selection dialog
  showJobSelectionDialog: boolean
  setShowJobSelectionDialog: (value: boolean) => void
  availableJobsForDialog: JobDefinition[]
  onSelectJob: (jobId: JobId) => void
  playerStats: GameStats
  playerSchoolYear: number
}

export interface SocialDialogsProps {
  showAtipaEvent: boolean
  setShowAtipaEvent: (value: boolean) => void
  atipaSuccessChance: number
  handleAtipaRinuncia: () => void
  handleAtipaProva: () => void
  showBulliEvent: boolean
  setShowBulliEvent: (value: boolean) => void
  handleBulliCedi: () => void
  handleBulliResisti: () => void
  gameOver: boolean
  gameOverReason: string
  handleReset: () => void
  showResetDialog: boolean
  setShowResetDialog: (value: boolean) => void
  showKeyboardHelp: boolean
  setShowKeyboardHelp: (value: boolean) => void
  onKeyboardHelpCloseAutoFocus?: (event: Event) => void
  stanchezza: number
  showMotorinoGarage?: boolean
  setShowMotorinoGarage?: (value: boolean) => void
  playerStats?: GameStats
  setStats?: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  consumeAction?: () => void
  announce?: (msg: string, priority?: 'polite' | 'assertive') => void
  addLogEntry?: any
  currentPhase?: any
  gameTime?: any
}

export interface GameDialogsProps {
  school: SchoolDialogsProps
  city: CityDialogsProps
  social: SocialDialogsProps
}
