import React from 'react'
import { Card } from '@/components/ui/card'
import { 
  MusicNotes, 
  FilmSlate, 
  ShoppingCart,
  Barbell,
  Sun,
  Briefcase,
  Buildings
} from '@phosphor-icons/react'
import { ActionButton } from '@/components/ActionButton'

interface CityPanelProps {
  onDisco: () => void
  onCinema: () => void
  onShopping: () => void
  onPalestra: () => void
  onLampada: () => void
  onLavoro: () => void
  actionsRemaining: number
  soldi: number
  muscoli: number
  stanchezza: number
}

export function CityPanel({
  onDisco,
  onCinema,
  onShopping,
  onPalestra,
  onLampada,
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
              disabled={actionsRemaining <= 0 || soldi < 60 || stanchezza > 70}
              blockedReason={
                actionsRemaining <= 0 
                  ? 'Nessuna azione per questa fascia oraria' 
                  : soldi < 60 
                  ? 'Servono almeno 60€' 
                  : 'Sei troppo stanco per ballare!'
              }
              variant="default"
              ariaLabel="Vai in discoteca per ballare e fare colpo. Costa 60 euro. Tasto rapido: Ctrl+D"
            />
            <ActionButton
              icon={<FilmSlate size={48} />}
              label="Cinema"
              shortcut="Ctrl+C"
              onClick={onCinema}
              disabled={actionsRemaining <= 0 || soldi < 40}
              blockedReason={
                actionsRemaining <= 0 
                  ? 'Nessuna azione per questa fascia oraria' 
                  : 'Servono almeno 40€'
              }
              variant="secondary"
              ariaLabel="Vai al cinema per rilassarti e magari incontrare qualcuno. Costa 40 euro. Tasto rapido: Ctrl+C"
            />
            <ActionButton
              icon={<ShoppingCart size={48} />}
              label="Centro Commerciale"
              shortcut="Ctrl+S"
              onClick={onShopping}
              disabled={actionsRemaining <= 0 || soldi < 100}
              blockedReason={
                actionsRemaining <= 0 
                  ? 'Nessuna azione per questa fascia oraria' 
                  : 'Servono almeno 100€'
              }
              variant="default"
              ariaLabel="Fai shopping per comprare vestiti nuovi. Costa 100 euro. Tasto rapido: Ctrl+S"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            <p>💡 Questi luoghi ti permettono di socializzare e migliorare le tue statistiche!</p>
          </div>
        </Card>

        <Card className="p-6 border-2 border-secondary bg-card">
          <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
            <Barbell size={24} weight="fill" />
            PALESTRE & CENTRI
          </h3>
          <div className="space-y-3">
            <ActionButton
              icon={<Barbell size={48} />}
              label="Palestra"
              shortcut="Ctrl+1"
              onClick={onPalestra}
              disabled={actionsRemaining <= 0 || soldi < 20}
              blockedReason={
                actionsRemaining <= 0 
                  ? 'Nessuna azione per questa fascia oraria' 
                  : 'Servono almeno 20€'
              }
              ariaLabel="Vai in palestra per pompare muscoli. Costa 20 euro e aumenta la stanchezza. Tasto rapido: Ctrl+1"
            />
            <ActionButton
              icon={<Sun size={48} />}
              label="Centro Estetico"
              shortcut="Ctrl+2"
              onClick={onLampada}
              disabled={actionsRemaining <= 0 || soldi < 30}
              blockedReason={
                actionsRemaining <= 0 
                  ? 'Nessuna azione per questa fascia oraria' 
                  : 'Servono almeno 30€'
              }
              ariaLabel="Vai al centro estetico per lampada abbronzante e aumentare la coattaggine. Costa 30 euro. Tasto rapido: Ctrl+2"
            />
            <ActionButton
              icon={<Briefcase size={48} />}
              label="Locale Notturno (Lavoro)"
              shortcut="Ctrl+3"
              onClick={onLavoro}
              disabled={actionsRemaining <= 0 || muscoli < 40 || stanchezza > 80}
              blockedReason={
                actionsRemaining <= 0 
                  ? 'Nessuna azione per questa fascia oraria' 
                  : muscoli < 40 
                  ? 'Servono almeno 40 Muscoli' 
                  : 'Sei troppo stanco per lavorare!'
              }
              ariaLabel="Lavora come buttafuori nel locale notturno. Richiede 40 muscoli. Guadagni soldi e coattaggine. Tasto rapido: Ctrl+3"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Requisiti Lavoro:</p>
            <p>• Muscoli ≥ 40</p>
            <p>• Stanchezza {'<'} 80</p>
            <p className="mt-2 text-secondary font-semibold">Ricompensa: +80€, +5 Coattaggine</p>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-2 border-muted bg-card/50">
        <h3 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
          📍 MAPPA DI ROMA
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-muted/30 rounded">
            <div className="font-bold text-accent">🎵 Discoteca</div>
            <div className="text-xs text-muted-foreground">Via del Corso</div>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <div className="font-bold text-accent">🎬 Cinema</div>
            <div className="text-xs text-muted-foreground">Piazza Navona</div>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <div className="font-bold text-accent">🛍️ Centro Commerciale</div>
            <div className="text-xs text-muted-foreground">EUR</div>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <div className="font-bold text-secondary">💪 Palestra</div>
            <div className="text-xs text-muted-foreground">Quartiere Prati</div>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <div className="font-bold text-secondary">☀️ Centro Estetico</div>
            <div className="text-xs text-muted-foreground">Via Veneto</div>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <div className="font-bold text-secondary">🏢 Locale Notturno</div>
            <div className="text-xs text-muted-foreground">Testaccio</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
