import { memo } from 'react'
import { Motorcycle, Wrench, Coins, Flame, Shield, X, Check, Storefront } from '@phosphor-icons/react'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { GameStats } from '@/lib/types'
import { playSound } from '@/lib/sound-effects'
import { clampStat } from '@/lib/game-utils'
import { VEHICLES, TUNING_PARTS, VehicleDefinition, TuningPartDefinition } from '@/lib/motorino-catalog'

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
  activeTab?: 'tuning' | 'shop'
  onActiveTabChange?: (tab: 'tuning' | 'shop') => void
}

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
  activeTab = 'tuning',
  onActiveTabChange,
}: MotorinoGarageDialogProps) {
  const hasMotorino = playerStats.hasMotorino
  const currentModelId = playerStats.motorinoModello ?? (hasMotorino ? 'ciao' : '')
  const currentVehicle: VehicleDefinition | undefined = VEHICLES[currentModelId]
  const ownedParts = playerStats.motorinoPezzi ?? []
  const tuningLevel = playerStats.motorinoTuning ?? 0

  const handleBuyVehicle = (vehicle: VehicleDefinition) => {
    const tradeInValue = currentVehicle ? currentVehicle.permuteValue : 0
    const finalCost = Math.max(0, vehicle.cost - tradeInValue)

    if (playerStats.soldi < finalCost) {
      playSound.failure()
      announce(`Non hai abbastanza soldi! Servono ${finalCost}€`, 'assertive')
      return
    }

    playSound.moneySpent()
    playSound.success()

    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - finalCost, 0, 1000),
      hasMotorino: true,
      motorinoModello: vehicle.id,
      motorinoTuning: 0,
      motorinoPezzi: [],
      coattaggine: clampStat(current.coattaggine + (vehicle.category === 'heavy' ? 25 : 10)),
      figosita: clampStat(current.figosita + (vehicle.category === 'heavy' ? 20 : 5)),
    }))

    const msg = `Hai acquistato un ${vehicle.name}! ${
      tradeInValue > 0 ? `Permutato il tuo vecchio mezzo per ${tradeInValue}€.` : ''
    } Spesa finale: ${finalCost}€.`
    announce(msg)
    addLogEntry('action_neutral', 'Acquisto veicolo', msg, 'positive', gameTime.currentDate, currentPhase)
  }

  const handleBuyPart = (part: TuningPartDefinition) => {
    if (!currentVehicle) return

    if (playerStats.soldi < part.cost) {
      playSound.failure()
      announce(`Non hai abbastanza soldi per la parte: ${part.name}!`, 'assertive')
      return
    }

    if (tuningLevel >= currentVehicle.maxTuning) {
      playSound.failure()
      announce(`Hai già raggiunto il limite di tuning per il tuo ${currentVehicle.name}!`, 'assertive')
      return
    }

    playSound.moneySpent()
    playSound.statIncrease()

    setStats((current) => {
      const currentParts = current.motorinoPezzi ?? []
      const newParts = [...currentParts, part.id]
      const newTuning = Math.min(currentVehicle.maxTuning, (current.motorinoTuning ?? 0) + part.tuningValue)

      return {
        ...current,
        soldi: clampStat(current.soldi - part.cost, 0, 1000),
        coattaggine: clampStat(current.coattaggine + part.coattaggineBonus),
        figosita: clampStat(current.figosita + part.figositaBonus),
        motorinoTuning: newTuning,
        motorinoPezzi: newParts,
      }
    })

    const msg = `Montato pezzo: ${part.name}! -${part.cost}€, +${part.coattaggineBonus} Coattaggine, +${part.figositaBonus} Figosità`
    announce(msg)
    addLogEntry('action_neutral', 'Tuning motorino', msg, 'positive', gameTime.currentDate, currentPhase)
  }

  const handleSgasa = () => {
    if (!currentVehicle) return

    const fuelCost = currentVehicle.id === 'ciao' ? 3 : 5

    if (playerStats.soldi < fuelCost) {
      playSound.failure()
      announce(`Non hai nemmeno ${fuelCost}€ per la miscela! Vai a lavorare!`, 'assertive')
      return
    }
    if (playerStats.stanchezza > 85) {
      playSound.failure()
      announce('Sei troppo distrutto per sgasare nel quartiere! Riposati!', 'assertive')
      return
    }

    if (typeof playSound !== 'undefined' && (playSound as any).motorinoRev) {
      ;(playSound as any).motorinoRev()
    } else {
      playSound.statIncrease()
    }

    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - fuelCost, 0, 1000),
      coattaggine: clampStat(current.coattaggine + 5),
      stanchezza: clampStat(current.stanchezza + (currentVehicle.id === 'si' ? 7 : 10)),
    }))

    consumeAction()

    const msg = `Hai fatto due sgasate in impennata con il tuo ${currentVehicle.name}! -${fuelCost}€, +5 Coattaggine, +${
      currentVehicle.id === 'si' ? 7 : 10
    } Stanchezza`
    announce(msg)
    addLogEntry('action_neutral', 'Sgasata nel piazzale', msg, 'positive', gameTime.currentDate, currentPhase)
  }

  const handleSellVehicle = () => {
    if (!currentVehicle) return

    playSound.success()
    playSound.moneySpent() // triggers cash register sound

    const refund = currentVehicle.permuteValue

    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi + refund, 0, 1000),
      hasMotorino: false,
      motorinoModello: undefined,
      motorinoTuning: 0,
      motorinoPezzi: [],
    }))

    const msg = `Hai venduto il tuo ${currentVehicle.name} per ${refund}€! Ora sei a piedi.`
    announce(msg)
    addLogEntry('action_neutral', 'Vendita motorino', msg, 'positive', gameTime.currentDate, currentPhase)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-secondary max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-secondary flex items-center gap-2">
            <Motorcycle size={32} weight="fill" />
            GARAGE & CONCESSIONARIA MOTO
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            L'officina del tuning clandestino e il concessionario Gennaro Moto. Gestisci il tuo bolide!
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => onActiveTabChange?.(val as 'tuning' | 'shop')}
          className="w-full mt-4"
        >
          <TabsList className="grid grid-cols-2 gap-2 bg-muted/40 p-1 mb-4 h-auto">
            <TabsTrigger value="tuning" className="py-2 text-sm font-bold flex items-center justify-center gap-2">
              <Wrench size={16} /> Officina Tuning
            </TabsTrigger>
            <TabsTrigger value="shop" className="py-2 text-sm font-bold flex items-center justify-center gap-2">
              <Storefront size={16} /> Concessionaria
            </TabsTrigger>
          </TabsList>

          {/* ── SCHEDA 1: OFFICINA TUNING ────────────────────────────────────── */}
          <TabsContent value="tuning" className="space-y-4 outline-none">
            {!hasMotorino || !currentVehicle ? (
              <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
                <Motorcycle size={64} className="mx-auto text-muted-foreground/30" />
                <h4 className="text-lg font-bold text-foreground">Non possiedi alcun mezzo!</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Visita la scheda <strong>Concessionaria</strong> per acquistare il tuo primo ciclomotore.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Dettagli Mezzo Posseduto */}
                <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-foreground flex items-center gap-1">
                      <Motorcycle weight="fill" className="text-secondary" /> {currentVehicle.name}
                    </span>
                    <span className="text-secondary font-mono">
                      Tuning: {tuningLevel}% / {currentVehicle.maxTuning}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{currentVehicle.description}"
                  </p>
                  <Progress
                    value={(tuningLevel / currentVehicle.maxTuning) * 100}
                    className="h-3 bg-muted rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={tuningLevel}
                    aria-valuemin={0}
                    aria-valuemax={currentVehicle.maxTuning}
                    aria-label={`Elaborazione attuale: ${tuningLevel} percento su massimo di ${currentVehicle.maxTuning}`}
                  />
                  <div className="text-[11px] text-muted-foreground pt-1">
                    <span className="font-bold">Modifiche installate:</span>{' '}
                    {ownedParts.length === 0 ? (
                      'Nessuna (Mezzo di serie)'
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ownedParts.map((partId) => {
                          const part = TUNING_PARTS.find((p) => p.id === partId)
                          return (
                            <span
                              key={partId}
                              className="px-2 py-0.5 bg-secondary/15 text-secondary border border-secondary/30 rounded-full font-mono text-[10px]"
                            >
                              {part?.name || partId}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Azione Sgasa */}
                <div className="p-3 border border-secondary/40 rounded-lg bg-secondary/5 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-secondary flex items-center gap-1">
                      <Flame weight="fill" /> SGASA NEL PIAZZALE
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Fai casino. Costa {currentVehicle.id === 'ciao' ? '3€' : '5€'} di miscela, consuma 1 azione.{' '}
                      {currentVehicle.id === 'si' && 'Comfort Sì: stanca meno!'}
                    </p>
                  </div>
                  <Button
                    onClick={handleSgasa}
                    disabled={playerStats.soldi < (currentVehicle.id === 'ciao' ? 3 : 5) || playerStats.stanchezza > 85}
                    size="sm"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-1 font-bold shrink-0"
                  >
                    <Flame size={16} /> Sgasa!
                  </Button>
                </div>

                {/* Elenco Pezzi Elaborazione */}
                <div className="space-y-2">
                  <h5 className="text-sm font-bold text-foreground border-b pb-1">PEZZI DI RICAMBIO DISPONIBILI</h5>
                  <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
                    {TUNING_PARTS.map((part) => {
                      const isOwned = ownedParts.includes(part.id)
                      const isMax = tuningLevel >= currentVehicle.maxTuning
                      const canAfford = playerStats.soldi >= part.cost

                      return (
                        <div
                          key={part.id}
                          className="p-3 border rounded-lg flex justify-between items-center gap-4 text-xs hover:border-secondary/30 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="font-bold text-foreground flex items-center gap-1">
                              {part.name}
                              {isOwned && (
                                <span className="text-green-500 flex items-center gap-0.5 text-[10px] font-semibold">
                                  <Check size={12} weight="bold" /> Installato
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground">{part.benefitText}</p>
                          </div>
                          <div className="text-center shrink-0">
                            {isOwned ? (
                              <div className="w-20 py-1.5 border border-green-500/30 text-green-500 rounded font-bold bg-green-500/10 flex items-center justify-center gap-0.5">
                                <Check weight="bold" /> OK
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleBuyPart(part)}
                                disabled={!canAfford || isMax}
                                size="sm"
                                className="w-20 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                {isMax ? 'MAX' : `${part.cost}€`}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── SCHEDA 2: CONCESSIONARIA ─────────────────────────────────────── */}
          <TabsContent value="shop" className="space-y-4 outline-none">
            {/* Permuta Info */}
            <div className="p-4 border rounded-lg bg-muted/20 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">Il tuo mezzo attuale:</h4>
                <p className="text-xs text-muted-foreground">
                  {currentVehicle ? `${currentVehicle.name}` : 'A piedi'}
                </p>
                {currentVehicle && (
                  <p className="text-[11px] text-green-500 font-semibold mt-1">
                    Valutazione permuta: {currentVehicle.permuteValue}€
                  </p>
                )}
              </div>
              {currentVehicle && (
                <Button onClick={handleSellVehicle} size="sm" variant="destructive" className="font-bold text-xs">
                  Vendi per {currentVehicle.permuteValue}€
                </Button>
              )}
            </div>

            {/* Listino Modelli */}
            <div className="space-y-2">
              <h5 className="text-sm font-bold text-foreground border-b pb-1">MEZZI IN VENDITA DA GENNARO MOTO</h5>
              <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                {Object.values(VEHICLES).map((vehicle) => {
                  const isOwned = currentModelId === vehicle.id
                  const age = gameTime.age
                  const isAgeLocked = age < vehicle.minAge
                  const tradeIn = currentVehicle ? currentVehicle.permuteValue : 0
                  const finalCost = Math.max(0, vehicle.cost - tradeIn)
                  const canAfford = playerStats.soldi >= finalCost

                  let categoryLabel = '50cc Ciclomotore'
                  if (vehicle.category === 'base') categoryLabel = 'Catorcio Base'
                  if (vehicle.category === '125cc') categoryLabel = '125cc (16+)'
                  if (vehicle.category === 'heavy') categoryLabel = 'Moto Grande (18+)'

                  return (
                    <div
                      key={vehicle.id}
                      className={`p-3 border rounded-lg flex justify-between items-center gap-4 text-xs transition-colors ${
                        isOwned ? 'border-primary/50 bg-primary/5' : 'hover:border-accent/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{vehicle.name}</span>
                          <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[9px] font-semibold uppercase">
                            {categoryLabel}
                          </span>
                          {vehicle.isIllegal && (
                            <span className="px-1.5 py-0.5 bg-destructive/15 text-destructive border border-destructive/20 rounded text-[9px] font-bold">
                              ILLEGALE
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
                        <div className="text-[10px] text-accent font-semibold flex flex-wrap gap-x-3">
                          <span>Max Tuning: {vehicle.maxTuning}%</span>
                          <span>Spinta base: {vehicle.baseWinChance}%</span>
                          {isAgeLocked && (
                            <span className="text-destructive font-bold">Richiede {vehicle.minAge} anni</span>
                          )}
                        </div>
                      </div>

                      <div className="text-center shrink-0">
                        {isOwned ? (
                          <div className="w-24 py-1.5 border border-primary text-primary bg-primary/5 rounded font-bold text-center">
                            Posseduto
                          </div>
                        ) : isAgeLocked ? (
                          <div className="w-24 py-1.5 border border-muted text-muted-foreground rounded text-center font-bold">
                            Bloccato
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Button
                              onClick={() => handleBuyVehicle(vehicle)}
                              disabled={!canAfford}
                              size="sm"
                              className="w-24 font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
                            >
                              {finalCost === 0 ? 'GRATIS' : `${finalCost}€`}
                            </Button>
                            {tradeIn > 0 && finalCost > 0 && (
                              <p className="text-[9px] text-muted-foreground line-through">Listino {vehicle.cost}€</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-3 border-t flex justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="border-secondary text-secondary">
              Chiudi
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
})
