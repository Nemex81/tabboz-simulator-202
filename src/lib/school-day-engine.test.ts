import { describe, expect, it, vi, afterEach } from 'vitest'
import { generateSchoolDaySlots } from './school-day-engine'
import type { GameStats, Teacher, TimetableSlot } from '@/lib/types'

vi.mock('@/lib/school-structured-events', () => ({
  getContextualEvents: vi.fn(() => []),
}))

vi.mock('@/lib/school-day-templates', () => ({
  pickTemplate: vi.fn(() => 'template'),
  resolveTemplate: vi.fn(() => 'Lezione regolare in corso.'),
}))

function makeStats(overrides: Partial<GameStats> = {}): GameStats {
  return {
    muscoli: 10,
    coattaggine: 10,
    soldi: 100,
    media: 6,
    stanchezza: 10,
    stress: 10,
    morale: 50,
    figosita: 10,
    reputazione: 10,
    intelligenza: 10,
    carisma: 10,
    salute: 100,
    hasMotorino: false,
    ...overrides,
  }
}

function makeTeachers(): Teacher[] {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `teacher-${index + 1}`,
    name: `Prof ${index + 1}`,
    relazione: 20,
    subjectKey: index % 2 === 0 ? 'matematica' : 'italiano',
    gender: 'M',
    severita: 5,
    simpatia: 5,
    corruttibilita: 5,
    resistenzaMinacce: 5,
    sogliaRottura: 10,
    isOstile: false,
    memoria: [],
    corruptionCount: 0,
    threatCount: 0,
  })) as Teacher[]
}

function makeSchedule(): TimetableSlot[] {
  return Array.from({ length: 6 }, (_, index) => ({
    subjectKey: index % 2 === 0 ? 'matematica' : 'italiano',
    teacherId: `teacher-${index + 1}`,
  }))
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('generateSchoolDaySlots', () => {
  it('assegna DISCUSSIONE IN CLASSE solo a una lezione reale, mai prima o sull’intervallo', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0)
      .mockReturnValue(0.99)

    const slots = generateSchoolDaySlots(makeSchedule(), makeTeachers(), makeStats({ media: 6 }))

    expect(slots).toHaveLength(7)
    expect(slots[0].schoolEvent).toMatchObject({
      type: 'teacher',
      tier: 1,
      title: 'DISCUSSIONE IN CLASSE!',
      description: 'Il prof apre un dibattito. Media: 6.0. Vuoi partecipare?',
    })
    expect(slots[3].type).toBe('break')
    expect(slots[3].schoolEvent).toBeUndefined()
    expect(slots.filter(slot => slot.schoolEvent?.title === 'DISCUSSIONE IN CLASSE!')).toHaveLength(1)
    expect(slots.every((slot, index) => index === 0 || slot.schoolEvent === undefined)).toBe(true)
  })

  it('non schedula DISCUSSIONE IN CLASSE fuori dalla fascia media neutra', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const lowMediaSlots = generateSchoolDaySlots(makeSchedule(), makeTeachers(), makeStats({ media: 5.9 }))
    const highMediaSlots = generateSchoolDaySlots(makeSchedule(), makeTeachers(), makeStats({ media: 8 }))

    expect(lowMediaSlots.some(slot => slot.schoolEvent?.title === 'DISCUSSIONE IN CLASSE!')).toBe(false)
    expect(highMediaSlots.some(slot => slot.schoolEvent?.title === 'DISCUSSIONE IN CLASSE!')).toBe(false)
  })
})