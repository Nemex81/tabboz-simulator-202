import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { A11yLiveRegion, A11yProvider, useA11y } from './A11yLiveRegion'

const domAnnounceMock = vi.fn()
const toastMock = vi.fn()

vi.mock('@/lib/a11y-announce', () => ({
  announce: (...args: unknown[]) => domAnnounceMock(...args),
}))

vi.mock('sonner', () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}))

function Trigger() {
  const { announce } = useA11y()

  return (
    <button type="button" onClick={() => announce('Messaggio test', 'assertive')}>
      Annuncia
    </button>
  )
}

describe('A11yLiveRegion', () => {
  it('renderizza i due canali live region', () => {
    render(
      <A11yProvider>
        <A11yLiveRegion />
      </A11yProvider>,
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('espone announce via context e inoltra il messaggio ai due canali', () => {
    render(
      <A11yProvider>
        <A11yLiveRegion />
        <Trigger />
      </A11yProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Annuncia' }))

    expect(domAnnounceMock).toHaveBeenCalledWith('Messaggio test', 'assertive')
    expect(toastMock).toHaveBeenCalledWith('Messaggio test', { duration: 3000 })
  })
})