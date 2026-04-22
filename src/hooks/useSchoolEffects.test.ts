import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSchoolEffects } from './useSchoolEffects'
import type { GameTime, SchoolDayState, SchoolRecord, SubjectGrades, GameStats } from '@/lib/types'

function makeGameTime(): GameTime {
  return {
    currentDate: { day: 10, month: 4, year: 2026 },
    actionsRemaining: 2,
    maxActionsPerDay: 4,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      daysUntilBreak: 10,
      schoolStartDate: { day: 1, month: 9, year: 2025 },
      schoolEndDate: { day: 10, month: 6, year: 2026 },
      reportCardDate: { day: 10, month: 6, year: 2026 },
    },
    age: 14,
    extraActions: 0,
    currentPhase: 'mattina',
    phaseActions: { mattina: 2, pomeriggio: 2, sera: 2, notte: 1 },
  }
}

function makeStats(): GameStats {
  return {
    muscoli: 10,
    coattaggine: 10,
    soldi: 100,
    media: 6,
    stanchezza: 10,
    stress: 10,
    morale: 50,
    figosita: 10,
    reputazione: 10,
    intelligenza: 10,
    carisma: 10,
    salute: 100,
    hasMotorino: false,
  }
}

function makeGrades(): SubjectGrades {
  return { italiano: 6, matematica: 6 }
}

function makeSchoolRecord(overrides: Partial<SchoolRecord> = {}): SchoolRecord {
  return {
    assenze: 0,
    note: 0,
    sospensioni: 0,
    condotta: 8,
    wentToSchoolToday: true,
    isAtSchool: true,
    consecutiveGoodDays: 0,
    ...overrides,
  }
}

function makeSchoolDayState(triggered = false): SchoolDayState {
  return {
    date: { day: 10, month: 4, year: 2026 },
    currentSlotIndex: 0,
    isComplete: false,
    slots: [
      {
        hourIndex: 0,
        type: 'lesson',
        subjectKey: 'italiano',
        teacherId: 'teacher-1',
        ordinaryEvent: { message: 'Lezione', statDelta: { intelligenza: 1 } },
        schoolEvent: {
          type: 'teacher',
          tier: 1,
          title: 'DISCUSSIONE IN CLASSE!',
          description: 'Il prof apre un dibattito. Media: 6.0. Vuoi partecipare?',
          choices: [
            { label: 'Intervieni con una buona idea', action: () => ({ message: 'ok' }) },
            { label: 'Resta in silenzio', action: () => ({ message: 'ok' }) },
          ],
        },
        schoolEventTriggered: triggered,
        completed: false,
      },
    ],
  }
}

function makeParams(overrides: Partial<Parameters<typeof useSchoolEffects>[0]> = {}) {
  return {
    currentPhase: 'mattina',
    dayType: 'feriale',
    gameTime: makeGameTime(),
    schoolRecord: makeSchoolRecord(),
    schoolDayState: makeSchoolDayState(),
    grades: makeGrades(),
    stats: makeStats(),
    gameOver: false,
    marinatoOggi: false,
    setMarinatoOggi: vi.fn(),
    setShowStreetMorning: vi.fn(),
    setStreetMorningEvents: vi.fn(),
    setShowSchoolMorning: vi.fn(),
    setSchoolMorningEvents: vi.fn(),
    setMorningChoicePending: vi.fn(),
    setSchoolDayState: vi.fn(),
    setStats: vi.fn(),
    setSchoolEvent: vi.fn(),
    showSchoolEvent: false,
    setShowSchoolEvent: vi.fn(),
    setGameOver: vi.fn(),
    setGameOverReason: vi.fn(),
    announce: vi.fn(),
    ...overrides,
  }
}

describe('useSchoolEffects', () => {
  it('non apre DISCUSSIONE IN CLASSE se il player non è ancora dentro le ore scolastiche', () => {
    const params = makeParams({ schoolRecord: makeSchoolRecord({ isAtSchool: false }) })

    renderHook(() => useSchoolEffects(params))

    expect(params.setSchoolEvent).not.toHaveBeenCalled()
    expect(params.setShowSchoolEvent).not.toHaveBeenCalled()
    expect(params.setSchoolDayState).not.toHaveBeenCalled()
  })

  it('apre DISCUSSIONE IN CLASSE solo quando il lesson slot attivo è in corso e la marca come triggered', () => {
    const params = makeParams()

    renderHook(() => useSchoolEffects(params))

    expect(params.setSchoolEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: 'DISCUSSIONE IN CLASSE!',
      description: 'Il prof apre un dibattito. Media: 6.0. Vuoi partecipare?',
    }))
    expect(params.setShowSchoolEvent).toHaveBeenCalledWith(true)
    expect(params.setSchoolDayState).toHaveBeenCalledTimes(1)

    const setSchoolDayStateMock = params.setSchoolDayState as ReturnType<typeof vi.fn>
    const updater = setSchoolDayStateMock.mock.calls[0][0] as (prev: SchoolDayState) => SchoolDayState
    const updatedState = updater(makeSchoolDayState())
    expect(updatedState.slots[0].schoolEventTriggered).toBe(true)
  })

  it('non riapre il dialog se lo slot ha già consumato il proprio schoolEvent', () => {
    const params = makeParams({ schoolDayState: makeSchoolDayState(true) })

    renderHook(() => useSchoolEffects(params))

    expect(params.setSchoolEvent).not.toHaveBeenCalled()
    expect(params.setShowSchoolEvent).not.toHaveBeenCalled()
  })
})