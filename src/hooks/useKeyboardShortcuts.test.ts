import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

function makeParams(overrides: Partial<Parameters<typeof useKeyboardShortcuts>[0]> = {}) {
  return {
    currentPhase: 'pomeriggio',
    gameOver: false,
    showResetDialog: false,
    showMetallariEvent: false,
    showAtipaEvent: false,
    showPoliceEvent: false,
    showStreetRaceEvent: false,
    showBulliEvent: false,
    showReportCard: false,
    schoolType: 'tecnico' as const,
    phaseActionsRemaining: 1,
    handlePalestra: vi.fn(),
    handleLampada: vi.fn(),
    handleLavoro: vi.fn(),
    handleMotorino: vi.fn(),
    handleStudia: vi.fn(),
    handleOpenCorrompiDialog: vi.fn(),
    handleOpenMinacciaDialog: vi.fn(),
    handleRiposa: vi.fn(),
    handleDormi: vi.fn(),
    handleProvarciConAtipa: vi.fn(),
    handleDisco: vi.fn(),
    handleCinema: vi.fn(),
    handleShoppingMall: vi.fn(),
    setShowResetDialog: vi.fn(),
    advancePhaseOnly: vi.fn(),
    openKeyboardHelp: vi.fn(),
    setActiveTab: vi.fn(),
    announce: vi.fn(),
    ...overrides,
  }
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('usa handleDormi con Ctrl+Alt+Invio durante la notte', () => {
    const params = makeParams({ currentPhase: 'notte' })

    renderHook(() => useKeyboardShortcuts(params))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, altKey: true }))
    })

    expect(params.handleDormi).toHaveBeenCalledTimes(1)
    expect(params.advancePhaseOnly).not.toHaveBeenCalled()
  })

  it('mantiene l avanzamento fase con Ctrl+Alt+Invio fuori dalla notte', () => {
    const params = makeParams({ currentPhase: 'sera' })

    renderHook(() => useKeyboardShortcuts(params))

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, altKey: true }))
    })

    expect(params.advancePhaseOnly).toHaveBeenCalledTimes(1)
    expect(params.handleDormi).not.toHaveBeenCalled()
  })
})