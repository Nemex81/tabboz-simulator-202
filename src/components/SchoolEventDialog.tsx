import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SchoolEvent } from '@/lib/school-events'

interface SchoolEventDialogProps {
  open: boolean
  event: SchoolEvent | null
  onChoice: (choiceIndex: number) => void
  onClose: () => void
}

export function SchoolEventDialog({ open, event, onChoice, onClose }: SchoolEventDialogProps) {
  if (!event) return null

  const getColorClass = () => {
    switch (event.type) {
      case 'parent':
        return 'border-destructive'
      case 'teacher':
        return 'border-secondary'
      case 'schoolSpecific':
        return 'border-accent'
      default:
        return 'border-primary'
    }
  }

  const getTitleColorClass = () => {
    switch (event.type) {
      case 'parent':
        return 'text-destructive'
      case 'teacher':
        return 'text-secondary'
      case 'schoolSpecific':
        return 'text-accent'
      default:
        return 'text-primary'
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className={`border-2 ${getColorClass()}`}>
        <AlertDialogHeader>
          <AlertDialogTitle className={`text-2xl ${getTitleColorClass()}`}>
            {event.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            {event.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {event.choices.length === 2 ? (
            <>
              <AlertDialogCancel onClick={() => onChoice(0)} className="border-2">
                {event.choices[0].label}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => onChoice(1)} className="border-2">
                {event.choices[1].label}
              </AlertDialogAction>
            </>
          ) : (
            event.choices.map((choice, index) => (
              <AlertDialogAction
                key={index}
                onClick={() => onChoice(index)}
                className="border-2"
              >
                {choice.label}
              </AlertDialogAction>
            ))
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
