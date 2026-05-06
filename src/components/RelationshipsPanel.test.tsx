import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { GameStats, Relationship } from '@/lib/types'
import { RelationshipsPanel } from './RelationshipsPanel'

function makeStats(): GameStats {
  return {
    media: 6,
    muscoli: 40,
    coattaggine: 30,
    figosita: 55,
    intelligenza: 45,
    carisma: 50,
    reputazione: 35,
    soldi: 120,
    stanchezza: 10,
    stress: 10,
    morale: 60,
    salute: 100,
    hasMotorino: false,
  }
}

function makeRelationship(overrides: Partial<Relationship> = {}): Relationship {
  return {
    id: 'rel-1',
    name: 'Jessica',
    sourceKey: 'relationship:test',
    sourceType: 'generated_interest',
    metAt: 'online',
    gender: 'F',
    orientamentoSessuale: 'eterosessuale',
    difficulty: 'media',
    preference: 'figosita',
    relationshipLevel: 0,
    isActive: false,
    ...overrides,
  }
}

describe('RelationshipsPanel', () => {
  it('mostra il badge di origine per una relazione nata in rete e disabilita il pulsante senza azioni', () => {
    render(
      <RelationshipsPanel
        playerProfile={null}
        relationships={[makeRelationship()]}
        stats={makeStats()}
        onTryRelationship={vi.fn()}
        actionsRemaining={0}
      />
    )

    expect(screen.getByText('Origine: Rete')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /provarci/i })).toBeDisabled()
  })

  it('mostra la sezione delle relazioni attive con origine visibile', () => {
    render(
      <RelationshipsPanel
        playerProfile={null}
        relationships={[makeRelationship({ isActive: true, relationshipLevel: 1, sourceType: 'direct_girlfriend' })]}
        stats={makeStats()}
        onTryRelationship={vi.fn()}
        actionsRemaining={2}
      />
    )

    expect(screen.getByText(/relazioni attive/i)).toBeInTheDocument()
    expect(screen.getByText('Origine: Rete')).toBeInTheDocument()
  })
})