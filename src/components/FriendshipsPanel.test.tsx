import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Friend, GameStats } from '@/lib/types'
import { FriendshipsPanel } from './FriendshipsPanel'

vi.mock('@/components/EnhancedFriendsPanel', () => ({
  EnhancedFriendsPanel: ({ friends }: { friends: Friend[] }) => (
    <div data-testid="friends-panel">{friends.length}</div>
  ),
}))

function makeStats(): GameStats {
  return {
    muscoli: 20,
    coattaggine: 20,
    soldi: 100,
    media: 6,
    stanchezza: 10,
    stress: 10,
    morale: 60,
    figosita: 20,
    reputazione: 20,
    intelligenza: 30,
    carisma: 30,
    salute: 100,
    hasMotorino: false,
  }
}

function makeFriend(id: string, name: string, overrides: Partial<Friend>): Friend {
  return {
    id,
    name,
    type: 'generico',
    affinita: 50,
    unlocked: true,
    gender: 'M',
    orientamentoSessuale: 'eterosessuale',
    carisma: 30,
    relazione: 50,
    intelligenza: 40,
    originType: 'extrascolastico',
    ...overrides,
  }
}

describe('FriendshipsPanel', () => {
  it('separa gli amici conosciuti in rete dagli altri extrascolastici', () => {
    render(
      <FriendshipsPanel
        playerProfile={null}
        friends={[
          makeFriend('school', 'Marco', { originType: 'compagno_classe', metAt: 'classe' }),
          makeFriend('extra', 'Luca', { originType: 'extrascolastico', metAt: 'quartiere' }),
          makeFriend('network', 'Davide', { originType: 'extrascolastico', metAt: 'online' }),
        ]}
        stats={makeStats()}
        interactionsRemaining={2}
        onFriendAction={vi.fn()}
        activePartners={[]}
        onGirlfriendAction={vi.fn()}
        onGirlfriendBreakup={vi.fn()}
      />
    )

    expect(screen.getByText('Tutti (3)')).toBeInTheDocument()
    expect(screen.getByText('Scuola (1)')).toBeInTheDocument()
    expect(screen.getByText('Extra (1)')).toBeInTheDocument()
    expect(screen.getByText('Rete (1)')).toBeInTheDocument()

    expect(screen.getByRole('tab', { name: 'Rete (1)' })).toBeInTheDocument()
  })
})