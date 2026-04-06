import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SchoolType, SubjectGrades, getSubjectDisplayName } from '@/lib/types'
import { getActiveSubjectsForYear, getGradeWeight, SubjectDefinition } from '@/lib/subjects'

interface GradeProgressPanelProps {
  grades: SubjectGrades
  schoolType: SchoolType
  schoolYear: number
}

function gradeColor(grade: number): string {
  if (grade >= 8) return 'text-green-500'
  if (grade >= 6) return 'text-yellow-500'
  if (grade >= 5) return 'text-orange-500'
  return 'text-red-500'
}

function gradeBarColor(grade: number): string {
  if (grade >= 8) return 'bg-green-500'
  if (grade >= 6) return 'bg-yellow-500'
  if (grade >= 5) return 'bg-orange-500'
  return 'bg-red-500'
}

function gradeSuffix(grade: number): string {
  if (grade >= 9) return '★'
  if (grade < 5) return '✗'
  return ''
}

function calculateWeightedAvg(
  grades: SubjectGrades,
  subjects: SubjectDefinition[],
  schoolType: SchoolType
): number {
  const gpaSubjects = subjects.filter(s => s.countsForGPA)
  if (gpaSubjects.length === 0) return 0
  let totalWeight = 0
  let weightedSum = 0
  for (const subj of gpaSubjects) {
    const grade = grades[subj.key]
    if (grade === undefined) continue
    const w = getGradeWeight(subj, schoolType)
    totalWeight += w
    weightedSum += grade * w
  }
  if (totalWeight === 0) return 0
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

export function GradeProgressPanel({ grades, schoolType, schoolYear }: GradeProgressPanelProps) {
  const activeSubjects = getActiveSubjectsForYear(schoolType, schoolYear)
  const gpaSubjects = activeSubjects.filter(s => s.countsForGPA)
  const nonGpaSubjects = activeSubjects.filter(s => !s.countsForGPA)
  const weightedAvg = calculateWeightedAvg(grades, activeSubjects, schoolType)

  return (
    <div className="space-y-4">
      {/* Media pesata */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-muted-foreground">Media ponderata anno {schoolYear}</span>
        <span className={`text-2xl font-black ${gradeColor(weightedAvg)}`}>
          {weightedAvg.toFixed(1)}
          {weightedAvg >= 6 ? ' ✓' : ' ✗'}
        </span>
      </div>

      {/* Materie che contano per la media */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Materie valutate ({gpaSubjects.length})
        </h4>
        {gpaSubjects.map(subj => {
          const grade = grades[subj.key] ?? 6
          const weight = getGradeWeight(subj, schoolType)
          const barWidth = (grade / 10) * 100
          return (
            <Card key={subj.key} className="p-2 bg-muted/30 border-muted">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium truncate" title={subj.displayName}>
                      {getSubjectDisplayName(subj.key)}
                    </span>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <span className="text-xs text-muted-foreground">×{weight.toFixed(1)}</span>
                      <span className={`text-sm font-bold ${gradeColor(grade)}`}>
                        {grade}{gradeSuffix(grade)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${gradeBarColor(grade)}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Materie tipo PCTO/religione */}
      {nonGpaSubjects.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Non valutate per media ({nonGpaSubjects.length})
          </h4>
          {nonGpaSubjects.map(subj => {
            const grade = grades[subj.key]
            return (
              <div key={subj.key} className="flex items-center justify-between px-2 py-1 rounded bg-muted/20">
                <span className="text-xs text-muted-foreground truncate">
                  {getSubjectDisplayName(subj.key)}
                </span>
                <Badge variant="outline" className="text-xs shrink-0 ml-2">
                  {grade !== undefined ? grade : '—'}
                </Badge>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
