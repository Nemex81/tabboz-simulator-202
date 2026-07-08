import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Sparkle, 
  HourglassMedium, 
  User, 
  Calendar, 
  CurrencyEur, 
  Clock, 
  Motorcycle, 
  Notebook,
  GraduationCap
} from '@phosphor-icons/react'
import type { GameStats, Relationship, Friend, GameLogEntry } from '@/lib/types'
import { clampStat } from '@/lib/game-utils'

interface DashboardTabProps {
  stats: GameStats
  currentDate: { day: number; month: number; year: number }
  currentPhase: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
  activePartners: Array<{ id: string; relationshipSourceKey: string }>
  relationships: Relationship[]
  friends: Friend[]
  gameLog: GameLogEntry[]
  playerProfile: { name: string; gender: 'maschio' | 'femmina'; orientamentoSessuale: string }
  currentLocationName: string
  morningChoicePending?: boolean
  onGoToSchool?: () => void
  onMarinaSchool?: () => void
}

export function DashboardTab({
  stats,
  currentDate,
  currentPhase,
  activePartners,
  relationships,
  friends,
  gameLog,
  playerProfile,
  currentLocationName,
  morningChoicePending = false,
  onGoToSchool,
  onMarinaSchool,
}: DashboardTabProps) {
  const activePartnerKeys = activePartners.map(p => p.relationshipSourceKey)
  const activePartnerships = relationships.filter(r => r.isActive && activePartnerKeys.includes(r.sourceKey || ''))

  const recentLogs = gameLog.slice(-5).reverse()

  const phaseNames = {
    mattina: 'Mattina',
    pomeriggio: 'Pomeriggio',
    sera: 'Sera',
    notte: 'Notte',
  }

  // A11y: Riepilogo dello stato nascosto leggibile solo dallo screen reader all'apertura del tab
  const a11ySummaryText = `Sommario rapido. Fondi attuali: ${stats.soldi} euro. Stanchezza: ${stats.stanchezza} percento. Salute: ${stats.salute} percento. Ti trovi in: ${currentLocationName}.`

  return (
    <div className="space-y-6">
      {/* Intestazione accessibile per screen reader */}
      <h2 className="sr-only" id="dashboard-heading">
        {a11ySummaryText}
      </h2>

      {/* Card di scelta scolastica del mattino */}
      {morningChoicePending && (
        <Card className="p-5 border-2 border-destructive bg-destructive/10 text-center animate-pulse">
          <h3 className="text-xl font-bold text-destructive flex items-center justify-center gap-2 mb-2">
            <GraduationCap size={24} weight="fill" />
            SCELTA MATTUTINA: SCUOLA
          </h3>
          <p className="text-sm text-foreground mb-4">
            È mattina feriale! Devi decidere se andare a lezione o marinare la scuola oggi.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="default"
              onClick={onGoToSchool}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold"
            >
              🏫 Vai a Scuola
            </Button>
            <Button
              variant="destructive"
              onClick={onMarinaSchool}
              className="font-bold"
            >
              🚶 Marina la Scuola
            </Button>
          </div>
        </Card>
      )}

      {/* Profilo & Data Header Card */}
      <Card className="p-6 border-2 border-primary bg-card/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
              <User size={40} className="text-primary" weight="fill" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {playerProfile.name}
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                  {playerProfile.gender === 'maschio' ? 'Maschio' : 'Femmina'}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Clock size={16} className="text-primary/70" />
                <span>Posizione: <strong>{currentLocationName}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-border">
            <div className="text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold mb-1 flex items-center justify-center gap-1">
                <Calendar size={14} className="text-accent" /> GIORNO
              </span>
              <span className="text-xl font-bold text-accent">
                {currentDate.day}/{currentDate.month}/{currentDate.year}
              </span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold mb-1 flex items-center justify-center gap-1">
                <HourglassMedium size={14} className="text-secondary" /> FASE CORRENTE
              </span>
              <span className="text-xl font-bold text-secondary uppercase tracking-tight">
                {phaseNames[currentPhase]}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistiche Vitali (Soldi, Salute, Stanchezza) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Grana */}
        <Card className="p-5 border border-primary bg-card/40 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Soldi in Tasca</span>
            <h4 className="text-3xl font-black text-primary mt-1">{stats.soldi}€</h4>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <CurrencyEur size={32} weight="fill" />
          </div>
        </Card>

        {/* Stanchezza */}
        <Card className="p-5 border border-secondary bg-card/40">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Stanchezza</span>
              <h4 className="text-xl font-bold text-secondary mt-0.5">{stats.stanchezza}%</h4>
            </div>
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <HourglassMedium size={24} weight="fill" />
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${clampStat(stats.stanchezza)}%` }}
            />
          </div>
        </Card>

        {/* Salute */}
        <Card className="p-5 border border-accent bg-card/40">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Salute</span>
              <h4 className="text-xl font-bold text-accent mt-0.5">{stats.salute}%</h4>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Heart size={24} weight="fill" />
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${clampStat(stats.salute)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Relazioni & Motorino Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 border border-border bg-card/40">
          <h3 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
            <Heart size={20} weight="fill" className="text-accent" />
            VITA SOCIALE
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground">Fidanzata / Partner attiva:</span>
              {activePartnerships.length > 0 ? (
                activePartnerships.map(p => (
                  <div key={p.id} className="mt-1 flex items-center gap-2 p-2 bg-accent/5 rounded border border-accent/20">
                    <span className="text-accent font-bold text-sm">❤ {p.name}</span>
                    <span className="text-xs text-muted-foreground">(Livello: {p.relationshipLevel})</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic mt-1">Nessuna ragazza al momento, sei uno scapolo sfigato!</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div className="text-center p-2 bg-muted/20 rounded">
                <span className="text-xs text-muted-foreground block">Amici in Rubrica</span>
                <span className="text-lg font-bold text-foreground">{friends.length}</span>
              </div>
              <div className="text-center p-2 bg-muted/20 rounded">
                <span className="text-xs text-muted-foreground block">Interessi totali</span>
                <span className="text-lg font-bold text-foreground">{relationships.length}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Ciclomotore */}
        <Card className="p-5 border border-border bg-card/40">
          <h3 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
            <Motorcycle size={20} weight="fill" className="text-primary" />
            GARAGE MOTORINO
          </h3>
          {stats.hasMotorino ? (
            <div className="space-y-2">
              <div className="p-2 bg-primary/5 rounded border border-primary/20 flex justify-between items-center">
                <div>
                  <span className="text-xs text-muted-foreground block">Modello attuale</span>
                  <span className="font-bold text-primary uppercase text-sm">{stats.motorinoModello ?? 'Ciao'}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Tuning livello</span>
                  <span className="font-mono text-sm font-bold">{stats.motorinoTuning ?? 0}%</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Pezzi montati:</strong> {(stats.motorinoPezzi ?? []).length > 0 ? (stats.motorinoPezzi ?? []).join(', ') : 'Nessuno, il mezzo è originale.'}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic p-4 bg-muted/10 rounded border border-dashed border-border text-center">
              A piedi! Vai dal concessionario o sblocca un catorcio per poterti muovere con stile.
            </div>
          )}
        </Card>
      </div>

      {/* Eventi recenti */}
      <Card className="p-5 border border-border bg-card/40">
        <h3 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
          <Notebook size={20} weight="fill" className="text-secondary" />
          DIARIO DEGLI EVENTI RECENTI
        </h3>
        <div className="space-y-2">
          {recentLogs.length > 0 ? (
            recentLogs.map(log => {
              const categoryColors = {
                positive: 'border-l-4 border-l-success bg-success/5',
                negative: 'border-l-4 border-l-destructive bg-destructive/5',
                neutral: 'border-l-4 border-l-primary bg-primary/5',
                event_positive: 'border-l-4 border-l-success bg-success/5',
                event_negative: 'border-l-4 border-l-destructive bg-destructive/5',
                event_neutral: 'border-l-4 border-l-primary bg-primary/5',
                action_success: 'border-l-4 border-l-success bg-success/5',
                action_failure: 'border-l-4 border-l-destructive bg-destructive/5',
                action_neutral: 'border-l-4 border-l-primary bg-primary/5',
              }
              const color = categoryColors[log.result as 'positive'] || 'bg-muted/10'
              return (
                <div 
                  key={log.id} 
                  className={`p-3 rounded border border-border/60 ${color} text-sm`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-foreground">{log.title}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Giorno {log.date.day} • {phaseNames[log.phase as 'mattina'] || log.phase}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{log.description}</p>
                </div>
              )
            })
          ) : (
            <div className="text-sm text-muted-foreground italic text-center py-4">Nessun evento registrato nel diario.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
