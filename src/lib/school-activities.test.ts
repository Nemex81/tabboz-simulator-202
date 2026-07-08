import { describe, it, expect } from 'vitest'
import { ARCHETYPES, getAutoChoiceIndex, resolveAutoBreak, resolveSchoolDayBlock } from './school-activities'
import type { SchoolActivitySettings, GameStats, HourSlot, Teacher, TimetableSlot } from './types'

describe('Hub Attività Scolastiche ed Automazione', () => {
  describe('ARCHETYPES', () => {
    it('dovrebbe configurare correttamente l\'archetipo secchione', () => {
      const secchione = ARCHETYPES.secchione
      expect(secchione.aulaDidattica).toBe('impegno')
      expect(secchione.aulaSociale).toBe('opportunista')
      expect(secchione.intervalloMode).toBe('studia')
    })

    it('dovrebbe configurare correttamente l\'archetipo bullo', () => {
      const bullo = ARCHETYPES.bullo
      expect(bullo.aulaDidattica).toBe('disturbo')
      expect(bullo.aulaSociale).toBe('sfida')
      expect(bullo.intervalloMode).toBe('casino')
    })
  })

  describe('getAutoChoiceIndex', () => {
    const settings: SchoolActivitySettings = {
      mode: 'assistita',
      archetype: 'secchione',
      aulaDidattica: 'impegno',
      aulaSociale: 'opportunista',
      intervalloMode: 'studia',
    }

    it('dovrebbe selezionare la scelta di impegno per interrogazione a sorpresa (didattica)', () => {
      // cse_interrogazione_a_sorpresa: impegno -> index 0 ("Rispondo come so")
      const idx = getAutoChoiceIndex('cse_interrogazione_a_sorpresa', 'didattica', settings, 2)
      expect(idx).toBe(0)
    })

    it('dovrebbe selezionare la scelta opportunista per bullo corridoio (sociale)', () => {
      // sm_bullo_corridoio: opportunista -> index 0 ("Gli dai i soldi (cedi)")
      const idx = getAutoChoiceIndex('sm_bullo_corridoio', 'sociale', settings, 3)
      expect(idx).toBe(0)
    })

    it('dovrebbe fare fallback a 0 se l\'evento non ha mappatura', () => {
      const idx = getAutoChoiceIndex('evento_inesistente', 'didattica', settings, 3)
      expect(idx).toBe(0)
    })
  })

  describe('resolveAutoBreak', () => {
    const stats: GameStats = {
      soldi: 100,
      stanchezza: 50,
      stress: 20,
      morale: 60,
      figosita: 50,
      reputazione: 40,
      intelligenza: 10,
      carisma: 10,
      salute: 100,
      hasMotorino: false,
      motorinoModello: '',
      motorinoTuning: 0,
      motorinoPezzi: [],
      muscoli: 10,
      coattaggine: 10,
      media: 6,
    }

    it('dovrebbe risolvere riposa riducendo la stanchezza', () => {
      const settings: SchoolActivitySettings = {
        mode: 'assistita',
        archetype: 'custom',
        aulaDidattica: 'invisibile',
        aulaSociale: 'evita',
        intervalloMode: 'riposa',
      }
      const res = resolveAutoBreak(settings, stats)
      expect(res.delta.stanchezza).toBe(-15)
      expect(res.message).toContain('rilassarti')
    })

    it('dovrebbe risolvere snack spendendo 3 euro e riducendo stanchezza se si hanno abbastanza soldi', () => {
      const settings: SchoolActivitySettings = {
        mode: 'assistita',
        archetype: 'custom',
        aulaDidattica: 'invisibile',
        aulaSociale: 'evita',
        intervalloMode: 'snack',
      }
      const res = resolveAutoBreak(settings, stats)
      expect(res.delta.soldi).toBe(-3)
      expect(res.delta.stanchezza).toBe(-10)
      expect(res.delta.morale).toBe(5)
    })

    it('dovrebbe fare fallback a riposo leggero se si scelga snack senza abbastanza soldi', () => {
      const settings: SchoolActivitySettings = {
        mode: 'assistita',
        archetype: 'custom',
        aulaDidattica: 'invisibile',
        aulaSociale: 'evita',
        intervalloMode: 'snack',
      }
      const poorStats = { ...stats, soldi: 1 }
      const res = resolveAutoBreak(settings, poorStats)
      expect(res.delta.soldi).toBeUndefined()
      expect(res.delta.stanchezza).toBe(-5)
    })
  })
})
