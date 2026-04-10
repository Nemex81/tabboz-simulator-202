import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Relationship } from '@/lib/types'
import { useGirlfriendActions } from './useGirlfriendActions'

type UseGirlfriendActionsParams = Parameters<typeof useGirlfriendActions>[0]

const playSoundMock = vi.hoisted(() => ({
  bigWin: vi.fn(),
  bigLoss: vi.fn(),
  failure: vi.fn(),
  success: vi.fn(),
  gameOver: vi.fn(),
}))

vi.mock('@/lib/sound-effects', () => ({
  playSound: playSoundMock,
}))

function makeRelationship(overrides: Partial<Relationship> = {}): Relationship {
  return {
    id: 'rel-1',
    name: 'Jessica',
    sourceKey: 'test-key',
    sourceType: 'generated_interest',
    gender: 'F',
    orientamentoSessuale: 'eterosessuale',
    difficulty: 'media',
    preference: 'carisma',
    relationshipLevel: 1,
    isActive: true,
    ...overrides,
  }
}

function makeParams(overrides: Partial<UseGirlfriendActionsParams> = {}): UseGirlfriendActionsParams {
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
      hasMotorino: false,
    } as UseGirlfriendActionsParams['stats'],
    setStats: vi.fn(),
    grades: {
      italiano: 6,
      matematica: 6,
      inglese: 6,
      storia: 6,
      scienze: 6,
    } as UseGirlfriendActionsParams['grades'],
    setGrades: vi.fn(),
    gameTime: {
      currentDate: { day: 10, month: 4, year: 2026 },
      actionsRemaining: 2,
      maxActionsPerDay: 3,
      extraActions: 0,
      currentPhase: 'pomeriggio',
      dayOfWeek: 4,
      age: 16,
      schoolYear: { currentYear: 2, isSchoolPeriod: true },
      phaseActions: { mattina: 2, pomeriggio: 2, sera: 2, notte: 1 },
    } as unknown as UseGirlfriendActionsParams['gameTime'],
    activePartners: [{
      id: 'partner-1',
      relationshipSourceKey: 'test-key',
      nome: 'Jessica',
      cognome: 'Rossi',
      gender: 'F',
      orientamentoSessuale: 'eterosessuale',
      eta: 16,
      classe: '2A',
      aspetto: 'carina',
      personalita: 'timida',
      interessePerTe: 75,
      figositaRichiesta: 40,
      statusSociale: 50,
      gelosa: false,
      hobby: [],
      coloreCapelli: 'Castani',
      scuola: 'ITIS',
      statPreferita: 'carisma',
      relationshipStatus: 'fidanzata',
      stats: {
        totalDates: 1,
        messagesExchanged: 0,
        giftsGiven: 0,
        fightsHad: 0,
        dateActivities: [],
        daysTogether: 3,
        jealousyLevel: 10,
        trustLevel: 60,
        happinessLevel: 70,
      },
    }],
    setActivePartners: vi.fn(),
    setRelationships: vi.fn(),
    consumeAction: vi.fn(),
    announce: vi.fn(),
    addLogEntry: vi.fn(),
    currentPhase: 'pomeriggio',
    phaseActionsRemaining: 2,
    ...overrides,
  }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('useGirlfriendActions breakup', () => {
  it('breakup manuale rimuove partner da activePartners', () => {
    const setActivePartners = vi.fn()

    const { result } = renderHook(() => useGirlfriendActions(makeParams({
      setActivePartners,
    })))

    act(() => {
      result.current.handleGirlfriendBreakup('test-key')
    })

    expect(setActivePartners).toHaveBeenCalledTimes(1)
    const updater = setActivePartners.mock.calls[0][0] as (prev: UseGirlfriendActionsParams['activePartners']) => UseGirlfriendActionsParams['activePartners']
    const updatedPartners = updater(makeParams().activePartners)
    expect(updatedPartners).toEqual([])
  })

  it('breakup imposta isActive false su Relationship[]', () => {
    const setRelationships = vi.fn()

    const { result } = renderHook(() => useGirlfriendActions(makeParams({
      setRelationships,
    })))

    act(() => {
      result.current.handleGirlfriendBreakup('test-key')
    })

    expect(setRelationships).toHaveBeenCalledTimes(1)
    const updater = setRelationships.mock.calls[0][0] as (prev: Relationship[]) => Relationship[]
    const updatedRelationships = updater([
      makeRelationship(),
      makeRelationship({ id: 'rel-2', sourceKey: 'other-key', isActive: true }),
    ])

    expect(updatedRelationships[0]).toMatchObject({ sourceKey: 'test-key', isActive: false })
    expect(updatedRelationships[1]).toMatchObject({ sourceKey: 'other-key', isActive: true })
  })
})