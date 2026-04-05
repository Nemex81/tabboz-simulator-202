import { useState, useEffect, useRef } from 'react'
import { HandCoins, Fist, CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SubjectGrades, getSubjectDisplayName } from '@/lib/types'

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
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const firstButtonRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    if (open && firstButtonRef.current) {
      firstButtonRef.current.focus()
    }
  }, [open])
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selectedSubject && open) {
        handleConfirm()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    window.addEventListener('keydown', handleEnter)
    
    return () => {
      window.removeEventListener('keydown', handleEscape)
      window.removeEventListener('keydown', handleEnter)
    }
  }, [open, selectedSubject])
  
  const handleConfirm = () => {
    if (selectedSubject) {
      onSelectTeacher(selectedSubject)
      setSelectedSubject(null)
    }
  }
  
  const getGradeIndicator = (grade: number) => {
    if (grade < 6) return { icon: <XCircle size={20} weight="fill" className="text-destructive" />, color: 'text-destructive', label: 'Insufficiente' }
    if (grade < 7) return { icon: <Warning size={20} weight="fill" className="text-accent" />, color: 'text-accent', label: 'Sufficiente' }
    return { icon: <CheckCircle size={20} weight="fill" className="text-primary" />, color: 'text-primary', label: 'Buono' }
  }
  
  const subjects = Object.entries(grades)
  const canAfford = actionType === 'corrompi' ? soldi >= 100 : true
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className={`max-w-4xl max-h-[80vh] overflow-y-auto border-2 ${actionType === 'corrompi' ? 'border-primary' : 'border-destructive'}`}
        aria-modal="true"
        role="dialog"
      >
        <DialogHeader>
          <DialogTitle className={`text-2xl flex items-center gap-2 ${actionType === 'corrompi' ? 'text-primary' : 'text-destructive'}`}>
            {actionType === 'corrompi' ? (
              <>
                <HandCoins size={32} weight="fill" />
                SCEGLI QUALE PROFESSORE CORROMPERE
              </>
            ) : (
              <>
                <Fist size={32} weight="fill" />
                SCEGLI QUALE PROFESSORE MINACCIARE
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-lg">
            {actionType === 'corrompi' ? (
              <>
                Seleziona una materia per corrompere il professore con 100€.
                {!canAfford && (
                  <div className="mt-2 p-3 bg-destructive/20 border border-destructive rounded text-destructive font-bold">
                    ⚠️ NON HAI ABBASTANZA SOLDI! Servono 100€
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <p>Seleziona una materia per minacciare il professore.</p>
                <div className="p-3 bg-destructive/20 border border-destructive rounded text-destructive font-bold">
                  ⚠️ ATTENZIONE: 30% di probabilità di ESPULSIONE IMMEDIATA!
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {subjects.map(([subject, grade], index) => {
            const indicator = getGradeIndicator(grade)
            const isSelected = selectedSubject === subject
            
            return (
              <button
                key={subject}
                ref={index === 0 ? firstButtonRef : null}
                onClick={() => setSelectedSubject(subject)}
                disabled={!canAfford && actionType === 'corrompi'}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? `${actionType === 'corrompi' ? 'border-primary bg-primary/20' : 'border-destructive bg-destructive/20'} scale-105` 
                    : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                  }
                  ${!canAfford && actionType === 'corrompi' ? 'opacity-50 cursor-not-allowed' : ''}
                  focus:outline-none focus:ring-4 focus:ring-primary/50
                  disabled:hover:scale-100 disabled:hover:border-border
                `}
                aria-label={`${getSubjectDisplayName(subject)}, voto attuale ${grade.toFixed(1)}, ${indicator.label}`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground uppercase">
                    {getSubjectDisplayName(subject)}
                  </span>
                  {indicator.icon}
                </div>
                <div className={`text-3xl font-bold ${indicator.color}`}>
                  {grade.toFixed(1)}
                </div>
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      grade < 6 ? 'bg-destructive' : grade < 7 ? 'bg-accent' : 'bg-primary'
                    }`}
                    style={{ width: `${(grade / 10) * 100}%` }}
                  />
                </div>
                {isSelected && (
                  <div className={`mt-2 text-xs font-bold ${actionType === 'corrompi' ? 'text-primary' : 'text-destructive'}`}>
                    ✓ SELEZIONATA
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-2"
          >
            Annulla (Esc)
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSubject || (!canAfford && actionType === 'corrompi')}
            className={`flex-1 border-2 disabled:opacity-40 ${
              actionType === 'corrompi' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-destructive text-destructive-foreground border-destructive'
            }`}
          >
            {actionType === 'corrompi' ? (
              <>
                <HandCoins size={24} className="mr-2" weight="fill" />
                Corrompi (Enter)
              </>
            ) : (
              <>
                <Fist size={24} className="mr-2" weight="fill" />
                Minaccia (Enter)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
