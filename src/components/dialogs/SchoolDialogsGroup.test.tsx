import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SchoolDialogsGroup } from './SchoolDialogsGroup'
import type { SchoolDialogsProps } from './game-dialogs.types'

vi.mock('@/components/ReportCardDialog', () => ({
  ReportCardDialog: () => <div>ReportCardDialog</div>,
}))

vi.mock('@/components/SchoolEventDialog', () => ({
  SchoolEventDialog: () => <div>SchoolEventDialog</div>,
}))

vi.mock('@/components/SubjectSelectionDialog', () => ({
  SubjectSelectionDialog: () => <div>SubjectSelectionDialog</div>,
}))

vi.mock('@/components/TeacherSelectionDialog', () => ({
  TeacherSelectionDialog: () => <div>TeacherSelectionDialog</div>,
}))

function makeProps(overrides: Partial<SchoolDialogsProps> = {}): SchoolDialogsProps {
  return {
    showReportCard: false,
    grades: { italiano: 6, matematica: 6 } as SchoolDialogsProps['grades'],
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
    ...overrides,
  }
}

describe('SchoolDialogsGroup', () => {
  it('non renderizza dialog opzionali quando tutte le flag sono false', () => {
    render(<SchoolDialogsGroup school={makeProps()} />)

    expect(screen.queryByText('ReportCardDialog')).not.toBeInTheDocument()
    expect(screen.queryByText('SchoolEventDialog')).not.toBeInTheDocument()
    expect(screen.queryByText('SubjectSelectionDialog')).not.toBeInTheDocument()
    expect(screen.queryByText('TeacherSelectionDialog')).not.toBeInTheDocument()
  })

  it('renderizza solo i dialog scolastici richiesti dalle flag', () => {
    render(<SchoolDialogsGroup school={makeProps({ showReportCard: true, showTeacherDialog: true })} />)

    expect(screen.getByText('ReportCardDialog')).toBeInTheDocument()
    expect(screen.getByText('TeacherSelectionDialog')).toBeInTheDocument()
    expect(screen.queryByText('SchoolEventDialog')).not.toBeInTheDocument()
  })
})