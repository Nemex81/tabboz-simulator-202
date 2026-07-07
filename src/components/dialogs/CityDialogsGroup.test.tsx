import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { JOBS } from '@/lib/job-system'
import { CityDialogsGroup } from './CityDialogsGroup'
import type { CityDialogsProps } from './game-dialogs.types'

vi.mock('@/components/JobSelectionDialog', () => ({
  JobSelectionDialog: () => <div>JobSelectionDialog</div>,
}))

vi.mock('@/components/dialogs/MetallariDialog', () => ({
  MetallariDialog: () => <div>MetallariDialog</div>,
}))

vi.mock('@/components/dialogs/PoliceDialog', () => ({
  PoliceDialog: () => <div>PoliceDialog</div>,
}))

vi.mock('@/components/dialogs/StreetRaceDialog', () => ({
  StreetRaceDialog: () => <div>StreetRaceDialog</div>,
}))

function makeProps(overrides: Partial<CityDialogsProps> = {}): CityDialogsProps {
  return {
    showMetallariEvent: false,
    setShowMetallariEvent: vi.fn(),
    currentEvent: 'Evento città',
    handleMetallariScappa: vi.fn(),
    handleMetallariCombatti: vi.fn(),
    showPoliceEvent: false,
    setShowPoliceEvent: vi.fn(),
    policeBribeCost: 50,
    handlePoliceScappa: vi.fn(),
    handlePoliceMazzetta: vi.fn(),
    handlePoliceCarisma: vi.fn(),
    handlePoliceCollabora: vi.fn(),
    showStreetRaceEvent: false,
    setShowStreetRaceEvent: vi.fn(),
    raceWinChance: 42,
    handleStreetRaceRifiuta: vi.fn(),
    handleStreetRaceAccetta: vi.fn(),
    betInfo: null,
    showJobSelectionDialog: false,
    setShowJobSelectionDialog: vi.fn(),
    availableJobsForDialog: [JOBS.dogsitter],
    onSelectJob: vi.fn(),
    playerStats: {
      media: 6,
      muscoli: 10,
      coattaggine: 10,
      figosita: 10,
      intelligenza: 10,
      carisma: 10,
      reputazione: 10,
      soldi: 20,
      stanchezza: 5,
      stress: 5,
      morale: 50,
      salute: 100,
      energia: 50,
      fame: 10,
      igiene: 50,
      hasMotorino: false,
    } as unknown as CityDialogsProps['playerStats'],
    playerSchoolYear: 1,
    ...overrides,
  }
}

describe('CityDialogsGroup', () => {
  it('renderizza sempre i dialog città base e omette il selettore lavori se chiuso', () => {
    render(<CityDialogsGroup city={makeProps()} />)

    expect(screen.getByText('MetallariDialog')).toBeInTheDocument()
    expect(screen.getByText('PoliceDialog')).toBeInTheDocument()
    expect(screen.getByText('StreetRaceDialog')).toBeInTheDocument()
    expect(screen.queryByText('JobSelectionDialog')).not.toBeInTheDocument()
  })

  it('renderizza il selettore lavori quando showJobSelectionDialog è true', () => {
    render(<CityDialogsGroup city={makeProps({ showJobSelectionDialog: true })} />)

    expect(screen.getByText('JobSelectionDialog')).toBeInTheDocument()
  })
})