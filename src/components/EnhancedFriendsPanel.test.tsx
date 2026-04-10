import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Friend, GameStats } from '@/lib/types'
import { EnhancedFriendsPanel } from './EnhancedFriendsPanel'

vi.mock('@/hooks/useSoundFeedback', () => ({
  useSoundFeedback: () => ({
    play: vi.fn(),
  }),
}))

function makeStats(): GameStats {
  return {
    muscoli: 30,
    coattaggine: 30,
    soldi: 100,
    media: 6,
    stanchezza: 10,
    stress: 10,
    morale: 60,
    figosita: 30,
    reputazione: 20,
    intelligenza: 40,
    carisma: 35,
    salute: 100,
    hasMotorino: false,
  }
}

function makeFriend(): Friend {
  return {
    id: 'friend-online',
    name: 'Luca',
    type: 'generico',
    affinita: 45,
    unlocked: true,
    gender: 'M',
    orientamentoSessuale: 'eterosessuale',
    carisma: 40,
    relazione: 45,
    intelligenza: 55,
    originType: 'extrascolastico',
    metAt: 'online',
  }
}

describe('EnhancedFriendsPanel', () => {
  it('mostra la provenienza rete per gli amici conosciuti online', () => {
    render(
      <EnhancedFriendsPanel
        playerProfile={null}
        friends={[makeFriend()]}
        stats={makeStats()}
        interactionsRemaining={2}
        onFriendAction={vi.fn()}
        girlfriend={null}
        onGirlfriendAction={vi.fn()}
        onGirlfriendBreakup={vi.fn()}
      />
    )

    expect(screen.getByText('Provenienza: Rete')).toBeInTheDocument()
    expect(screen.getByText('Incontro: Online')).toBeInTheDocument()
  })
})