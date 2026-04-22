import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Friend, GameStats } from '@/lib/types'
import { EnhancedFriendsPanel } from './EnhancedFriendsPanel'

vi.mock('@/hooks/useSoundFeedback', () => ({
  useSoundFeedback: () => ({
    play: vi.fn(),
  }),
}))

vi.mock('@/components/GirlfriendPanel', () => ({
  GirlfriendPanel: ({ girlfriend, partnerKey }: { girlfriend: { nome: string }; partnerKey: string }) => (
    <div data-testid="partner-card">{partnerKey}:{girlfriend.nome}</div>
  ),
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
        activePartners={[]}
        onGirlfriendAction={vi.fn()}
        onGirlfriendBreakup={vi.fn()}
      />
    )

    expect(screen.getByText('Provenienza: Rete')).toBeInTheDocument()
    expect(screen.getByText('Incontro: Online')).toBeInTheDocument()
  })

  it('renderizza due partner attivi distinti', () => {
    render(
      <EnhancedFriendsPanel
        playerProfile={null}
        friends={[]}
        stats={makeStats()}
        interactionsRemaining={2}
        onFriendAction={vi.fn()}
        activePartners={[
          {
            id: 'partner-1',
            relationshipSourceKey: 'relationship:partner-1',
            nome: 'Jessica',
            cognome: 'Rossi',
            gender: 'F',
            orientamentoSessuale: 'eterosessuale',
            eta: 16,
            classe: '2A',
            aspetto: 'carina',
            personalita: 'timida',
            interessePerTe: 80,
            figositaRichiesta: 50,
            statusSociale: 60,
            gelosa: false,
            hobby: [],
            coloreCapelli: 'Castani',
            scuola: 'ITIS',
            statPreferita: 'carisma',
            relationshipStatus: 'fidanzata',
            stats: { totalDates: 1, messagesExchanged: 0, giftsGiven: 0, fightsHad: 0, dateActivities: [], daysTogether: 1, jealousyLevel: 10, trustLevel: 60, happinessLevel: 70 },
          },
          {
            id: 'partner-2',
            relationshipSourceKey: 'relationship:partner-2',
            nome: 'Vanessa',
            cognome: 'Bianchi',
            gender: 'F',
            orientamentoSessuale: 'eterosessuale',
            eta: 17,
            classe: '3B',
            aspetto: 'bellissima',
            personalita: 'estroversa',
            interessePerTe: 75,
            figositaRichiesta: 60,
            statusSociale: 70,
            gelosa: true,
            hobby: [],
            coloreCapelli: 'Neri',
            scuola: 'Liceo',
            statPreferita: 'figosita',
            relationshipStatus: 'fidanzata',
            stats: { totalDates: 2, messagesExchanged: 1, giftsGiven: 0, fightsHad: 0, dateActivities: [], daysTogether: 3, jealousyLevel: 20, trustLevel: 65, happinessLevel: 80 },
          },
        ]}
        onGirlfriendAction={vi.fn()}
        onGirlfriendBreakup={vi.fn()}
      />
    )

    expect(screen.getByText('relationship:partner-1:Jessica')).toBeInTheDocument()
    expect(screen.getByText('relationship:partner-2:Vanessa')).toBeInTheDocument()
  })
})