import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
import { SubjectGrades, getSubjectDisplayName } from '@/lib/types'
  onClose: () => void

  soldi: number

  onClose: () => void
  grades: SubjectGrades
  onSelectTeacher: (subject: string) => void
  actionType: 'corrompi' | 'minaccia'
  soldi: number
}

export function TeacherSelectionDialog({
    onS
  onClose,

  onSelectTeacher,
  const canCo
  soldi
    <Dialog open={open} onOpenCha
  const handleSelect = (subject: string) => {
    onSelectTeacher(subject)
    onClose()
  }

  const subjects = Object.keys(grades)

                Scegli quale profe


          {subjects.map((subject) => {
            const disabled = actionType === 'corrompi' && !canCorrompi
            return (
                key={subject}
                  disabled 
                
                onClick={() => !disabled && handleSel
                <div className="flex items-center 
                 
                 
                
                    className={`h-full ${current
                  />
                <
              
                  disabl
                    e.stopPro
                  }}
                  {actionType === 'corrompi' ? (
                      <HandCoins size={20} className="mr-2" />
             
                    <>
                      M

              </Card>
          })}

          <Button onClick={onClose} variant="outline" className="w-full">
          </Butt
      </DialogCo
  )

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
