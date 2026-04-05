import React, { ReactElement, ReactNode } from 'react'

interface StatDisplayProps {
  icon: ReactNode
  label: string
  value: number
  max?: number
}

export const StatDisplay = React.memo(function StatDisplay({ icon, label, value, max = 100 }: StatDisplayProps) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0
  const percentage = Math.min((safeValue / max) * 100, 100)

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 border-b border-border last:border-0">
      <span className="text-primary flex-shrink-0 w-5 h-5 flex items-center justify-center" aria-hidden="true">
        {React.cloneElement(icon as ReactElement<{ size?: number }>, { size: 16 })}
      </span>
      <span className="text-xs text-muted-foreground font-semibold flex-1 min-w-0 truncate">
        {label}
      </span>
      <span
        className="text-sm font-bold text-foreground w-12 text-right flex-shrink-0"
        aria-live="polite"
        aria-atomic="true"
      >
        {typeof value === 'number' && !Number.isInteger(value)
          ? value.toFixed(1)
          : safeValue}
        <span className="text-xs text-muted-foreground font-normal">/{max}</span>
      </span>
      <div
        className="w-20 flex-shrink-0 h-1.5 bg-muted rounded-sm overflow-hidden"
        aria-hidden="true"
      >
        <div
          role="progressbar"
          aria-valuenow={safeValue}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${safeValue} su ${max}`}
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
})
