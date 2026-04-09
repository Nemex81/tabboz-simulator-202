import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Relationship } from '@/lib/types'
import { useSocialActions } from './useSocialActions'

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

function makeRelationship(): Relationship {
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
  }
}

function makeParams(
  relationships: Relationship[],
  overrides: Partial<{
    setStats: ReturnType<typeof vi.fn>
    setRelationships: ReturnType<typeof vi.fn>
    setGirlfriend: ReturnType<typeof vi.fn>
    consumeAction: ReturnType<typeof vi.fn>
    announce: ReturnType<typeof vi.fn>
    addLogEntry: ReturnType<typeof vi.fn>
  }> = {},
) {
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
    setStats: overrides.setStats ?? vi.fn(),
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
      currentPhase: 'pomeriggio',
      phaseActions: { mattina: 2, pomeriggio: 2, sera: 2, notte: 1 },
    },
    friends: [],
    setFriends: vi.fn(),
    relationships,
    setRelationships: overrides.setRelationships ?? vi.fn(),
    setGirlfriend: overrides.setGirlfriend ?? vi.fn(),
    consumeAction: overrides.consumeAction ?? vi.fn(),
    consumeInterazione: vi.fn(),
    announce: overrides.announce ?? vi.fn(),
    triggerRandomEvent: vi.fn(),
    checkForNewFriend: vi.fn(),
    checkForNewRelationship: vi.fn(),
    checkForNewGirlfriend: vi.fn(),
    currentPhase: 'pomeriggio' as const,
    dayType: 'feriale' as const,
    phaseActionsRemaining: 2,
    canInteract: true,
    marinatoOggi: false,
    addLogEntry: overrides.addLogEntry ?? vi.fn(),
    applyCondition: vi.fn(),
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
    const sharedSetGirlfriend = vi.fn()
    const sharedSetStats = vi.fn()
    const sharedConsumeAction = vi.fn()
    const sharedAnnounce = vi.fn()
    const sharedAddLogEntry = vi.fn()
    const sharedOverrides = {
      setStats: sharedSetStats,
      setRelationships: sharedSetRelationships,
      setGirlfriend: sharedSetGirlfriend,
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
    expect(sharedSetGirlfriend).toHaveBeenCalledWith(generatedGirlfriend)
  })
})