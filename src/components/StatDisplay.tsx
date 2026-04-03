import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'

interface StatDisplayProps {
  icon: ReactNode
  label: string
  value: number
  max?: number
  color?: string
  ariaLabel?: string
}

export const StatDisplay = React.memo(function StatDisplay({ icon, label, value, max = 100, color, ariaLabel }: StatDisplayProps) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0
  const percentage = (safeValue / max) * 100
  const prevValueRef = useRef(safeValue)
  const [change, setChange] = useState<number>(0)
  const [showChange, setShowChange] = useState(false)
  
  useEffect(() => {
    const diff = safeValue - prevValueRef.current
    
    if (Math.abs(diff) >= 5) {
      setChange(diff)
      setShowChange(true)
      prevValueRef.current = safeValue
      
      const timer = setTimeout(() => {
        setShowChange(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    } else {
      prevValueRef.current = safeValue
    }
  }, [safeValue])
  
  const isPositiveChange = change > 0
  const isNegativeChange = change < 0
  
  return (
    <motion.div
      animate={Math.abs(change) >= 10 ? {
        scale: [1, 1.05, 1],
        rotate: [0, isPositiveChange ? 2 : -2, 0]
      } : {}}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 border-2 border-primary bg-card neon-glow relative overflow-hidden">
        <AnimatePresence>
          {showChange && Math.abs(change) >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.5 }}
              transition={{ duration: 1.5 }}
              className={`absolute top-2 right-2 text-2xl font-black z-10 ${
                isPositiveChange ? 'text-accent' : 'text-destructive'
              }`}
              style={{
                textShadow: isPositiveChange 
                  ? '0 0 10px rgba(200, 255, 150, 0.8)' 
                  : '0 0 10px rgba(255, 100, 100, 0.8)'
              }}
            >
              {isPositiveChange ? '+' : ''}{change.toFixed(0)}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-3 mb-2">
          <motion.div 
            className="text-primary" 
            aria-hidden="true"
            animate={Math.abs(change) >= 15 ? {
              scale: [1, 1.3, 1],
              rotate: [0, 360, 360]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {label}
            </div>
            <motion.div 
              className="text-2xl font-bold text-primary neon-text-glow" 
              aria-label={ariaLabel || `${label}: ${safeValue}`}
              animate={Math.abs(change) >= 10 ? {
                scale: [1, 1.2, 1],
                textShadow: [
                  '0 0 10px rgba(100, 255, 100, 0.8)',
                  '0 0 25px rgba(100, 255, 100, 1)',
                  '0 0 10px rgba(100, 255, 100, 0.8)'
                ]
              } : {}}
              transition={{ duration: 0.4 }}
            >
              {safeValue.toFixed(label === 'Media' ? 1 : 0)}
            </motion.div>
          </div>
        </div>
        <Progress 
          value={percentage} 
          className="h-2" 
          aria-label={`${label} progress: ${percentage.toFixed(0)}%`}
        />
      </Card>
    </motion.div>
  )
})
