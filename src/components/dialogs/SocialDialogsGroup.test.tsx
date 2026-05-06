import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SocialDialogsGroup } from './SocialDialogsGroup'
import type { SocialDialogsProps } from './game-dialogs.types'

vi.mock('@/components/KeyboardShortcutsDialog', () => ({
  KeyboardShortcutsDialog: () => <div>KeyboardShortcutsDialog</div>,
}))

vi.mock('@/components/dialogs/AtipaEventDialog', () => ({
  AtipaEventDialog: () => <div>AtipaEventDialog</div>,
}))

vi.mock('@/components/dialogs/BulliDialog', () => ({
  BulliDialog: () => <div>BulliDialog</div>,
}))

vi.mock('@/components/dialogs/GameOverDialog', () => ({
  GameOverDialog: () => <div>GameOverDialog</div>,
}))

vi.mock('@/components/dialogs/ResetDialog', () => ({
  ResetDialog: () => <div>ResetDialog</div>,
}))

function makeProps(overrides: Partial<SocialDialogsProps> = {}): SocialDialogsProps {
  return {
    showAtipaEvent: false,
    setShowAtipaEvent: vi.fn(),
    atipaSuccessChance: 20,
    handleAtipaRinuncia: vi.fn(),
    handleAtipaProva: vi.fn(),
    showBulliEvent: false,
    setShowBulliEvent: vi.fn(),
    handleBulliCedi: vi.fn(),
    handleBulliResisti: vi.fn(),
    gameOver: false,
    gameOverReason: 'Test',
    handleReset: vi.fn(),
    showResetDialog: false,
    setShowResetDialog: vi.fn(),
    showKeyboardHelp: false,
    setShowKeyboardHelp: vi.fn(),
    stanchezza: 10,
    ...overrides,
  }
}

describe('SocialDialogsGroup', () => {
  it('renderizza i dialog social sempre presenti e non monta l’help quando è chiuso', () => {
    render(<SocialDialogsGroup social={makeProps()} currentEvent="Evento bulli" />)

    expect(screen.getByText('AtipaEventDialog')).toBeInTheDocument()
    expect(screen.getByText('BulliDialog')).toBeInTheDocument()
    expect(screen.getByText('GameOverDialog')).toBeInTheDocument()
    expect(screen.getByText('ResetDialog')).toBeInTheDocument()
    expect(screen.queryByText('KeyboardShortcutsDialog')).not.toBeInTheDocument()
  })

  it('renderizza la dialog scorciatoie quando showKeyboardHelp è true', () => {
    render(<SocialDialogsGroup social={makeProps({ showKeyboardHelp: true })} currentEvent="Evento bulli" />)

    expect(screen.getByText('KeyboardShortcutsDialog')).toBeInTheDocument()
  })
})