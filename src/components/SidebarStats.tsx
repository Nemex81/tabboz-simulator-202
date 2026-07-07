import React from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Star, User, Motorcycle } from '@phosphor-icons/react'
import type { GameStats } from '@/lib/types'
import { getCharacterGenderLabel } from '@/lib/gender-utils'
import { VEHICLES } from '@/lib/motorino-catalog'

interface SidebarStatsProps {
  playerProfile: import('@/lib/types').PlayerProfile | null
  stats: GameStats
  schoolYear: number
  age: number
  currentMedia: number
}

export const SidebarStats = React.memo(function SidebarStats({
  playerProfile,
  stats,
  schoolYear,
  age,
  currentMedia,
}: SidebarStatsProps) {
  return (
    <div className="space-y-6">
      {/* Profilo */}
      <Card className="p-4 border-2 border-accent bg-card">
        <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <User size={18} weight="fill" />
          PROFILO TAMARRO
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome:</span>
            <span className="font-bold text-foreground">{playerProfile?.name ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Genere:</span>
            <span className="font-bold text-foreground">
              {playerProfile ? getCharacterGenderLabel(playerProfile.gender) : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Età:</span>
            <span className="font-bold text-foreground">{age} anni</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Scuola:</span>
            <span className="font-bold text-foreground">{schoolYear}° Superiore</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Media Voti:</span>
            <span className={`font-bold ${currentMedia < 6 ? 'text-destructive' : 'text-secondary'}`}>
              {currentMedia.toFixed(1)} / 10
            </span>
          </div>
        </div>
      </Card>

      {/* Veicolo Posseduto */}
      {stats.hasMotorino && (
        <Card className="p-4 border-2 border-secondary bg-card">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Motorcycle size={18} weight="fill" />
            IL TUO MEZZO
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modello:</span>
              <span className="font-bold text-foreground">
                {VEHICLES[stats.motorinoModello ?? 'ciao']?.name ?? 'Piaggio Ciao'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tuning:</span>
              <span className="font-bold text-secondary">{stats.motorinoTuning ?? 0}%</span>
            </div>
            <div className="text-[10px] text-muted-foreground pt-1 border-t border-border mt-1 flex justify-between">
              <span className="font-semibold">Modifiche installate:</span>
              <span className="font-bold">
                {stats.motorinoPezzi && stats.motorinoPezzi.length > 0
                  ? stats.motorinoPezzi.length
                  : 'Nessuna'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Statistiche */}
      <Card className="p-4 border-2 border-primary bg-card">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Star size={18} weight="fill" />
          STATISTICHE
        </h3>
        <ul className="space-y-3.5">
          {([
            ['Intelligenza', stats.intelligenza, 'bg-secondary', 'text-secondary'],
            ['Figosità', stats.figosita, 'bg-accent', 'text-accent'],
            ['Coattaggine', stats.coattaggine, 'bg-primary', 'text-primary'],
            ['Muscoli', stats.muscoli, 'bg-secondary', 'text-secondary'],
            ['Carisma', stats.carisma, 'bg-accent', 'text-accent'],
            ['Stanchezza', stats.stanchezza, 'bg-destructive', 'text-destructive'],
            ['Stress', stats.stress ?? 0, 'bg-destructive', 'text-destructive'],
            ['Morale', stats.morale ?? 60, 'bg-accent', 'text-accent'],
            ['Salute', stats.salute ?? 100, 'bg-primary', 'text-primary'],
            ['Reputazione', stats.reputazione, 'bg-primary', 'text-primary'],
            ['Soldi', stats.soldi, 'bg-secondary', 'text-secondary'],
          ] as [string, number, string, string][]).map(([label, value, bgClass, textClass]) => (
            <li key={label} className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-bold ${textClass}`}>
                  {label === 'Soldi' ? `${value}€` : `${value}/100`}
                </span>
              </div>
              <Progress 
                value={Math.min(100, (value / (label === 'Soldi' ? 1000 : 100)) * 100)} 
                className="h-1.5 rounded-full overflow-hidden bg-muted"
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={label === 'Soldi' ? 1000 : 100}
                aria-label={`${label}: ${value}`}
              />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
})
