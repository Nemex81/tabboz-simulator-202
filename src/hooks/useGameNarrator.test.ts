import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AfternoonEvent } from '@/lib/afternoon-events'
import type { DayPhase, GameDate, GameStats } from '@/lib/types'
import { useGameNarrator } from './useGameNarrator'

const announceMock = vi.fn()

vi.mock('@/components/A11yLiveRegion', () => ({
  useA11y: () => ({ announce: announceMock }),
}))

function makeStats(overrides: Partial<GameStats> = {}): GameStats {
  return {
    muscoli: 40,
    coattaggine: 35,
    soldi: 120,
    media: 6,
    stanchezza: 20,
    stress: 15,
    morale: 55,
    figosita: 45,
    reputazione: 30,
    intelligenza: 50,
    carisma: 40,
    salute: 80,
    hasMotorino: false,
    ...overrides,
  }
}

function makeDate(overrides: Partial<GameDate> = {}): GameDate {
  return {
    day: 1,
    month: 4,
    year: 2026,
    ...overrides,
  }
}

function makeAfternoonEvent(overrides: Partial<AfternoonEvent> = {}): AfternoonEvent {
  return {
    id: 'ae-test',
    location: 'quartiere',
    title: 'Evento pomeridiano',
    description: 'Succede qualcosa di importante.',
    probability: 100,
    choices: [],
    ...overrides,
  }
}

function makeParams(overrides: Partial<Parameters<typeof useGameNarrator>[0]> = {}): Parameters<typeof useGameNarrator>[0] {
  return {
    currentDate: makeDate(),
    currentPhase: 'mattina' as DayPhase,
    phaseActionsRemaining: 2,
    stats: makeStats(),
    afternoonEvent: null,
    activeConditionIds: [],
    ...overrides,
  }
}

describe('useGameNarrator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    announceMock.mockReset()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('annuncia la fase iniziale all ingresso nel gioco', () => {
    renderHook((params) => useGameNarrator(params), {
      initialProps: makeParams(),
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(announceMock).toHaveBeenCalledTimes(2)
    expect(announceMock).toHaveBeenCalledWith('Giorno 1, Mercoledì.', 'polite')
    expect(announceMock).toHaveBeenCalledWith('Nuova fase: Mattina. Azioni disponibili: 2.', 'assertive')
  })

  it('annuncia il cambio fase in assertive dopo il debounce', () => {
    const { rerender } = renderHook((params) => useGameNarrator(params), {
      initialProps: makeParams(),
    })

    rerender(makeParams({ currentPhase: 'pomeriggio', phaseActionsRemaining: 3 }))

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(announceMock).toHaveBeenCalledWith('Nuova fase: Pomeriggio. Azioni disponibili: 3.', 'assertive')
  })

  it('annuncia il cambio giorno in polite dopo il debounce', () => {
    const { rerender } = renderHook((params) => useGameNarrator(params), {
      initialProps: makeParams(),
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    announceMock.mockClear()

    rerender(makeParams({ currentDate: makeDate({ day: 2 }) }))

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(announceMock).toHaveBeenCalledWith('Giorno 2, Giovedì.', 'polite')
  })

  it('annuncia gli eventi automatici pomeridiani in assertive', () => {
    const { rerender } = renderHook((params) => useGameNarrator(params), {
      initialProps: makeParams(),
    })

    rerender(makeParams({ afternoonEvent: makeAfternoonEvent() }))

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(announceMock).toHaveBeenCalledWith('Evento pomeridiano. Succede qualcosa di importante.', 'assertive')
  })

  it('annuncia l insorgenza di una condizione di salute automatica', () => {
    const { rerender } = renderHook((params) => useGameNarrator(params), {
      initialProps: makeParams(),
    })

    rerender(makeParams({ activeConditionIds: ['esaurito'] }))

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(announceMock).toHaveBeenCalledWith('Esaurito. Troppo stress! Non riesci a concentrarti su nulla.', 'assertive')
  })

  it('annuncia salute critica e soldi bassi quando attraversano la soglia', () => {
    const { rerender } = renderHook((params) => useGameNarrator(params), {
      initialProps: makeParams(),
    })

    rerender(makeParams({ stats: makeStats({ salute: 25, soldi: 45 }) }))

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(announceMock).toHaveBeenCalledWith('Attenzione: salute critica al 25%. Considera di riposarti.', 'assertive')
    expect(announceMock).toHaveBeenCalledWith('Soldi bassi: 45 lire rimaste.', 'polite')
  })

  it('annuncia i delta statistici di almeno cinque punti', () => {
    const { rerender } = renderHook((params) => useGameNarrator(params), {
      initialProps: makeParams(),
    })

    rerender(makeParams({ stats: makeStats({ muscoli: 46 }) }))

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(announceMock).toHaveBeenCalledWith('Muscoli: 46 su 100. In aumento.', 'polite')
  })

  it('accorpa aggiornamenti rapidi e mantiene solo l ultimo annuncio di fase', () => {
    const { rerender } = renderHook((params) => useGameNarrator(params), {
      initialProps: makeParams(),
    })

    rerender(makeParams({ currentPhase: 'pomeriggio', phaseActionsRemaining: 2 }))
    rerender(makeParams({ currentPhase: 'sera', phaseActionsRemaining: 1 }))

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(announceMock).toHaveBeenCalledTimes(1)
    expect(announceMock).toHaveBeenCalledWith('Nuova fase: Sera. Azioni disponibili: 1.', 'assertive')
  })
})