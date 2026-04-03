import React from 'react'
import { Calendar, Clock, GraduationCap, Cake, Trophy, Sun, Moon } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { GameTime, DayPhase, DayType } from '@/lib/types'
import { formatDate, getSchoolYearName, getDaysUntilReportCard, DAY_PHASE_CONFIG } from '@/lib/time-utils'

interface TimeDisplayProps {
  gameTime: GameTime
  currentPhase?: DayPhase
  dayType?: DayType
  phaseActionsRemaining?: number
}

const PHASE_ICONS: Record<DayPhase, string> = {
  mattina: '🌅',
  pomeriggio: '☀️',
  sera: '🌆',
  notte: '🌙',
}

const DAY_TYPE_LABEL: Record<DayType, string> = {
  feriale: 'Giorno Scolastico',
  sabato: 'Sabato',
  domenica: 'Domenica',
  festivo: 'Festivo',
}

export const TimeDisplay = React.memo(function TimeDisplay({ gameTime, currentPhase, dayType, phaseActionsRemaining }: TimeDisplayProps) {
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
          <div className="flex items-center gap-3 mb-4">
            <Clock size={32} weight="fill" className="text-primary" />
            <div>
              <div className="text-sm text-muted-foreground uppercase font-semibold">
                Azioni Rimanenti
              </div>
              <div className="text-4xl font-black text-primary neon-text-glow">
                {gameTime.actionsRemaining} / {gameTime.maxActionsPerDay}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              {Array.from({ length: gameTime.maxActionsPerDay }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                    i < gameTime.actionsRemaining
                      ? 'bg-primary neon-glow'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            {gameTime.actionsRemaining === 0 && (
              <div className="text-xs text-destructive font-bold animate-pulse">
                Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!
              </div>
            )}
          </div>

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

          {/* Fascia oraria */}
          {currentPhase && dayType && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{PHASE_ICONS[currentPhase]}</span>
                <span className="text-sm font-bold text-accent uppercase">
                  {DAY_PHASE_CONFIG[dayType][currentPhase].label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {DAY_PHASE_CONFIG[dayType][currentPhase].timeRange}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {DAY_TYPE_LABEL[dayType]} — Azioni fascia: {phaseActionsRemaining ?? DAY_PHASE_CONFIG[dayType][currentPhase].maxActions}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
})
