import { describe, expect, it } from 'vitest'
import {
  calcMaxRelazioni,
  canStartNewRomanticRelationship,
  isRomanticallyCompatible,
  normalizeRelationshipCandidate,
} from './gender-utils'

describe('normalizeRelationshipCandidate', () => {
  it('assegna una sourceKey legacy stabile quando manca nei dati salvati', () => {
    const normalized = normalizeRelationshipCandidate({
      id: 'legacy-rel-1',
      name: 'Jessica',
      metAt: 'in rete' as import('@/lib/types').Relationship['metAt'],
      difficulty: 'media',
      preference: 'figosita',
      relationshipLevel: 0,
      isActive: false,
    })

    expect(normalized.sourceKey).toBe('legacy-relationship:legacy-rel-1')
    expect(normalized.sourceType).toBe('generated_interest')
    expect(normalized.metAt).toBe('online')
    expect(normalized.gender).toBe('F')
    expect(normalized.orientamentoSessuale).toBe('eterosessuale')
  })
})

describe('calcMaxRelazioni', () => {
  it('calcola il cap in base a carisma, figosita e intelligenza', () => {
    expect(calcMaxRelazioni({ carisma: 0, figosita: 0, intelligenza: 0 })).toBe(1)
    expect(calcMaxRelazioni({ carisma: 60, figosita: 80, intelligenza: 0 })).toBe(4)
  })

  it('blocca nuove relazioni quando le attive raggiungono il cap', () => {
    expect(canStartNewRomanticRelationship(
      { carisma: 0, figosita: 0, intelligenza: 0 },
      [{ isActive: true }],
    )).toBe(false)
  })
})

describe('isRomanticallyCompatible', () => {
  it('accetta candidati dello stesso genere per un profilo bisessuale quando anche il candidato e compatibile', () => {
    expect(isRomanticallyCompatible('maschio', 'bisessuale', 'M', 'omosessuale')).toBe(true)
  })

  it('blocca sempre i match romantici per un profilo asessuale', () => {
    expect(isRomanticallyCompatible('maschio', 'asessuale', 'F', 'eterosessuale')).toBe(false)
  })
})
