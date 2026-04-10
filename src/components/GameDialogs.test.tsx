import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameDialogs } from './GameDialogs'
import type { GameDialogsProps } from '@/components/dialogs/game-dialogs.types'
import { JOBS } from '@/lib/job-system'

vi.mock('@/components/dialogs/SchoolDialogsGroup', () => ({
  SchoolDialogsGroup: () => <div>SchoolDialogsGroup</div>,
}))

vi.mock('@/components/dialogs/CityDialogsGroup', () => ({
  CityDialogsGroup: () => <div>CityDialogsGroup</div>,
}))

vi.mock('@/components/dialogs/SocialDialogsGroup', () => ({
  SocialDialogsGroup: () => <div>SocialDialogsGroup</div>,
}))

function makeProps(): GameDialogsProps {
  return {
    school: {
      showReportCard: false,
      grades: { italiano: 6, matematica: 6 } as GameDialogsProps['school']['grades'],
      currentMedia: 6,
      reportCardPassed: true,
      schoolYear: 1,
      handleReportCardContinue: vi.fn(),
      condotta: 8,
      assenze: 0,
      showSchoolEvent: false,
      schoolEvent: null,
      handleSchoolEventChoice: vi.fn(),
      setShowSchoolEvent: vi.fn(),
      showSubjectDialog: false,
      setShowSubjectDialog: vi.fn(),
      handleStudySubject: vi.fn(),
      stanchezza: 10,
      playerGender: 'maschio',
      showTeacherDialog: false,
      setShowTeacherDialog: vi.fn(),
      handleTeacherSelection: vi.fn(),
      teacherActionType: 'corrompi',
      soldi: 20,
    },
    city: {
      showMetallariEvent: false,
      setShowMetallariEvent: vi.fn(),
      currentEvent: 'Evento città',
      handleMetallariScappa: vi.fn(),
      handleMetallariCombatti: vi.fn(),
      showPoliceEvent: false,
      setShowPoliceEvent: vi.fn(),
      handlePoliceScappa: vi.fn(),
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
      } as unknown as GameDialogsProps['city']['playerStats'],
      playerSchoolYear: 1,
    },
    social: {
      showAtipaEvent: false,
      setShowAtipaEvent: vi.fn(),
      atipaSuccessChance: 20,
      handleAtipaRinuncia: vi.fn(),
      handleAtipaProva: vi.fn(),
      showBulliEvent: false,
      setShowBulliEvent: vi.fn(),
      handleBulliCedi: vi.fn(),
      handleBulliResisti: vi.fn(),
      gameOver: false,
      gameOverReason: 'Test',
      handleReset: vi.fn(),
      showResetDialog: false,
      setShowResetDialog: vi.fn(),
      showKeyboardHelp: false,
      setShowKeyboardHelp: vi.fn(),
      stanchezza: 10,
    },
  }
}

describe('GameDialogs', () => {
  it('compone i tre gruppi di dialog per dominio', () => {
    render(<GameDialogs {...makeProps()} />)

    expect(screen.getByText('SchoolDialogsGroup')).toBeInTheDocument()
    expect(screen.getByText('CityDialogsGroup')).toBeInTheDocument()
    expect(screen.getByText('SocialDialogsGroup')).toBeInTheDocument()
  })
})