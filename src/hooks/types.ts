import type { BetInfo } from '@/lib/bet-system'
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
import type { Ragazza } from '@/lib/girlfriend-system'

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
  girlfriend: Ragazza | null
  setGirlfriend: (v: Ragazza | null | ((prev: Ragazza | null) => Ragazza | null)) => void
  setGameOver: (v: boolean) => void
  setGameOverReason: (v: string) => void
  consumeAction: () => void
  announce: (msg: string) => void
  triggerRandomEvent: () => void
  checkForNewFriend: (location: string) => void
  checkForNewRelationship: () => void
  checkForNewGirlfriend: () => void
  setShowSubjectDialog: (v: boolean) => void
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
  schoolRecord: SchoolRecord
  setSchoolRecord: (updater: ((prev: SchoolRecord) => SchoolRecord) | SchoolRecord) => void
  gainExtraAction: () => void
  addLogEntry: (type: LogEntryType, title: string, description: string, result: GameLogEntry['result'], date: GameDate, phase: DayPhase) => void
  applyCondition: (id: HealthConditionId, currentDate: GameDate, currentPhase: DayPhase) => void
  marinatoOggi: boolean
  handleDormi: () => void
  onOpenStreetRace?: (betInfo: BetInfo) => void
}
