import { useState, useEffect, useRef } from 'react'
import { Brain, CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { NarrativePlayerGender, SubjectGrades, getSubjectDisplayName } from '@/lib/types'
import { renderPlayerForm } from '@/lib/gender-utils'

interface SubjectSelectionDialogProps {
  open: boolean
  onClose: () => void
  grades: SubjectGrades
  onSelectSubject: (subject: string) => void
  stanchezza: number
  playerGender?: NarrativePlayerGender
}

export function SubjectSelectionDialog({
  open,
  onClose,
  grades,
  onSelectSubject,
  stanchezza,
  playerGender = 'maschio'
}: SubjectSelectionDialogProps) {
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
      onSelectSubject(selectedSubject)
      setSelectedSubject(null)
    }
  }
  
  const getGradeIndicator = (grade: number) => {
    if (grade < 6) return { icon: <XCircle size={20} weight="fill" className="text-destructive" />, color: 'text-destructive', label: 'Insufficiente' }
    if (grade < 7) return { icon: <Warning size={20} weight="fill" className="text-accent" />, color: 'text-accent', label: 'Sufficiente' }
    return { icon: <CheckCircle size={20} weight="fill" className="text-primary" />, color: 'text-primary', label: 'Buono' }
  }
  
  const subjects = Object.entries(grades)
  const isTired = stanchezza > 80
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-y-auto border-2 border-primary"
        aria-modal="true"
        role="dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            <Brain size={32} weight="fill" />
            SCEGLI LA MATERIA DA STUDIARE
          </DialogTitle>
          <DialogDescription className="text-lg">
            Seleziona una materia e premi Conferma per studiare. Escape per annullare.
            {isTired && (
              <div className="mt-2 p-3 bg-destructive/20 border border-destructive rounded text-destructive font-bold">
                ⚠️ SEI TROPPO {renderPlayerForm(playerGender, 'STANCO', 'STANCA')}! Il bonus studio sarà DIMEZZATO!
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
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/20 scale-105' 
                    : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                  }
                  focus:outline-none focus:ring-4 focus:ring-primary/50
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
                  <div className="mt-2 text-xs text-primary font-bold">
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
            disabled={!selectedSubject}
            className="flex-1 bg-primary text-primary-foreground border-2 border-primary disabled:opacity-40"
          >
            <Brain size={24} className="mr-2" weight="fill" />
            Conferma Studio (Enter)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
