import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Relationship } from '@/lib/types'
import { MAX_RELATIONSHIPS_REACHED_MESSAGE } from '@/lib/gender-utils'
import { useSocialActions } from './useSocialActions'

type UseSocialActionsParams = Parameters<typeof useSocialActions>[0]

const hookMocks = vi.hoisted(() => ({
  generateGirlfriendFromRelationship: vi.fn(),
  randomChance: vi.fn(),
  playSound: {
    bigWin: vi.fn(),
    buttonClick: vi.fn(),
    eventTrigger: vi.fn(),
    failure: vi.fn(),
    success: vi.fn(),
    dangerAlert: vi.fn(),
    bigLoss: vi.fn(),
    moneySpent: vi.fn(),
  },
}))

vi.mock('@/lib/girlfriend-system', async () => {
  const actual = await vi.importActual<typeof import('@/lib/girlfriend-system')>('@/lib/girlfriend-system')
  return {
    ...actual,
    generateGirlfriendFromRelationship: (...args: unknown[]) => hookMocks.generateGirlfriendFromRelationship(...args),
  }
})

vi.mock('@/lib/sound-effects', () => ({
  playSound: hookMocks.playSound,
}))

vi.mock('@/lib/game-utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/game-utils')>('@/lib/game-utils')
  return {
    ...actual,
    randomChance: (...args: unknown[]) => hookMocks.randomChance(...args),
  }
})

function makeRelationship(overrides: Partial<Relationship> = {}): Relationship {
  return {
    id: 'rel-1',
    name: 'Jessica',
    sourceKey: 'relationship:rel-1',
    sourceType: 'generated_interest',
    gender: 'F',
    difficulty: 'media',
    preference: 'figosita',
    relationshipLevel: 0,
    isActive: false,
    ...overrides,
  }
}

function makeParams(
  relationships: Relationship[],
  overrides: Partial<{
    setStats: ReturnType<typeof vi.fn>
    setRelationships: ReturnType<typeof vi.fn>
    setActivePartners: ReturnType<typeof vi.fn>
    consumeAction: ReturnType<typeof vi.fn>
    consumeInterazione: ReturnType<typeof vi.fn>
    announce: ReturnType<typeof vi.fn>
    addLogEntry: ReturnType<typeof vi.fn>
    checkForNewFriend: ReturnType<typeof vi.fn>
    checkForNewRelationship: ReturnType<typeof vi.fn>
  }> = {},
): UseSocialActionsParams {
  return {
    stats: {
      muscoli: 90,
      coattaggine: 80,
      soldi: 150,
      media: 6,
      stanchezza: 10,
      stress: 10,
      morale: 60,
      figosita: 90,
      reputazione: 50,
      intelligenza: 40,
      carisma: 90,
      salute: 100,
      hasMotorino: false,
    },
    setStats: (overrides.setStats ?? vi.fn()) as unknown as UseSocialActionsParams['setStats'],
    gameTime: {
      currentDate: { day: 10, month: 4, year: 2026 },
      actionsRemaining: 2,
      maxActionsPerDay: 3,
      schoolYear: {
        currentYear: 1,
        isSchoolPeriod: true,
        daysUntilBreak: 20,
        schoolStartDate: { day: 15, month: 9, year: 2025 },
        schoolEndDate: { day: 10, month: 6, year: 2026 },
        reportCardDate: { day: 10, month: 6, year: 2026 },
      },
      age: 14,
      extraActions: 0,
      currentPhase: 'pomeriggio' as const,
      phaseActions: { mattina: 2, pomeriggio: 2, sera: 2, notte: 1 },
    },
    friends: [],
    setFriends: vi.fn() as unknown as UseSocialActionsParams['setFriends'],
    relationships,
    setRelationships: (overrides.setRelationships ?? vi.fn()) as unknown as UseSocialActionsParams['setRelationships'],
    setActivePartners: (overrides.setActivePartners ?? vi.fn()) as unknown as UseSocialActionsParams['setActivePartners'],
    consumeAction: (overrides.consumeAction ?? vi.fn()) as unknown as UseSocialActionsParams['consumeAction'],
    consumeInterazione: (overrides.consumeInterazione ?? vi.fn()) as unknown as UseSocialActionsParams['consumeInterazione'],
    announce: (overrides.announce ?? vi.fn()) as unknown as UseSocialActionsParams['announce'],
    triggerRandomEvent: vi.fn() as unknown as UseSocialActionsParams['triggerRandomEvent'],
    checkForNewFriend: (overrides.checkForNewFriend ?? vi.fn()) as unknown as UseSocialActionsParams['checkForNewFriend'],
    checkForNewRelationship: (overrides.checkForNewRelationship ?? vi.fn()) as unknown as UseSocialActionsParams['checkForNewRelationship'],
    checkForNewGirlfriend: vi.fn() as unknown as UseSocialActionsParams['checkForNewGirlfriend'],
    currentPhase: 'pomeriggio' as const,
    dayType: 'feriale' as const,
    phaseActionsRemaining: 2,
    canInteract: true,
    marinatoOggi: false,
    addLogEntry: (overrides.addLogEntry ?? vi.fn()) as unknown as UseSocialActionsParams['addLogEntry'],
    applyCondition: vi.fn() as unknown as UseSocialActionsParams['applyCondition'],
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  hookMocks.generateGirlfriendFromRelationship.mockReset()
  hookMocks.randomChance.mockReset()
  Object.values(hookMocks.playSound).forEach((fn) => fn.mockReset())
})

