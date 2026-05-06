/**
 * JobSelectionDialog — TASK-B
 * Dialog accessibile per la selezione del lavoro part-time.
 */
import { memo } from 'react'
import { Briefcase } from '@phosphor-icons/react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { JobDefinition, JobId } from '@/lib/job-system'
import { getJobBlockedReason } from '@/lib/job-system'
import type { GameStats } from '@/lib/types'

export interface JobSelectionDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  availableJobs: JobDefinition[]
  stats: GameStats
  schoolYear: number
  onSelectJob: (jobId: JobId) => void
}

export const JobSelectionDialog = memo(function JobSelectionDialog({
  open,
  onOpenChange,
  availableJobs,
  stats,
  schoolYear,
  onSelectJob,
}: JobSelectionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-secondary max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-secondary flex items-center gap-2">
            <Briefcase size={32} weight="fill" />
            Scegli il turno di lavoro
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vedi tutti i lavori compatibili con questa fascia oraria. Quelli non ancora disponibili restano visibili con il motivo del blocco.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div
          role="list"
          aria-label="Lavori disponibili"
          className="space-y-3 my-2"
        >
          {availableJobs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nessun lavoro disponibile in questa fascia oraria.
            </p>
          )}
          {availableJobs.map(job => {
            const disabledReason = getJobBlockedReason(job, stats, { schoolYear })
            const disabled = disabledReason !== null
            return (
              <div key={job.id} role="listitem">
                <Button
                  variant={disabled ? 'outline' : 'default'}
                  disabled={disabled}
                  onClick={() => {
                    onSelectJob(job.id)
                    onOpenChange(false)
                  }}
                  className="w-full text-left justify-start gap-3 h-auto py-3"
                  aria-label={
                    `${job.label}: ${job.description}. Paga: +${job.payPerShift}\u20AC per turno.` +
                    (disabled ? ` Non disponibile: ${disabledReason}` : ' Disponibile.')
                  }
                  aria-disabled={disabled}
                >
                  <span className="text-xl" aria-hidden="true">
                    {job.icon ?? '\u{1F4BC}'}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="font-bold block">{job.label}</span>
                    <span className="text-xs text-muted-foreground block truncate">
                      {job.description}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      {job.allowedPhases.join(', ')} • {job.allowedDayTypes.join(', ')} • anno min {job.minSchoolYear}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-primary shrink-0">
                    +{job.payPerShift}€
                  </span>
                </Button>
                {disabled && disabledReason && (
                  <p
                    role="note"
                    className="text-xs text-destructive mt-1 ml-2"
                    aria-live="polite"
                  >
                    {'\u26A0\uFE0F'} {disabledReason}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
