import React, { ReactNode, useId, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useA11y } from '@/components/A11yLiveRegion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { announce } from '@/lib/a11y-announce'

interface ActionButtonProps {
  icon: ReactNode
  label: string
  buttonId?: string
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'secondary' | 'outline'
  ariaLabel?: string
  blockedReason?: string
  helpText?: string
}

export const ActionButton = React.memo(function ActionButton({ 
  icon, 
  label, 
  buttonId,
  shortcut, 
  onClick, 
  disabled = false, 
  variant = 'default',
  ariaLabel,
  blockedReason,
  helpText,
}: ActionButtonProps) {
  const id = useId()
  const { announce } = useA11y()

  const handleClick = () => {
    if (helpText && announce) announce(helpText)
    onClick()
  }
  const buttonContent = (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        id={buttonId}
        onClick={handleClick}
        disabled={disabled}
        variant={variant}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 h-auto py-4 px-6",
          "border-2 transition-all duration-100",
          "hover:neon-glow",
          "focus:ring-4 focus:ring-primary/50 focus:outline-offset-4",
          variant === 'default' && "bg-primary text-primary-foreground border-primary",
          variant === 'secondary' && "bg-secondary text-secondary-foreground border-secondary",
          variant === 'destructive' && "bg-destructive text-destructive-foreground border-destructive"
        )}
        aria-label={ariaLabel || label}
        aria-keyshortcuts={shortcut ? shortcut.replace(/\bCtrl\b/g, 'Control') : undefined}
        aria-describedby={
          [
            disabled && blockedReason ? `${id}-blocked` : null,
            helpText ? `${id}-help` : null,
          ].filter(Boolean).join(' ') || undefined
        }
      >
        <motion.div 
          className="text-3xl" 
          aria-hidden="true"
          whileTap={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <div className="text-sm font-bold uppercase tracking-wider">
          {label}
        </div>
        {shortcut && (
          <>
            <div className="absolute top-1 right-1 text-xs opacity-70 font-mono" aria-hidden="true">
              {shortcut}
            </div>
            <span className="sr-only">Scorciatoia: {shortcut}</span>
          </>
        )}
        {disabled && blockedReason && (
          <span id={`${id}-blocked`} className="sr-only">
            {blockedReason}
          </span>
        )}
        {helpText && (
          <span id={`${id}-help`} className="sr-only">
            {helpText}
          </span>
        )}
      </Button>
    </motion.div>
  )

  if (disabled && blockedReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-not-allowed">{buttonContent}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-center">
            {blockedReason}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return buttonContent
})
