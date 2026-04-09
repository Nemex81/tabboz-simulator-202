import { describe, expect, it } from 'vitest'
import { normalizeRelationshipCandidate } from './gender-utils'

describe('normalizeRelationshipCandidate', () => {
  it('assegna una sourceKey legacy stabile quando manca nei dati salvati', () => {
    const normalized = normalizeRelationshipCandidate({
      id: 'legacy-rel-1',
      name: 'Jessica',
      difficulty: 'media',
      preference: 'figosita',
      relationshipLevel: 0,
      isActive: false,
    })

    expect(normalized.sourceKey).toBe('legacy-relationship:legacy-rel-1')
    expect(normalized.sourceType).toBe('generated_interest')
    expect(normalized.gender).toBe('F')
    expect(normalized.orientamentoSessuale).toBe('eterosessuale')
  })
})
