import { useState, useEffect, useRef } from 'react'
import { HandCoins, Fist, CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
  Dialog
  Dialog,
} from '@/compon
import { Card } from

  open: boolea
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SubjectGrades, getSubjectDisplayName } from '@/lib/types'

interface TeacherSelectionDialogProps {
  open: boolean
  onClose: () => void
  
    if (open && firstButtonRef.current) {
    }
  
 

    }
    con
        ha
    }
    window.addEven
    
      w
    }
  
    if (selectedSubject) {
  
  }
  const getGradeIndicator = (grade: numbe
    if (grade < 7) return { icon: <W
  }
  const subj
  
    <Dialog open={o
        className={`max-w-4xl max-h-[80vh] overf
        role="dialog"
        <DialogHe
       
     
    
              <>
                SCEGLI QUALE PROFESSORE MINACCIARE
            )}
       
     
    
                    ⚠️ NON HAI ABBASTANZA SOLDI! Ser
                )}
    
                <p
                  ⚠️ ATTENZIONE: 30% di probabilità di ES
              </div>
     
        
  
            const isSelected = 
            
              <button
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


























































































