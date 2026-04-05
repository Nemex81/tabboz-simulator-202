import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/but
import { SubjectGrades, getSubjectDisplayName }
interface TeacherSelectionDialogProps {
  onClose: () => void

  soldi: number

  open,
  grades,
  actionType,
}: TeacherSelectionDialogProps) {

 

  const subjects = Object.keys(grades)
  retur
      <Dia
         
          </Dialog
            {
       
        </DialogHeader>
        <div className="grid grid-

            
              <Card
             
   

              >

          
                </div>
                  <div
                    st
                </div>
                  variant={actionType === 'corrompi' ? 'default' : 'destructive'}
                  classN
                  onClick={(e
                    if (!disabled) hand
                >
                    <>
                      Corrompi
                  ) : (

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
