import React from 'react'
import { Calendar, ChatsCircle } from '@phosphor-icons/react'
import { GameTime, DayPhase, DayType } from '@/lib/types'
import { formatDate, getDayOfWeekLabel, getSchoolYearName, getDaysUntilReportCard, DAY_PHASE_CONFIG } from '@/lib/time-utils'

interface TimeDisplayProps {
  gameTime: GameTime
  currentPhase?: DayPhase
  dayType?: DayType
  phaseActionsRemaining?: number
  interazioniRimaste?: number
}

export const TimeDisplay = React.memo(function TimeDisplay({ gameTime, currentPhase, dayType, interazioniRimaste }: TimeDisplayProps) {
  return (
    <div role="region" aria-label="Stato giornata corrente" className="flex flex-wrap items-center gap-4 px-3 py-2 border border-border rounded-sm bg-card text-sm">

      {/* Data */}
      <span className="flex items-center gap-1 text-muted-foreground">
        <Calendar size={14} weight="fill" className="text-accent" />
        <strong className="text-foreground">{`${getDayOfWeekLabel(gameTime.currentDate)} — ${formatDate(gameTime.currentDate)}`}</strong>
      </span>

      <span className="text-border">|</span>

      {/* Età */}
      <span className="text-muted-foreground">
        Età: <strong className="text-foreground">{gameTime.age}</strong>
      </span>

      <span className="text-border">|</span>

      {/* Anno scolastico */}
      <span className="text-muted-foreground">
        Anno: <strong className="text-primary">{getSchoolYearName(gameTime.schoolYear.currentYear)}</strong>
      </span>

      {/* Fascia oraria */}
      {currentPhase && dayType && (
        <>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">
            Fase: <strong className="text-secondary">
              {DAY_PHASE_CONFIG[dayType][currentPhase].label}
            </strong>
            <span className="ml-1 text-xs text-muted-foreground">
              {DAY_PHASE_CONFIG[dayType][currentPhase].timeRange}
            </span>
          </span>
        </>
      )}

      {typeof interazioniRimaste === 'number' && (
        <>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <ChatsCircle size={14} weight="fill" className="text-primary" />
            Interazioni: <strong className="text-primary">{interazioniRimaste}</strong>
          </span>
        </>
      )}

      {/* Countdown pagella */}
      {gameTime.schoolYear.isSchoolPeriod && gameTime.schoolYear.reportCardDate && (
        <>
          <span className="text-border">|</span>
          <span className="text-xs text-muted-foreground">
            Pagella tra{' '}
            <strong className="text-accent">
              {getDaysUntilReportCard(gameTime.currentDate, gameTime.schoolYear.reportCardDate)} gg
            </strong>
          </span>
        </>
      )}

      {!gameTime.schoolYear.isSchoolPeriod && (
        <>
          <span className="text-border">|</span>
          <span className="text-xs text-accent font-bold">🌴 VACANZE ESTIVE</span>
        </>
      )}
    </div>
  )
})
