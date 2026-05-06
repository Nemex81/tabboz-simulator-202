import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActionButton } from './ActionButton'

const announceMock = vi.fn()

vi.mock('@/components/A11yLiveRegion', () => ({
  useA11y: () => ({ announce: announceMock }),
}))

describe('ActionButton', () => {
  beforeEach(() => {
    announceMock.mockReset()
  })

  it('usa il context A11y e rende la scorciatoia accessibile', () => {
    const onClick = vi.fn()

    render(
      <ActionButton
        icon={<span>+</span>}
        label="Studia"
        shortcut="Ctrl+S"
        helpText="Apri lo studio"
        onClick={onClick}
      />,
    )

    const button = screen.getByRole('button', { name: 'Studia' })
    fireEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(announceMock).toHaveBeenCalledTimes(1)
    expect(announceMock).toHaveBeenCalledWith('Apri lo studio')
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Control+S')
    expect(screen.getByText('Scorciatoia: Ctrl+S')).toBeInTheDocument()
  })

  it('annuncia l helpText anche da tastiera', () => {
    const onClick = vi.fn()

    render(
      <ActionButton
        icon={<span>+</span>}
        label="Riposa"
        helpText="Riposati adesso"
        onClick={onClick}
      />,
    )

    const button = screen.getByRole('button', { name: 'Riposa' })

    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(announceMock).toHaveBeenCalledTimes(1)
    expect(announceMock).toHaveBeenCalledWith('Riposati adesso')
  })
})