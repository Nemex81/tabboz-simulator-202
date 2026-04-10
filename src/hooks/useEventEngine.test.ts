import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Friend, GameStats, Relationship } from '@/lib/types'
import { MAX_RELATIONSHIPS_REACHED_MESSAGE } from '@/lib/gender-utils'
import { useEventEngine } from './useEventEngine'

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

vi.mock('@/lib/girlfriend-system', () => ({
  generateGirlfriendFromRelationship: (...args: unknown[]) => hookMocks.generateGirlfriendFromRelationship(...args),
}))

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

function makeStats(overrides: Partial<GameStats> = {}): GameStats {
  return {
    muscoli: 80,
    coattaggine: 80,
    soldi: 200,
    media: 6,
    stanchezza: 10,
    stress: 10,
    morale: 60,
    figosita: 80,
    reputazione: 50,
    intelligenza: 30,
    carisma: 70,
    salute: 100,
    hasMotorino: false,
    ...overrides,
  }
}

function makeParams(overrides: Partial<Parameters<typeof useEventEngine>[0]> = {}): Parameters<typeof useEventEngine>[0] {
  return {
    stats: makeStats(),
    setStats: vi.fn(),
    friends: [],
    setFriends: vi.fn(),
    relationships: [],
    setRelationships: vi.fn(),
    girlfriend: null,
    setGirlfriend: vi.fn(),
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
    consumeAction: vi.fn(),
    announce: vi.fn(),
    phaseActionsRemaining: 2,
    addLogEntry: vi.fn(),
    currentPhase: 'pomeriggio' as const,
    playerProfile: { name: 'Tabboz', gender: 'maschio', orientamentoSessuale: 'eterosessuale' },
    ...overrides,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  hookMocks.generateGirlfriendFromRelationship.mockReset()
  hookMocks.randomChance.mockReset()
  Object.values(hookMocks.playSound).forEach((fn) => fn.mockReset())
})