describe('useSocialActions handleTryRelationship', () => {
  it('usa la lista relazioni aggiornata anche se viene invocato un handler creato prima del rerender', () => {
    const sharedSetRelationships = vi.fn()
    const sharedSetActivePartners = vi.fn()
    const sharedSetStats = vi.fn()
    const sharedConsumeAction = vi.fn()
    const sharedAnnounce = vi.fn()
    const sharedAddLogEntry = vi.fn()
    const sharedOverrides = {
      setStats: sharedSetStats,
      setRelationships: sharedSetRelationships,
      setActivePartners: sharedSetActivePartners,
      consumeAction: sharedConsumeAction,
      announce: sharedAnnounce,
      addLogEntry: sharedAddLogEntry,
    }
    const initialParams = makeParams([], sharedOverrides)
    const generatedGirlfriend = { id: 'girl-3', nome: 'Jessica', cognome: 'Verdi', relationshipStatus: 'fidanzata' }
    hookMocks.generateGirlfriendFromRelationship.mockReturnValue(generatedGirlfriend)
    hookMocks.randomChance.mockReturnValue(true)

    const { result, rerender } = renderHook((props: ReturnType<typeof makeParams>) => useSocialActions(props), {
      initialProps: initialParams,
    })

    const staleHandler = result.current.handleTryRelationship
    const updatedParams = makeParams([makeRelationship()], sharedOverrides)
    rerender(updatedParams)

    act(() => {
      staleHandler('rel-1')
    })

    expect(sharedSetRelationships).toHaveBeenCalledTimes(1)
    const updater = sharedSetRelationships.mock.calls[0][0] as (prev: Relationship[]) => Relationship[]
    const updatedRelationships = updater([makeRelationship()])
    expect(updatedRelationships[0]).toMatchObject({ isActive: true, relationshipLevel: 1 })
    expect(sharedSetActivePartners).toHaveBeenCalledTimes(1)
    const activePartnersUpdater = sharedSetActivePartners.mock.calls[0][0] as (prev: Array<{ relationshipSourceKey: string }>) => Array<{ id: string; relationshipSourceKey: string }>
    const updatedPartners = activePartnersUpdater([])
    expect(updatedPartners[0]).toMatchObject({ id: 'girl-3', relationshipSourceKey: 'relationship:rel-1' })
  })

  it('blocca un nuovo partner attivo quando il cap delle relazioni e gia raggiunto', () => {
    const setRelationships = vi.fn()
    const setActivePartners = vi.fn()
    const announce = vi.fn()
    const consumeAction = vi.fn()
    const activeRelationships = [
      makeRelationship({ id: 'rel-a', sourceKey: 'relationship:rel-a', isActive: true, relationshipLevel: 1 }),
      makeRelationship({ id: 'rel-b', name: 'Valentina', sourceKey: 'relationship:rel-b', isActive: true, relationshipLevel: 1 }),
      makeRelationship({ id: 'rel-c', name: 'Deborah', sourceKey: 'relationship:rel-c', isActive: true, relationshipLevel: 1 }),
      makeRelationship({ id: 'rel-d', name: 'Melissa', sourceKey: 'relationship:rel-d', isActive: true, relationshipLevel: 1 }),
      makeRelationship({ id: 'rel-e', name: 'Jennifer', sourceKey: 'relationship:rel-e', isActive: true, relationshipLevel: 1 }),
    ]

    const { result } = renderHook(() => useSocialActions(makeParams([
      ...activeRelationships,
      makeRelationship({ id: 'rel-2', name: 'Valentina', sourceKey: 'relationship:rel-2' }),
    ], {
      setRelationships,
      setActivePartners,
      announce,
      consumeAction,
      setStats: vi.fn(),
    })))

    act(() => {
      result.current.handleTryRelationship('rel-2')
    })

    expect(setRelationships).not.toHaveBeenCalled()
    expect(setActivePartners).not.toHaveBeenCalled()
    expect(consumeAction).not.toHaveBeenCalled()
    expect(announce).toHaveBeenCalledWith(MAX_RELATIONSHIPS_REACHED_MESSAGE, 'assertive')
  })
})

describe('useSocialActions handleNavigaOnline', () => {
  it('consuma un interazione e prova a generare un amico online', () => {
    const setStats = vi.fn()
    const consumeInterazione = vi.fn()
    const checkForNewFriend = vi.fn()
    const checkForNewRelationship = vi.fn()
    const announce = vi.fn()
    const addLogEntry = vi.fn()

    const { result } = renderHook(() => useSocialActions(makeParams([], {
      setStats,
      consumeInterazione,
      checkForNewFriend,
      checkForNewRelationship,
      announce,
      addLogEntry,
    })))

    act(() => {
      result.current.handleNavigaOnline()
    })

    expect(setStats).toHaveBeenCalledTimes(1)
    expect(consumeInterazione).toHaveBeenCalledTimes(1)
    expect(checkForNewFriend).toHaveBeenCalledWith('online')
    expect(checkForNewRelationship).toHaveBeenCalledWith('online')
    expect(announce).toHaveBeenCalledWith(
      'Hai navigato online e conosciuto nuova gente in rete! +4 Carisma, +1 Reputazione'
    )
    expect(addLogEntry).toHaveBeenCalledTimes(1)
  })
})