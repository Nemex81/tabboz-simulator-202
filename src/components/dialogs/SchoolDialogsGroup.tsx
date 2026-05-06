import { ReportCardDialog } from '@/components/ReportCardDialog'
import { SchoolEventDialog } from '@/components/SchoolEventDialog'
import { SubjectSelectionDialog } from '@/components/SubjectSelectionDialog'
import { TeacherSelectionDialog } from '@/components/TeacherSelectionDialog'
import type { SchoolDialogsProps } from '@/components/dialogs/game-dialogs.types'

interface SchoolDialogsGroupProps {
  school: SchoolDialogsProps
}

export function SchoolDialogsGroup({ school }: SchoolDialogsGroupProps) {
  return (
    <>
      {school.showReportCard && (
        <ReportCardDialog
          open={school.showReportCard}
          grades={school.grades}
          media={school.currentMedia}
          isPassed={school.reportCardPassed}
          schoolYear={school.schoolYear}
          onContinue={school.handleReportCardContinue}
          condotta={school.condotta}
          assenze={school.assenze}
        />
      )}
      {school.showSchoolEvent && school.schoolEvent && (
        <SchoolEventDialog
          open={school.showSchoolEvent}
          event={school.schoolEvent}
          onChoice={school.handleSchoolEventChoice}
          onClose={() => school.setShowSchoolEvent(false)}
        />
      )}
      {school.showSubjectDialog && (
        <SubjectSelectionDialog
          open={school.showSubjectDialog}
          onSelectSubject={school.handleStudySubject}
          onClose={() => school.setShowSubjectDialog(false)}
          stanchezza={school.stanchezza}
          grades={school.grades}
          playerGender={school.playerGender}
        />
      )}
      {school.showTeacherDialog && (
        <TeacherSelectionDialog
          open={school.showTeacherDialog}
          onSelectTeacher={school.handleTeacherSelection}
          onClose={() => school.setShowTeacherDialog(false)}
          actionType={school.teacherActionType}
          soldi={school.soldi}
          grades={school.grades}
        />
      )}
    </>
  )
}