import React from 'react'
import { Heart, Warning, Siren, FirstAid } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HealthRecord, GameLogEntry, HEALTH_CONDITIONS, HealthConditionSeverity } from '@/lib/types'

interface HealthRecordPanelProps {
  healthRecord: HealthRecord
  gameLog: GameLogEntry[]
}

const SEVERITY_LABEL: Record<HealthConditionSeverity, string> = {
  lieve: 'Lieve',
  moderata: 'Moderata',
  grave: 'Grave',
}

const SEVERITY_COLOR: Record<HealthConditionSeverity, string> = {
  lieve: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40',
  moderata: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/40',
  grave: 'bg-destructive/20 text-destructive border-destructive/40',
}

export function HealthRecordPanel({ healthRecord, gameLog }: HealthRecordPanelProps) {
  const healthLogs = gameLog.filter((e) => e.type === 'health')
  const activeConditions = healthRecord.conditions

  return (
    <section aria-labelledby="hrp-title" className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Heart size={22} weight="fill" className="text-primary" aria-hidden="true" />
        <h3 id="hrp-title" className="text-xl font-bold text-primary">
          Registro della Salute
        </h3>
      </div>

      {/* Condizioni attive */}
      <Card className="p-4 border-2 border-primary/30 bg-card">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
          <FirstAid size={16} aria-hidden="true" />
          Condizioni attive
        </h4>
        {activeConditions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic" role="status">
            Nessuna condizione di salute attiva. Stai bene!
          </p>
        ) : (
          <ul role="list" className="space-y-3">
            {activeConditions.map((cond) => {
              const template = HEALTH_CONDITIONS[cond.id]
              if (!template) return null
              return (
                <li
                  key={cond.id}
                  role="listitem"
                  className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50 border border-border"
                  aria-label={`${template.label}, gravità ${SEVERITY_LABEL[template.severity]}, giorno ${cond.daysElapsed + 1} di ${template.durationDays}`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{template.label}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs border ${SEVERITY_COLOR[template.severity]}`}
                    >
                      {SEVERITY_LABEL[template.severity]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="sr-only">Progresso:</span>
                    <div
                      className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={cond.daysElapsed + 1}
                      aria-valuemin={0}
                      aria-valuemax={template.durationDays ?? cond.daysElapsed + 1}
                      aria-label={`${template.label}: giorno ${cond.daysElapsed + 1} di ${template.durationDays ?? 'durata indefinita'}`}
                    >
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${template.durationDays != null ? Math.min(100, ((cond.daysElapsed + 1) / template.durationDays) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {cond.daysElapsed + 1}/{template.durationDays ?? '∞'}gg
                    </span>
                  </div>
                  {template.forcesAbsence && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                      <Warning size={12} aria-hidden="true" />
                      <span>Impedisce la frequenza scolastica</span>
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* Log eventi salute */}
      <Card className="p-4 border-2 border-muted bg-card">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
          <Siren size={16} aria-hidden="true" />
          Storico eventi salute
        </h4>
        {healthLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic" role="status">
            Nessun evento sanitario registrato.
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {[...healthLogs].reverse().slice(0, 20).map((entry) => (
              <li
                key={entry.id}
                role="listitem"
                className="flex flex-col gap-0.5 text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-medium ${entry.result === 'positive' ? 'text-green-600 dark:text-green-400' : entry.result === 'negative' ? 'text-destructive' : 'text-foreground'}`}
                  >
                    {entry.title}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {entry.date ? `${entry.date.day}/${entry.date.month}` : ''}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{entry.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
