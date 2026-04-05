import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SubjectGrades, getSubjectDisplayName } from '@/lib/types'
import { HandCoins, Fist } from '@phosphor-icons/react'

interface TeacherSelectionDialogProps {
  open: boolean
  onClose: () => void
  grades: SubjectGrades
  onSelectTeacher: (subject: string) => void
  actionType: 'corrompi' | 'minaccia'
  soldi: number
}

export function TeacherSelectionDialog({
  open,
  onClose,
  grades,
  onSelectTeacher,
  actionType,
  soldi
}: TeacherSelectionDialogProps) {
  const handleSelect = (subject: string) => {
    onSelectTeacher(subject)
    onClose()
  }

  const subjects = Object.keys(grades)

  const canCorrompi = soldi >= 100

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-primary">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            {actionType === 'corrompi' ? (
              <>
                <HandCoins size={32} weight="fill" />
                Scegli quale professore CORROMPERE
              </>
            ) : (
              <>
                <Fist size={32} weight="fill" />
                Scegli quale professore MINACCIARE
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {actionType === 'corrompi' 
              ? 'Seleziona il professore da corrompere con 100€. Aumenterà il voto di 0.5 punti.'
              : 'Seleziona il professore da minacciare. ATTENZIONE: 30% di rischio espulsione! Se riesce, +1.5 voto e +15 coattaggine.'
            }
          </DialogDescription>
        </DialogHeader>

        {actionType === 'corrompi' && !canCorrompi && (
          <div className="p-4 bg-destructive/20 border border-destructive rounded-sm">
            <p className="text-destructive font-bold">
              ⚠️ Non hai abbastanza soldi! Servono 100€, ne hai {soldi}€.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {subjects.map((subject) => {
            const currentGrade = grades[subject]
            const disabled = actionType === 'corrompi' && !canCorrompi
            
            return (
              <Card
                key={subject}
                className={`p-4 border-2 transition-all ${
                  disabled 
                    ? 'opacity-50 cursor-not-allowed border-muted' 
                    : 'hover:border-primary hover:bg-primary/5 cursor-pointer border-border'
                }`}
                onClick={() => !disabled && handleSelect(subject)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">{getSubjectDisplayName(subject)}</span>
                  <span className={`text-xl font-bold ${currentGrade < 6 ? 'text-destructive' : 'text-secondary'}`}>
                    {currentGrade.toFixed(1)}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-sm overflow-hidden mb-3">
                  <div
                    className={`h-full ${currentGrade < 6 ? 'bg-destructive' : 'bg-secondary'}`}
                    style={{ width: `${(currentGrade / 10) * 100}%` }}
                  />
                </div>
                <Button
                  variant={actionType === 'corrompi' ? 'default' : 'destructive'}
                  size="sm"
                  className="w-full"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!disabled) handleSelect(subject)
                  }}
                >
                  {actionType === 'corrompi' ? (
                    <>
                      <HandCoins size={20} className="mr-2" />
                      Corrompi (100€)
                    </>
                  ) : (
                    <>
                      <Fist size={20} className="mr-2" />
                      Minaccia!
                    </>
                  )}
                </Button>
              </Card>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button onClick={onClose} variant="outline" className="w-full">
            Annulla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
