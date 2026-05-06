import type { BetInfo } from '@/lib/bet-system'
import type { JobDefinition } from '@/lib/job-system'
import type {
  GameStats,
  SubjectGrades,
  GameTime,
  SchoolType,
  Friend,
  Relationship,
  ScheduledExam,
  SchoolRecord,
  DayPhase,
  DayType,
  LogEntryType,
  GameLogEntry,
  GameDate,
  HealthConditionId,
} from '@/lib/types'
import type { ActivePartner } from '@/lib/girlfriend-system'

export interface UseGameActionsParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  grades: SubjectGrades
  setGrades: (updater: ((prev: SubjectGrades) => SubjectGrades) | SubjectGrades) => void
  gameTime: GameTime
  schoolType: SchoolType | null
  scheduledExams: ScheduledExam[]
  setScheduledExams: (updater: ((prev: ScheduledExam[]) => ScheduledExam[]) | ScheduledExam[]) => void
  friends: Friend[]
  setFriends: (updater: ((prev: Friend[]) => Friend[]) | Friend[]) => void
  relationships: Relationship[]
  setRelationships: (updater: ((prev: Relationship[]) => Relationship[]) | Relationship[]) => void
  activePartners: ActivePartner[]
  setActivePartners: React.Dispatch<React.SetStateAction<ActivePartner[]>>
  setGameOver: (v: boolean) => void
  setGameOverReason: (v: string) => void
  consumeAction: () => void
  consumeInterazione: () => void
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  triggerRandomEvent: () => void
  checkForNewFriend: (location: string) => void
  checkForNewRelationship: (metAt?: Relationship['metAt']) => void
  checkForNewGirlfriend: (metAt?: Relationship['metAt']) => void
  setShowSubjectDialog: (v: boolean) => void
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
  canInteract: boolean
  schoolRecord: SchoolRecord
  setSchoolRecord: (updater: ((prev: SchoolRecord) => SchoolRecord) | SchoolRecord) => void
  gainExtraAction: () => void
  addLogEntry: (type: LogEntryType, title: string, description: string, result: GameLogEntry['result'], date: GameDate, phase: DayPhase) => void
  applyCondition: (id: HealthConditionId, currentDate: GameDate, currentPhase: DayPhase) => void
  marinatoOggi: boolean
  handleDormi: () => void
  onOpenStreetRace?: (betInfo: BetInfo) => void
  onOpenJobSelection?: (jobs: JobDefinition[]) => void
}
