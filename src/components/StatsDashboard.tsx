import React, { useMemo } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { TrendUp, ChartBar } from '@phosphor-icons/react'
import { GameStats, SubjectGrades } from '@/lib/types'
import { calculateMedia } from '@/lib/game-utils'

interface StatsDashboardProps {
  stats: GameStats
  grades: SubjectGrades
}

const RADAR_MAX = 100

export const StatsDashboard = React.memo(function StatsDashboard({
  stats,
  grades,
}: StatsDashboardProps) {
  const radarData = useMemo(
    () => [
      { stat: 'Coattaggine', value: stats.coattaggine },
      { stat: 'Muscoli', value: stats.muscoli },
      { stat: 'Figosità', value: stats.figosita },
      { stat: 'Intelligenza', value: stats.intelligenza },
      { stat: 'Reputazione', value: stats.reputazione },
    ],
    [
      stats.coattaggine,
      stats.muscoli,
      stats.figosita,
      stats.intelligenza,
      stats.reputazione,
    ]
  )

  const gradeData = useMemo(
    () =>
      Object.entries(grades).map(([subject, grade]) => ({
        materia: subject.charAt(0).toUpperCase() + subject.slice(0, 4),
        voto: Number(grade.toFixed(1)),
      })),
    [grades]
  )

  const media = useMemo(() => calculateMedia(grades), [grades])

  const radarSummary = useMemo(
    () =>
      `Statistiche personaggio: Coattaggine ${stats.coattaggine}, Muscoli ${stats.muscoli}, Figosità ${stats.figosita}, Intelligenza ${stats.intelligenza}, Reputazione ${stats.reputazione} (scala 0-${RADAR_MAX}).`,
    [stats.coattaggine, stats.muscoli, stats.figosita, stats.intelligenza, stats.reputazione]
  )

  const gradeSummary = useMemo(() => {
    const entries = Object.entries(grades)
      .map(([subject, grade]) => `${subject} ${Number(grade).toFixed(1)}`)
      .join(', ')
    return `Voti per materia, media generale ${media.toFixed(2)} su 10. Dettaglio: ${entries}.`
  }, [grades, media])

  return (
    <div className="space-y-6">
      {/* Radar delle statistiche */}
      <Card className="p-6 border-2 border-primary bg-card/50">
        <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
          <ChartBar size={24} weight="fill" />
          PROFILO STATISTICHE
        </h3>
        <div className="h-64" role="img" aria-label={radarSummary}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <Radar
                name="Stats"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.35}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">{radarSummary}</p>
      </Card>

      {/* Bar chart dei voti */}
      <Card className="p-6 border-2 border-accent bg-card/50">
        <h3 className="text-xl font-bold mb-1 text-accent flex items-center gap-2">
          <TrendUp size={24} weight="fill" />
          VOTI PER MATERIA
        </h3>
        <div className="text-sm text-muted-foreground mb-4">
          Media generale: <span className="font-bold text-accent">{media.toFixed(2)}</span>
        </div>
        <div className="h-48" role="img" aria-label={gradeSummary}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="materia"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar
                dataKey="voto"
                fill="hsl(var(--accent))"
                radius={[3, 3, 0, 0]}
              />
              {/* Linea soglia sufficienza */}
              <Line
                type="monotone"
                dataKey={() => 6}
                stroke="hsl(var(--destructive))"
                strokeDasharray="4 4"
                dot={false}
                strokeWidth={1.5}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">{gradeSummary}</p>
      </Card>

      {/* Riepilogo testuale */}
      <Card className="p-4 border border-border bg-card/30">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-muted-foreground">Stanchezza</div>
            <div
              className={`text-2xl font-bold ${
                stats.stanchezza > 80
                  ? 'text-destructive'
                  : stats.stanchezza > 50
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`}
            >
              {stats.stanchezza}%
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Soldi</div>
            <div className="text-2xl font-bold text-green-500">{stats.soldi}€</div>
          </div>
          <div>
            <div className="text-muted-foreground">Media</div>
            <div
              className={`text-2xl font-bold ${
                media >= 7 ? 'text-green-500' : media >= 6 ? 'text-yellow-500' : 'text-destructive'
              }`}
            >
              {media.toFixed(1)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
})
