import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { UseGameActionsParams } from './types'
import { useGameActions } from './useGameActions'

const hookResults = vi.hoisted(() => ({
  economy: {
    handleLavoro: vi.fn(),
    handleJobSelection: vi.fn(),
    handleMotorino: vi.fn(),
    handleShoppingMall: vi.fn(),
  },
  study: {
    handleStudia: vi.fn(),
    handleStudySubject: vi.fn(),
    handleStudiaGruppo: vi.fn(),
    handleCorrompi: vi.fn(),
    handleCorrompiSubject: vi.fn(),
    handleMinaccia: vi.fn(),
    handleMinacciaSubject: vi.fn(),
    handlePrepareExam: vi.fn(),
  },
  girlfriend: {
    handleGirlfriendAction: vi.fn(),
    handleGirlfriendBreakup: vi.fn(),
  },
  social: {
    handleDisco: vi.fn(),
    handleCinema: vi.fn(),
    handleTryRelationship: vi.fn(),
    handleChiacchiera: vi.fn(),
    handleNavigaOnline: vi.fn(),
    handleParco: vi.fn(),
    handleTelefona: vi.fn(),
    handleFriendAction: vi.fn(),
  },
  lifestyle: {
    handlePalestra: vi.fn(),
    handleLampada: vi.fn(),
    handleRiposa: vi.fn(),
    handleMarina: vi.fn(),
  },
}))

vi.mock('./useEconomyActions', () => ({
  useEconomyActions: vi.fn(() => hookResults.economy),
}))

vi.mock('./useStudyActions', () => ({
  useStudyActions: vi.fn(() => hookResults.study),
}))

vi.mock('./useGirlfriendActions', () => ({
  useGirlfriendActions: vi.fn(() => hookResults.girlfriend),
}))

vi.mock('./useSocialActions', () => ({
  useSocialActions: vi.fn(() => hookResults.social),
}))

vi.mock('./useLifestyleActions', () => ({
  useLifestyleActions: vi.fn(() => hookResults.lifestyle),
}))

function makeParams(overrides: Partial<UseGameActionsParams> = {}): UseGameActionsParams {
  return {
    stats: {
      media: 6,
      muscoli: 10,
      coattaggine: 10,
      figosita: 10,
      intelligenza: 10,
      carisma: 10,
      reputazione: 10,
      soldi: 50,
      stanchezza: 5,
      stress: 5,
      morale: 50,
      salute: 100,
      energia: 50,
      fame: 10,
      igiene: 50,
      hasMotorino: false,
    } as unknown as UseGameActionsParams['stats'],
    setStats: vi.fn(),
    grades: {
      italiano: 6,
      matematica: 6,
      inglese: 6,
      storia: 6,
      scienze: 6,
    } as UseGameActionsParams['grades'],
    setGrades: vi.fn(),
    gameTime: {
      currentDate: { day: 1, month: 9, year: 1998 },
      actionsRemaining: 2,
      maxActionsPerDay: 3,
      extraActions: 0,
      currentPhase: 'pomeriggio',
      dayOfWeek: 1,
      age: 14,
      schoolYear: { currentYear: 1, isSchoolPeriod: true },
      phaseActions: { mattina: 2, pomeriggio: 2, sera: 2, notte: 1 },
    } as unknown as UseGameActionsParams['gameTime'],
    schoolType: 'scientifico' as UseGameActionsParams['schoolType'],
    scheduledExams: [],
    setScheduledExams: vi.fn(),
    friends: [],
    setFriends: vi.fn(),
    relationships: [],
    setRelationships: vi.fn(),
    girlfriend: null,
    setGirlfriend: vi.fn(),
    setGameOver: vi.fn(),
    setGameOverReason: vi.fn(),
    consumeAction: vi.fn(),
    consumeInterazione: vi.fn(),
    announce: vi.fn(),
    triggerRandomEvent: vi.fn(),
    checkForNewFriend: vi.fn(),
    checkForNewRelationship: vi.fn(),
    checkForNewGirlfriend: vi.fn(),
    setShowSubjectDialog: vi.fn(),
    currentPhase: 'pomeriggio',
    dayType: 'feriale',
    phaseActionsRemaining: 2,
    canInteract: true,
    schoolRecord: {
      assenze: 0,
      note: 0,
      sospensioni: 0,
      condotta: 8,
      wentToSchoolToday: false,
      isAtSchool: false,
      consecutiveGoodDays: 0,
    } as unknown as UseGameActionsParams['schoolRecord'],
    setSchoolRecord: vi.fn(),
    gainExtraAction: vi.fn(),
    addLogEntry: vi.fn(),
    applyCondition: vi.fn(),
    marinatoOggi: false,
    handleDormi: vi.fn(),
    onOpenStreetRace: vi.fn(),
    onOpenJobSelection: vi.fn(),
    ...overrides,
  }
}

describe('useGameActions', () => {
  it('espone i sotto-handler e instrada le action id verso la funzione corretta', () => {
    const { result } = renderHook(() => useGameActions(makeParams()))

    expect(result.current.handleLavoro).toBe(hookResults.economy.handleLavoro)
    expect(result.current.handleStudySubject).toBe(hookResults.study.handleStudySubject)
    expect(result.current.handleGirlfriendAction).toBe(hookResults.girlfriend.handleGirlfriendAction)
    expect(result.current.handlePalestra).toBe(hookResults.lifestyle.handlePalestra)
    expect(result.current.getHandlerForAction('palestra')).toBe(hookResults.lifestyle.handlePalestra)
    expect(result.current.getHandlerForAction('studia')).toBe(hookResults.study.handleStudia)
    expect(result.current.getHandlerForAction('online')).toBe(hookResults.social.handleNavigaOnline)
    expect(result.current.getHandlerForAction('dormi')).toBeDefined()
  })

  it('calcola le availableActions in base a fase e periodo scolastico', () => {
    const { result } = renderHook(() => useGameActions(makeParams()))

    expect(result.current.availableActions.map(entry => entry.id)).toEqual(
      expect.arrayContaining(['palestra', 'studia', 'studia_gruppo', 'lavoro'])
    )

    const { result: offPeriodResult } = renderHook(() => useGameActions(makeParams({
      gameTime: {
        currentDate: { day: 1, month: 7, year: 1998 },
        actionsRemaining: 1,
        maxActionsPerDay: 3,
        extraActions: 0,
        currentPhase: 'pomeriggio',
        dayOfWeek: 2,
        age: 14,
        schoolYear: { currentYear: 1, isSchoolPeriod: false },
        phaseActions: { mattina: 2, pomeriggio: 2, sera: 2, notte: 1 },
      } as unknown as UseGameActionsParams['gameTime'],
      phaseActionsRemaining: 1,
    })))

    expect(offPeriodResult.current.availableActions.map(entry => entry.id)).not.toContain('studia_gruppo')
  })
})