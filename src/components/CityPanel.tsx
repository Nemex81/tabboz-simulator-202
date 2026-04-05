import React from 'react'
import { Card } from '@/components/ui/card'
import { 
  MusicNotes, 
  ShoppingCar
  Sun,
  Building
import
interface Ci
  onCinema:
  onPalestra: () => void
  onLavoro: () => void

  stanchezza: number

  onDisco,
  onShopping,
  onLampada,
  actionsRemaining,
  muscoli,
}: CityPanelProps) {
    <div classN
        <div clas
            <Buildin
 

        </div>

        <Ca
            <
          </h
            
  onLavoro,
  actionsRemaining,
  soldi,
  muscoli,
  stanchezza
}: CityPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-primary bg-card">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Buildings size={48} weight="fill" className="text-primary" />
            <h2 className="text-3xl font-bold text-primary">ROMA, ITALIA</h2>
          </div>
          <p className="text-muted-foreground">
            Esplora la città e i suoi luoghi! Ogni azione ti porta in un posto diverso.
          </p>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-2 border-accent bg-card">
          <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
            <MusicNotes size={24} weight="fill" />
            SVAGO & DIVERTIMENTO
          </h3>
          <div className="space-y-3">
            <ActionButton
              icon={<MusicNotes size={48} />}
              label="Discoteca"
              shortcut="Ctrl+D"
              onClick={onDisco}
              onClick={onShopping}
              blockedReason={
                  ? 'Nessuna azione pe
              }
              ariaLabel="Fai sh
          </div>
            <p>💡 Questi luoghi ti permettono di soc
        </Card>
        <Card className="p-6 bo
            <Barbell size={24} weight="fill" />
          </h3
            <ActionButton
              label="Palestra"
              onClick={onPal
              blockedReason={
                  ? 'Nessuna azi
              }
            />
              icon={<Sun size={48} />}
              shortcut="Ctrl+2"
              disabled={actionsRemaining
               
                  : 'Servono alme
              ariaLabel="Vai al centro estetico per lampada abbronzante e aumentare la coattaggine. Costa 30 euro. Tasto
            <A
              label="Loca
              onClick={onLavoro}
              blockedReason={
                  ? 'Nessuna az
                  ? 'Servono almen
              }
            />
          <div className="mt-4 pt-4 bo
            <p>• Muscoli ≥ 40</p>
            <p className="mt-2 text-secon
        </Card>

        <h3 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
        </h3>
          <div c
            <div className="text-xs text-muted-foreground">Via del Corso</div>
          <div className="p-3 bg-muted/30 rounded">
            <div
          <div 

          <div className="p-3 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">Quartiere Prati</div>
          <div className="p-3 bg-muted/30 round
            <div className="t
          <div 
            <div className="text-xs t
        </div>
    </div>
}










































































            <div className="font-bold text-secondary">🏢 Locale Notturno</div>
            <div className="text-xs text-muted-foreground">Testaccio</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
