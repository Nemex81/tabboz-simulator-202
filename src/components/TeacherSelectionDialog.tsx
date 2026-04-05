import { useState, useEffect, useRef } from 'react'
import {
  Dialog
  DialogH
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
            return (
                key={subject}
                onClick={() =>
     
   
  
                  ${!canAfford && actionType ===
                  disabled:hover:scale-100 disabled:hover:border-border
                aria-label={`${getSubjectDisplayName(subject)}, voto attuale ${grade.toFixed(1)}, ${indicator.label}`}
              >
   
  
                </div>
                  {grade.toFixed(1)}
  
          
                    }`}
                  />
                {isSelected && (
                    ✓ SEL
                )}
       
        </div>
        <div className="flex gap-3 mt-6">
            onClick={onClose}
            clas
            Annulla (Esc)
          <Button
            disab
              act
                
          >
              <>
                C
            )}
                <Fist si
              </>
          </Button>
      </DialogCo
  )














          </DialogDescription>























































































