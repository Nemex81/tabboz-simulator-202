import { memo } from 'react'
import { Motorcycle, Wrench, Coins, Flame, Shield, X, Check } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { GameStats } from '@/lib/types'
import { playSound } from '@/lib/sound-effects'
import { clampStat } from '@/lib/game-utils'

export interface MotorinoGarageDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  playerStats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  consumeAction: () => void
  announce: (msg: string, priority?: 'polite' | 'assertive') => void
  addLogEntry: any
  currentPhase: any
  gameTime: any
}

interface TuningPart {
  id: string
  name: string
  description: string
  cost: number
  tuningValue: number
  coattaggineBonus: number
  figositaBonus: number
  benefitText: string
}

const MOTORINO_BASE_COST = 150

const TUNING_PARTS: TuningPart[] = [
  {
    id: 'marmitta_leovince',
    name: 'Marmitta LeoVince ZX',
    description: 'Espansione cromata ad alto rendimento. Fa un rumore pazzesco!',
    cost: 60,
    tuningValue: 15,
    coattaggineBonus: 15,
    figositaBonus: 10,
    benefitText: '+15 Coattaggine, +10 Figosità, +10% successo in gara'
  },
  {
    id: 'carburatore_19',
    name: 'Carburatore Dell\'Orto 19',
    description: 'Aumenta l\'apporto di miscela. Consuma di più ma tira forte!',
    cost: 40,
    tuningValue: 12,
    coattaggineBonus: 10,
    figositaBonus: 5,
    benefitText: '+10 Coattaggine, +5 Figosità, +8% successo in gara'
  },
  {
    id: 'malossi_70cc',
    name: 'Cilindro Malossi 70cc Trofeo',
    description: 'Elaborazione termica spinta! Prestazioni mostruose, ma occhio ai carabinieri.',
    cost: 120,
    tuningValue: 35,
    coattaggineBonus: 25,
    figositaBonus: 15,
    benefitText: '+25 Coattaggine, +15 Figosità, +25% gare, +25% fuga Polizia'
  },
  {
    id: 'neon_sottoscocca',
    name: 'Neon Sottoscocca & Carene Custom',
    description: 'Luci neon sotto la scocca. Di sera fa una figura pazzesca!',
    cost: 30,
    tuningValue: 8,
    coattaggineBonus: 5,
    figositaBonus: 20,
    benefitText: '+5 Coattaggine, +20 Figosità, +5% successo in gara'
  },
  {
    id: 'variatore_polini',
    name: 'Variatore Polini Hi-Speed',
    description: 'Migliora lo scatto e l\'erogazione ai bassi regimi.',
    cost: 50,
    tuningValue: 15,
    coattaggineBonus: 10,
    figositaBonus: 5,
    benefitText: '+10 Coattaggine, +5 Figosità, +12% successo in gara'
  }
]

