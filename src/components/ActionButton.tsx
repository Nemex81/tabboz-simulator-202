import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  icon: ReactNode
  label: string
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'secondary'
  ariaLabel?: string
}

export function ActionButton({ 
  icon, 
  label, 
  shortcut, 
  onClick, 
  disabled = false, 
  variant = 'default',
  ariaLabel 
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 h-auto py-4 px-6",
        "border-2 transition-all duration-100",
        "hover:scale-105 hover:neon-glow",
        "focus:ring-4 focus:ring-primary/50 focus:outline-offset-4",
        variant === 'default' && "bg-primary text-primary-foreground border-primary",
        variant === 'secondary' && "bg-secondary text-secondary-foreground border-secondary",
        variant === 'destructive' && "bg-destructive text-destructive-foreground border-destructive"
      )}
      aria-label={ariaLabel || label}
    >
      <div className="text-3xl" aria-hidden="true">
        {icon}
      </div>
      <div className="text-sm font-bold uppercase tracking-wider">
        {label}
      </div>
      {shortcut && (
        <div className="absolute top-1 right-1 text-xs opacity-70 font-mono" aria-hidden="true">
          {shortcut}
        </div>
      )}
    </Button>
  )
}
