import React from 'react'
import { Cake, Calendar, Clock, GraduationCap, Trophy } from '@phosphor-icons/react'
import { GameTime, DayPhase, DayType } from '@/lib/types'
import { formatDate, getSchoolYearName, getDaysUntilReportCard, DAY_PHASE_CONFIG } from '@/lib/time-utils'
import { Card } from '@/components/ui/card'

interface TimeDisplayProps {
  gameTime: GameTime
  currentPhase?: DayPhase
  dayType?: DayType
  phaseActionsRemaining?: number
}

<<<<<<< HEAD
export const TimeDisplay = React.memo(function TimeDisplay({ gameTime, currentPhase, dayType }: TimeDisplayProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-3 py-2 border border-border rounded-sm bg-card text-sm">

      {/* Data */}
      <span className="flex items-center gap-1 text-muted-foreground">
        <Calendar size={14} weight="fill" className="text-accent" />
        <strong className="text-foreground">{formatDate(gameTime.currentDate)}</strong>
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

      {/* Countdown pagella */}
      {gameTime.schoolYear.isSchoolPeriod && (
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
=======
const DAY_TYPE_LABEL: Record<DayType, string> = {
  feriale: 'Giorno feriale',
  sabato: 'Sabato',
  domenica: 'Domenica'
}

export const TimeDisplay = React.memo(function TimeDisplay({ gameTime, currentPhase, dayType }: TimeDisplayProps) {
  const daysUntilReportCard = getDaysUntilReportCard(
    gameTime.currentDate,
    gameTime.schoolYear.reportCardDate
  )

  const progressPercentage = (gameTime.schoolYear.currentYear / 5) * 100

  return (
    <Card className="p-6 border-2 border-accent bg-card/50">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={32} weight="fill" className="text-accent" />
            <div>
              <div className="text-sm text-muted-foreground uppercase font-semibold">
                Data Attuale
              </div>
              <div className="text-2xl font-bold text-accent">
                {formatDate(gameTime.currentDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Cake size={32} weight="fill" className="text-secondary" />
            <div>
              <div className="text-sm text-muted-foreground uppercase font-semibold">
                Età
              </div>
              <div className="text-2xl font-bold text-secondary">
                {gameTime.age} anni
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GraduationCap size={32} weight="fill" className="text-primary" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground uppercase font-semibold">
                Anno Scolastico
              </div>
              <div className="text-2xl font-bold text-primary">
                {getSchoolYearName(gameTime.schoolYear.currentYear)}
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={16} weight="fill" className="text-accent" />
                  <span className="text-xs text-muted-foreground font-semibold">
                    Progresso verso la MATURITÀ
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-500 neon-glow"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Anno {gameTime.schoolYear.currentYear} di 5 ({Math.round(progressPercentage)}%)
                </div>
                {gameTime.schoolYear.currentYear === 5 && (
                  <div className="text-xs text-accent font-bold mt-1 animate-pulse">
                    🎯 ULTIMO ANNO! Supera la pagella e VINCI! 🎯
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Fascia oraria corrente */}
          {currentPhase && dayType && (
            <div className="flex items-center gap-3 mb-4">
              <Clock size={32} weight="fill" className="text-primary" />
              <div>
                <div className="text-sm text-muted-foreground uppercase font-semibold">
                  Fascia Oraria
                </div>
                <div className="text-2xl font-bold text-primary">
                  {DAY_PHASE_CONFIG[dayType][currentPhase].label}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {DAY_PHASE_CONFIG[dayType][currentPhase].timeRange}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {DAY_TYPE_LABEL[dayType]}
                </div>
              </div>
            </div>
          )}

          {gameTime.schoolYear.isSchoolPeriod && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                <div className="font-semibold mb-1">Periodo Scolastico:</div>
                <div>Pagella tra {daysUntilReportCard} giorni</div>
                <div className="text-xs mt-1">
                  ({formatDate(gameTime.schoolYear.reportCardDate)})
                </div>
              </div>
            </div>
          )}

          {!gameTime.schoolYear.isSchoolPeriod && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-accent font-bold">
                🌴 VACANZE ESTIVE! 🌴
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Goditi l'estate! La scuola riprende a settembre.
              </div>
            </div>
          )}

        </div>
      </div>
    </Card>
>>>>>>> d670b76fd8fc9b5e991d771be6031484587da336
  )
})