describe('useEventEngine romantic flow', () => {
  it('aggiunge una relazione e una fidanzata quando Rimorchia nel quartiere va a buon fine', () => {
    const params = makeParams()
    const generatedGirlfriend = { id: 'girl-1', nome: 'Jessica', cognome: 'Rossi', relationshipStatus: 'fidanzata' }
    hookMocks.generateGirlfriendFromRelationship.mockReturnValue(generatedGirlfriend)
    hookMocks.randomChance.mockReturnValue(true)

    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValueOnce(0)

    const { result } = renderHook(() => useEventEngine(params))

    act(() => {
      result.current.handleProvarciConAtipa()
    })

    act(() => {
      result.current.handleAtipaProva()
    })

    expect(params.setRelationships).toHaveBeenCalledTimes(1)
    const relationshipsMock = params.setRelationships as ReturnType<typeof vi.fn>
    const relationshipsUpdater = relationshipsMock.mock.calls[0][0] as (prev: Relationship[]) => Relationship[]
    const updatedRelationships = relationshipsUpdater([])
    expect(updatedRelationships).toHaveLength(1)
    expect(updatedRelationships[0]).toMatchObject({
      name: 'Jessica',
      sourceType: 'pickup',
      metAt: 'quartiere',
      isActive: true,
      relationshipLevel: 1,
      preference: 'figosita',
      difficulty: 'media',
    })
    expect(updatedRelationships[0].sourceKey).toMatch(/^pickup:/)
    const preservedRelationships = relationshipsUpdater([
      {
        id: 'legacy-jessica',
        name: 'Jessica',
        sourceKey: 'pickup:other-encounter',
        sourceType: 'pickup',
        gender: 'F',
        difficulty: 'media',
        preference: 'figosita',
        relationshipLevel: 1,
        isActive: true,
      },
    ])
    expect(preservedRelationships).toHaveLength(2)
    expect(params.setGirlfriend).toHaveBeenCalledWith(generatedGirlfriend)
  })

  it('sincronizza la lista relazioni quando genera direttamente una fidanzata da evento sociale', () => {
    const params = makeParams()
    const generatedGirlfriend = { id: 'girl-2', nome: 'Vanessa', cognome: 'Bianchi', relationshipStatus: 'fidanzata' }
    hookMocks.generateGirlfriendFromRelationship.mockReturnValue(generatedGirlfriend)
    hookMocks.randomChance.mockReturnValue(true)

    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0)

    const { result } = renderHook(() => useEventEngine(params))

    act(() => {
      result.current.checkForNewGirlfriend()
    })

    expect(params.setRelationships).toHaveBeenCalledTimes(1)
    const relationshipsMock = params.setRelationships as ReturnType<typeof vi.fn>
    const relationshipsUpdater = relationshipsMock.mock.calls[0][0] as (prev: Relationship[]) => Relationship[]
    const updatedRelationships = relationshipsUpdater([])
    expect(updatedRelationships).toHaveLength(1)
    expect(updatedRelationships[0]).toMatchObject({
      sourceType: 'direct_girlfriend',
      isActive: true,
      relationshipLevel: 1,
    })
    expect(updatedRelationships[0].sourceKey).toMatch(/^direct-girlfriend:/)
    expect(updatedRelationships[0].name.length).toBeGreaterThan(0)
    expect(params.setGirlfriend).toHaveBeenCalledWith(generatedGirlfriend)
  })

  it('genera un partner compatibile con l orientamento del giocatore nel flusso pickup', () => {
    const params = makeParams({
      playerProfile: { name: 'Tabboz', gender: 'maschio', orientamentoSessuale: 'omosessuale' },
    })
    hookMocks.generateGirlfriendFromRelationship.mockReturnValue({ id: 'girl-4', nome: 'Davide', cognome: 'Blu', relationshipStatus: 'fidanzata' })
    hookMocks.randomChance.mockReturnValue(true)

    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0)

    const { result } = renderHook(() => useEventEngine(params))

    act(() => {
      result.current.handleProvarciConAtipa()
    })

    act(() => {
      result.current.handleAtipaProva()
    })

    const relationshipsMock = params.setRelationships as ReturnType<typeof vi.fn>
    const relationshipsUpdater = relationshipsMock.mock.calls[0][0] as (prev: Relationship[]) => Relationship[]
    const updatedRelationships = relationshipsUpdater([])
    expect(updatedRelationships[0]).toMatchObject({ gender: 'M', orientamentoSessuale: 'omosessuale' })
  })

  it('blocca la generazione di nuove relazioni automatiche quando il cap attivo e raggiunto', () => {
    const params = makeParams({
      stats: makeStats({ carisma: 0, figosita: 0, intelligenza: 0 }),
      relationships: [{
        id: 'rel-active',
        name: 'Jessica',
        sourceKey: 'relationship:active',
        sourceType: 'generated_interest',
        gender: 'F',
        difficulty: 'media',
        preference: 'figosita',
        relationshipLevel: 1,
        isActive: true,
      }],
    })
    hookMocks.randomChance.mockReturnValue(true)

    const { result } = renderHook(() => useEventEngine(params))

    act(() => {
      result.current.checkForNewGirlfriend('quartiere')
    })

    expect(params.setRelationships).not.toHaveBeenCalled()
    expect(params.setGirlfriend).not.toHaveBeenCalled()
    expect(params.announce).toHaveBeenCalledWith(MAX_RELATIONSHIPS_REACHED_MESSAGE, 'assertive')
  })

  it('assegna il contesto online ai nuovi interessi romantici generati in rete', () => {
    const params = makeParams()
    hookMocks.randomChance.mockReturnValue(true)

    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0)

    const { result } = renderHook(() => useEventEngine(params))

    act(() => {
      result.current.checkForNewRelationship('online')
    })

    expect(params.setRelationships).toHaveBeenCalledTimes(1)
    const relationshipsMock = params.setRelationships as ReturnType<typeof vi.fn>
    const relationshipsUpdater = relationshipsMock.mock.calls[0][0] as (prev: Relationship[]) => Relationship[]
    const updatedRelationships = relationshipsUpdater([])
    expect(updatedRelationships).toHaveLength(1)
    expect(updatedRelationships[0]).toMatchObject({
      sourceType: 'generated_interest',
      metAt: 'online',
      isActive: false,
    })
  })

  it('normalizza correttamente gli incontri online e crea un amico con metAt online', () => {
    const params = makeParams({
      currentPhase: 'notte' as const,
    })

    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValue(0)

    const { result } = renderHook(() => useEventEngine(params))

    act(() => {
      result.current.checkForNewFriend('online')
    })

    expect(params.setFriends).toHaveBeenCalledTimes(1)
  const friendsMock = params.setFriends as ReturnType<typeof vi.fn>
  const friendsUpdater = friendsMock.mock.calls[0][0] as (prev: Friend[]) => Friend[]
    const updatedFriends = friendsUpdater([])
    expect(updatedFriends).toHaveLength(1)
    expect(updatedFriends[0]).toMatchObject({
      originType: 'extrascolastico',
      metAt: 'online',
    })
    expect(params.announce).toHaveBeenCalledWith(
      expect.stringContaining(' online! Nuovo amico aggiunto alla rubrica.')
    )
  })
})