import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SubjectGrades, getSubjectDisplayName } from '@/lib/types'
import { GraduationCap, Trophy, X } from '@phosphor-icons/react'

interface ReportCardDialogProps {
  open: boolean
  grades: SubjectGrades
  media: number
  isPassed: boolean
  schoolYear: number
  onContinue: () => void
  isLastYear?: boolean
  condotta?: number
  assenze?: number
}

export function ReportCardDialog({
  open,
  grades,
  media,
  isPassed,
  schoolYear,
  onContinue,
  isLastYear = false,
  condotta,
  assenze
}: ReportCardDialogProps) {
  const getYearName = (year: number): string => {
    switch (year) {
      case 1: return 'Prima Superiore'
      case 2: return 'Seconda Superiore'
      case 3: return 'Terza Superiore'
      case 4: return 'Quarta Superiore'
      case 5: return 'Quinta Superiore'
      default: return `Anno ${year}`
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={() => {}}>
      <AlertDialogContent className={`border-2 max-w-2xl ${isPassed ? 'border-accent' : 'border-destructive'}`}>
        <AlertDialogHeader>
          <AlertDialogTitle className={`text-3xl text-center flex items-center justify-center gap-3 ${isPassed ? 'text-accent' : 'text-destructive'}`}>
            {isPassed ? (
              <>
                <Trophy size={48} weight="fill" />
                {isLastYear ? 'HAI VINTO! MATURITÀ SUPERATA!' : 'PROMOSSO!'}
              </>
            ) : (
              <>
                <X size={48} weight="fill" />
                BOCCIATO!
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg py-4">
            <div className="mb-4">
              <div className="text-2xl font-bold text-foreground mb-2">
                PAGELLA - {getYearName(schoolYear)}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6 max-h-96 overflow-y-auto">
          {Object.entries(grades).map(([subject, grade]) => (
            <div
              key={subject}
              className={`p-4 rounded-lg border-2 ${
                grade >= 6 ? 'border-accent bg-accent/10' : 'border-destructive bg-destructive/10'
              }`}
            >
              <div className="text-sm text-muted-foreground uppercase font-semibold mb-1">
                {getSubjectDisplayName(subject)}
              </div>
              <div className={`text-4xl font-bold ${grade >= 6 ? 'text-accent' : 'text-destructive'}`}>
                {grade}
              </div>
            </div>
          ))}
        </div>

        <div className={`p-6 rounded-lg border-2 mb-6 ${isPassed ? 'border-accent bg-accent/20' : 'border-destructive bg-destructive/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap size={48} weight="fill" className={isPassed ? 'text-accent' : 'text-destructive'} />
              <span className="text-xl font-bold">Media Finale:</span>
            </div>
            <div className={`text-5xl font-black ${isPassed ? 'text-accent' : 'text-destructive'}`}>
              {media.toFixed(1)}
            </div>
          </div>
          {(condotta !== undefined || assenze !== undefined) && (
            <div className="mt-4 flex gap-4 text-sm">
              {condotta !== undefined && (
                <div className={`px-3 py-1 rounded font-bold ${
                  condotta >= 7 ? 'bg-accent/30 text-accent' : condotta >= 6 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-destructive/30 text-destructive'
                }`}>
                  Condotta: {condotta.toFixed(1)}/10
                </div>
              )}
              {assenze !== undefined && (
                <div className={`px-3 py-1 rounded font-bold ${
                  assenze < 15 ? 'bg-accent/30 text-accent' : assenze < 25 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-destructive/30 text-destructive'
                }`}>
                  Assenze: {assenze} giorni
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center mb-4 space-y-2">
          {isPassed && !isLastYear && (
            <>
              <div className="text-lg font-bold text-accent">
                ⭐ Complimenti! Sei passato alla {getYearName(schoolYear + 1)}! ⭐
              </div>
              <div className="text-sm text-muted-foreground">
                I voti verranno resettati a 6 per il nuovo anno scolastico
              </div>
            </>
          )}
          {isPassed && isLastYear && (
            <>
              <div className="text-2xl font-black text-accent animate-pulse mb-2">
                🎉 INCREDIBILE! HAI VINTO! 🎉
              </div>
              <div className="text-lg font-bold text-accent">
                Hai completato le superiori! Sei una LEGGENDA del quartiere!
              </div>
            </>
          )}
          {!isPassed && (
            <>
              <div className="text-lg font-bold text-destructive">
                ❌ Media sotto il 6! BOCCIATO! ❌
              </div>
              <div className="text-sm text-muted-foreground">
                {schoolYear === 5 
                  ? 'Bocciato alla MATURITÀ! Che SFIGA!' 
                  : 'Dovrai ripetere l\'anno! SFIGATO!'}
              </div>
            </>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={onContinue} className="w-full text-lg py-6">
            {isPassed && !isLastYear && `Avanza alla ${getYearName(schoolYear + 1)}`}
            {isPassed && isLastYear && '🏆 HAI VINTO! 🏆'}
            {!isPassed && 'Torna al Menu Principale'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
