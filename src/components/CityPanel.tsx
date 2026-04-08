import React from 'react'
import { 
  MusicNotes, 
  FilmSlate,
  ShoppingCart,
  Barbell,
  Briefcase,
  Buildings,
  Sun
} from '@phosphor-icons/react'
import { ActionButton } from '@/components/ActionButton'
import { Card } from '@/components/ui/card'
import type { PhaseActionEntry, ActionId } from '@/lib/phase-actions'

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
  morningChoicePending?: boolean
  availableActions?: PhaseActionEntry[]
  onAction?: (id: ActionId) => void
}

// R16: helper per evitare ripetizione del pattern disabled/blockedReason
interface ActionState {
  disabled: boolean
  blockedReason: string | undefined
}

function getActionState(
  morningChoicePending: boolean,
  actionsRemaining: number,
  extraCheck?: { condition: boolean; reason: string }
): ActionState {
  if (morningChoicePending) {
    return { disabled: true, blockedReason: '🏫 Scegli prima se andare a scuola o marinare!' }
  }
  if (actionsRemaining <= 0) {
    return { disabled: true, blockedReason: 'Nessuna azione per questa fascia oraria' }
  }
  if (extraCheck?.condition) {
    return { disabled: true, blockedReason: extraCheck.reason }
  }
  return { disabled: false, blockedReason: undefined }
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
  stanchezza,
  morningChoicePending = false,
  availableActions,
  onAction,
}: CityPanelProps) {
  const base = (extra?: { condition: boolean; reason: string }) =>
    getActionState(morningChoicePending, actionsRemaining, extra)

  return (
    <div className="space-y-6" role="region" aria-label="Pannello città">
      {availableActions && availableActions.length > 0 && (
        <Card className="p-4 border border-accent bg-card">
          <h3
            className="text-base font-bold mb-3 text-accent"
            id="azioni-disponibili-heading"
          >
            Azioni disponibili ora
          </h3>
          <div
            className="space-y-2"
            role="list"
            aria-labelledby="azioni-disponibili-heading"
          >
            {availableActions.map(entry => (
              <button
                key={entry.id}
                role="listitem"
                onClick={() => onAction?.(entry.id)}
                disabled={!onAction}
                className="w-full text-left px-4 py-2 rounded bg-muted/30 hover:bg-muted/60 transition-colors text-sm font-medium disabled:opacity-50"
                aria-label={entry.label}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </Card>
      )}
      <Card className="p-6 border-2 border-primary bg-card">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Buildings size={48} weight="fill" className="text-primary" />
            <h2 className="text-3xl font-bold text-primary">ROMA, ITALIA</h2>
          </div>
          <p className="text-muted-foreground">Esplora la città e le sue opportunità</p>
        </div>

        <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
          <MusicNotes size={24} weight="fill" />
          VITA NOTTURNA
        </h3>
        <div className="space-y-3">
          <ActionButton
            icon={<MusicNotes size={48} />}
            label="Discoteca"
            shortcut="Ctrl+D"
            onClick={onDisco}
            {...base({ condition: soldi < 30, reason: 'Servono almeno 30€' })}
            ariaLabel="Vai in discoteca. Costa 30 euro. Aumenta Figosità e Carisma. Tasto rapido: Ctrl+D"
            variant="default"
          />
          <ActionButton
            icon={<FilmSlate size={48} />}
            label="Cinema"
            shortcut="Ctrl+C"
            onClick={onCinema}
            {...base({ condition: soldi < 15, reason: 'Servono almeno 15€' })}
            ariaLabel="Vai al cinema. Costa 15 euro. Aumenta Carisma e riduce Stanchezza. Tasto rapido: Ctrl+C"
            variant="default"
          />
          <ActionButton
            icon={<ShoppingCart size={48} />}
            label="Centro Commerciale"
            shortcut="Ctrl+S"
            onClick={onShopping}
            {...base({ condition: soldi < 100, reason: 'Servono almeno 100€' })}
            ariaLabel="Vai al centro commerciale. Costa 100 euro. Aumenta molto la Figosità. Tasto rapido: Ctrl+S"
            variant="default"
          />
        </div>
      </Card>

      <Card className="p-6 border-2 border-secondary bg-card">
        <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
          <Barbell size={24} weight="fill" />
          LAVORO & MIGLIORAMENTO
        </h3>
        <div className="space-y-3">
          <ActionButton
            icon={<Barbell size={48} />}
            label="Palestra"
            shortcut="Ctrl+1"
            onClick={onPalestra}
            {...base(
              soldi < 20
                ? { condition: true, reason: 'Servono almeno 20€' }
                : { condition: stanchezza > 80, reason: 'Sei troppo stanco per allenarti!' }
            )}
            ariaLabel="Vai in palestra. Costa 20 euro. Aumenta Muscoli. Tasto rapido: Ctrl+1"
            variant="default"
          />
          <ActionButton
            icon={<Sun size={48} />}
            label="Lampada"
            shortcut="Ctrl+2"
            onClick={onLampada}
            {...base({ condition: soldi < 25, reason: 'Servono almeno 25€' })}
            ariaLabel="Vai alla lampada abbronzante. Costa 25 euro. Aumenta Figosità. Tasto rapido: Ctrl+2"
            variant="default"
          />
          <ActionButton
            icon={<Briefcase size={48} />}
            label="Lavoro"
            shortcut="Ctrl+3"
            onClick={onLavoro}
            {...base({ condition: muscoli < 40, reason: 'Servono almeno 40 Muscoli per lavorare!' })}
            ariaLabel="Lavora per guadagnare soldi. Richiede almeno 40 Muscoli. Tasto rapido: Ctrl+3"
            variant="default"
          />
        </div>
        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
          <p className="font-semibold mb-2">Requisiti Lavoro:</p>
          <p>• Muscoli ≥ 40</p>
          <p className="mt-2 text-secondary font-semibold">Guadagno: +60€</p>
        </div>
      </Card>

      <Card className="p-6 border-2 border-muted bg-card">
        <h3 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
          <Buildings size={20} weight="fill" />
          Luoghi di Roma
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 bg-muted/30 rounded">
            <div className="font-bold text-accent">🎵 Discoteca</div>
            <div className="text-xs text-muted-foreground">Via del Corso</div>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <div className="font-bold text-accent">🎬 Cinema</div>
            <div className="text-xs text-muted-foreground">Piazza di Spagna</div>
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
            <div className="font-bold text-secondary">☀️ Lampada</div>
            <div className="text-xs text-muted-foreground">Trastevere</div>
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
