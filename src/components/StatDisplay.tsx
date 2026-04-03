import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface StatDisplayProps {
  icon: ReactNode
  label: string
  value: number
  max?: number
  color?: string
  ariaLabel?: string
}

export function StatDisplay({ icon, label, value, max = 100, color, ariaLabel }: StatDisplayProps) {
  const percentage = (value / max) * 100
  
  return (
    <Card className="p-4 border-2 border-primary bg-card neon-glow">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-primary" aria-hidden="true">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          <div 
            className="text-2xl font-bold text-primary neon-text-glow" 
            aria-label={ariaLabel || `${label}: ${value}`}
          >
            {value.toFixed(label === 'Media' ? 1 : 0)}
          </div>
        </div>
      </div>
      <Progress 
        value={percentage} 
        className="h-2" 
        aria-label={`${label} progress: ${percentage.toFixed(0)}%`}
      />
    </Card>
  )
}
