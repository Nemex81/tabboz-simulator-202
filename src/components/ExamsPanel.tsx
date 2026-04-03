import React from 'react'
import { ScheduledExam } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarCheck, Brain, CheckCircle, Warning } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { getSubjectDisplayName } from '@/lib/types'
import { getDifficultyText } from '@/lib/exam-system'

interface ExamsPanelProps {
  exams: ScheduledExam[]
  onPrepareExam: (examSubject: string) => void
  actionsRemaining: number
  stanchezza: number
}

export function ExamsPanel({ exams, onPrepareExam, actionsRemaining, stanchezza }: ExamsPanelProps) {
  if (exams.length === 0) {
    return (
      <Card className="p-6 border-2 border-muted bg-card/50">
        <div className="text-center text-muted-foreground">
          <CalendarCheck size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Nessuna verifica programmata!</p>
          <p className="text-sm mt-2">Goditi questo momento di pace!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-2 border-primary bg-card">
      <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
        <CalendarCheck size={28} weight="fill" />
        VERIFICHE PROGRAMMATE ({exams.length})
      </h3>
      <div className="grid gap-3">
        {exams.map((exam, index) => (
          <div
            key={`${exam.subject}-${index}`}
            className={`p-4 rounded-lg border-2 ${
              exam.isPrepared 
                ? 'bg-accent/10 border-accent' 
                : exam.daysUntil <= 1 
                ? 'bg-destructive/10 border-destructive animate-pulse' 
                : 'bg-muted/30 border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {exam.isPrepared ? (
                    <CheckCircle size={24} weight="fill" className="text-accent" />
                  ) : exam.daysUntil <= 1 ? (
                    <Warning size={24} weight="fill" className="text-destructive" />
                  ) : (
                    <CalendarCheck size={24} weight="fill" className="text-primary" />
                  )}
                  <span className="font-bold text-lg">
                    {getSubjectDisplayName(exam.subject)}
                  </span>
                  <Badge 
                    variant={exam.daysUntil <= 1 ? 'destructive' : 'default'}
                    className="ml-2"
                  >
                    {exam.daysUntil === 0 ? 'DOMANI!' : `Tra ${exam.daysUntil} giorni`}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`ml-2 ${
                      exam.difficulty === 'brutale' ? 'border-destructive text-destructive' :
                      exam.difficulty === 'difficile' ? 'border-accent text-accent' :
                      exam.difficulty === 'facile' ? 'border-primary text-primary' :
                      ''
                    }`}
                  >
                    {getDifficultyText(exam.difficulty)}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  {exam.isPrepared ? (
                    <div className="flex items-center gap-2 text-accent font-bold">
                      <CheckCircle size={16} weight="fill" />
                      <span>SEI PREPARATO! Andrai benissimo!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Warning size={16} weight="fill" className="text-destructive" />
                      <span>Non hai ancora studiato!</span>
                    </div>
                  )}
                </div>
              </div>
              {!exam.isPrepared && (
                <Button
                  onClick={() => onPrepareExam(exam.subject)}
                  disabled={actionsRemaining === 0 || stanchezza > 80}
                  variant="default"
                  className="bg-primary hover:bg-primary/80"
                >
                  <Brain size={20} weight="fill" className="mr-2" />
                  Prepara
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <p>💡 Preparati per le verifiche studiando in anticipo! Se arrivi preparato, l'Intelligenza moltiplica il voto!</p>
      </div>
    </Card>
  )
}