export const MotorinoGarageDialog = memo(function MotorinoGarageDialog({
  open,
  onOpenChange,
  playerStats,
  setStats,
  consumeAction,
  announce,
  addLogEntry,
  currentPhase,
  gameTime,
}: MotorinoGarageDialogProps) {
  const hasMotorino = playerStats.hasMotorino
  const ownedParts = playerStats.motorinoPezzi ?? []
  const tuningLevel = playerStats.motorinoTuning ?? 0

  const handleBuyMotorino = () => {
    if (playerStats.soldi < MOTORINO_BASE_COST) {
      playSound.failure()
      announce('Non hai abbastanza soldi per acquistare il motorino!', 'assertive')
      return
    }

    playSound.moneySpent()
    playSound.success()
    
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - MOTORINO_BASE_COST, 0, 1000),
      hasMotorino: true,
      motorinoTuning: 0,
      motorinoPezzi: [],
      coattaggine: clampStat(current.coattaggine + 10),
      figosita: clampStat(current.figosita + 5),
    }))

    const msg = `Hai comprato un Booster MBK base! Ora si viaggia! -150€, +10 Coattaggine, +5 Figosità`
    announce(msg)
    addLogEntry('action_neutral', 'Acquisto motorino', msg, 'positive', gameTime.currentDate, currentPhase)
  }

  const handleBuyPart = (part: TuningPart) => {
    if (playerStats.soldi < part.cost) {
      playSound.failure()
      announce(`Non hai abbastanza soldi per la parte: ${part.name}!`, 'assertive')
      return
    }

    playSound.moneySpent()
    playSound.statIncrease()

    setStats((current) => {
      const currentParts = current.motorinoPezzi ?? []
      const newParts = [...currentParts, part.id]
      const newTuning = Math.min(100, (current.motorinoTuning ?? 0) + part.tuningValue)
      
      return {
        ...current,
        soldi: clampStat(current.soldi - part.cost, 0, 1000),
        coattaggine: clampStat(current.coattaggine + part.coattaggineBonus),
        figosita: clampStat(current.figosita + part.figositaBonus),
        motorinoTuning: newTuning,
        motorinoPezzi: newParts
      }
    })

    const msg = `Montato pezzo: ${part.name}! Il motorino fa più casino! -${part.cost}€, +${part.coattaggineBonus} Coattaggine, +${part.figositaBonus} Figosità`
    announce(msg)
    addLogEntry('action_neutral', 'Tuning motorino', msg, 'positive', gameTime.currentDate, currentPhase)
  }

  const handleSgasa = () => {
    if (playerStats.soldi < 5) {
      playSound.failure()
      announce('Non hai nemmeno 5€ per la miscela! Vai a lavorare!', 'assertive')
      return
    }
    if (playerStats.stanchezza > 85) {
      playSound.failure()
      announce('Sei troppo distrutto per sgasare nel quartiere! Riposati!', 'assertive')
      return
    }

    // Custom Web Audio revving sound
    if (typeof playSound !== 'undefined' && (playSound as any).motorinoRev) {
      (playSound as any).motorinoRev()
    } else {
      playSound.statIncrease()
    }

    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - 5, 0, 1000),
      coattaggine: clampStat(current.coattaggine + 5),
      stanchezza: clampStat(current.stanchezza + 10)
    }))

    consumeAction()
    
    const msg = `Hai fatto due sgasate in impennata nel piazzale! Le tipe guardano! -5€, +5 Coattaggine, +10 Stanchezza`
    announce(msg)
    addLogEntry('action_neutral', 'Sgasata nel piazzale', msg, 'positive', gameTime.currentDate, currentPhase)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-secondary max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-secondary flex items-center gap-2">
            <Motorcycle size={32} weight="fill" />
            GARAGE TUNING MOTORINO
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            L'officina clandestina definitiva. Trucca il tuo Booster per vincere gare o scappare dai carabinieri!
          </DialogDescription>
        </DialogHeader>

        {!hasMotorino ? (
          <div className="p-6 border border-dashed rounded text-center space-y-4 my-2">
            <Motorcycle size={64} className="mx-auto text-muted-foreground/50 animate-bounce" />
            <h4 className="text-lg font-bold text-foreground">Non possiedi un motorino!</h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Per sgasare nel quartiere e truccare il mezzo hai bisogno di acquistare prima un motorino base.
            </p>
            <div className="pt-2">
              <Button 
                onClick={handleBuyMotorino}
                disabled={playerStats.soldi < MOTORINO_BASE_COST}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold flex items-center justify-center gap-2"
              >
                <Coins size={20} />
                Acquista Booster MBK Base (Costo: {MOTORINO_BASE_COST}€)
              </Button>
              {playerStats.soldi < MOTORINO_BASE_COST && (
                <p className="text-xs text-destructive mt-1">Non hai abbastanza soldi! Ti mancano {MOTORINO_BASE_COST - playerStats.soldi}€</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            {/* Status box */}
            <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="flex items-center gap-1"><Wrench /> Elaborazione Mezzo:</span>
                <span className="text-secondary font-bold">{tuningLevel}%</span>
              </div>
              <Progress 
                value={tuningLevel} 
                className="h-3 bg-muted rounded-full overflow-hidden" 
                role="progressbar" 
                aria-valuenow={tuningLevel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Livello elaborazione motorino: ${tuningLevel} percento`}
              />
              <div className="text-xs text-muted-foreground">
                <span className="font-bold">Parti installate:</span>{' '}
                {ownedParts.length === 0 ? 'Nessuna (Motorino di serie)' : (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ownedParts.map((partId) => {
                      const part = TUNING_PARTS.find((p) => p.id === partId)
                      return (
                        <span key={partId} className="px-2 py-0.5 bg-secondary/20 text-secondary border border-secondary/30 rounded-full font-mono text-[10px]">
                          {part?.name || partId}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sgasata Action */}
            <div className="p-3 border border-secondary/40 rounded-lg bg-secondary/5 flex items-center justify-between gap-3">
              <div className="flex-1">
                <h5 className="font-bold text-sm text-secondary flex items-center gap-1">
                  <Flame weight="fill" /> SGASA NEL PIAZZALE!
                </h5>
                <p className="text-xs text-muted-foreground">
                  Fai casino nel quartiere. Costa 5€ per la benzina, consuma 1 azione.
                </p>
              </div>
              <Button
                onClick={handleSgasa}
                disabled={playerStats.soldi < 5 || playerStats.stanchezza > 85}
                size="sm"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-1 font-bold shrink-0"
              >
                <Flame /> Sgasa!
              </Button>
            </div>

            {/* Shop List */}
            <div className="space-y-2">
              <h5 className="text-sm font-bold text-foreground border-b pb-1">PARTI DI RICAMBIO DISPONIBILI</h5>
              <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                {TUNING_PARTS.map((part) => {
                  const isOwned = ownedParts.includes(part.id)
                  const canAfford = playerStats.soldi >= part.cost
                  
                  return (
                    <div key={part.id} className="p-3 border rounded-lg flex justify-between items-center gap-4 text-xs hover:border-secondary/40 transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-foreground flex items-center gap-1">
                          {part.name}
                          {isOwned && <span className="text-green-500 flex items-center gap-0.5 text-[10px] font-semibold"><Check size={12} weight="bold" /> Installato</span>}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{part.description}</p>
                        <p className="text-[10px] font-semibold text-secondary">{part.benefitText}</p>
                      </div>
                      <div className="text-center shrink-0">
                        {!isOwned ? (
                          <Button
                            onClick={() => handleBuyPart(part)}
                            disabled={!canAfford}
                            size="sm"
                            className="w-20 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            {part.cost}€
                          </Button>
                        ) : (
                          <div className="w-20 py-1.5 border border-green-500/30 text-green-500 rounded text-center font-bold bg-green-500/10 flex items-center justify-center gap-0.5">
                            <Check weight="bold" /> OK
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t flex justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="border-primary text-primary">Chiudi Garage</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
})
