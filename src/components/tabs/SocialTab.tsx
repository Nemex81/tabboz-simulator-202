import { Brain, Chats, Heart, Motorcycle, UserCircle, PersonSimpleRun } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { ActionButton } from '@/components/ActionButton'
import { calculateStudyGradeIncrease } from '@/lib/game-utils'

interface SocialTabProps {
  morningChoicePending: boolean
  phaseActionsLeft: number
  isSchoolPeriod: boolean
  stanchezza: number
  soldi: number
  intelligenza: number
  handleStudia: () => void
  handleChiacchiera: () => void
  handleParco: () => void
  handleTelefona: () => void
  handleProvarciConAtipa: () => void
  handleMotorino: () => void
  announce: (message: string) => void
}

export function SocialTab({
  morningChoicePending,
  phaseActionsLeft,
  isSchoolPeriod,
  stanchezza,
  soldi,
  intelligenza,
  handleStudia,
  handleChiacchiera,
  handleParco,
  handleTelefona,
  handleProvarciConAtipa,
  handleMotorino,
  announce,
}: SocialTabProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-3 border-2 border-secondary bg-card">
        <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
          <Brain size={24} weight="fill" />
          STUDIO E APPRENDIMENTO
        </h3>
        <div className="space-y-3">
          <ActionButton
            icon={<Brain size={48} />}
            label="Studia"
            shortcut="Ctrl+5"
            onClick={handleStudia}
            disabled={morningChoicePending || phaseActionsLeft <= 0 || stanchezza > 80 || !isSchoolPeriod}
            blockedReason={
              morningChoicePending
                ? '🏫 Scegli prima se andare a scuola o marinare!'
                : phaseActionsLeft <= 0
                  ? 'Nessuna azione per questa fascia oraria'
                  : stanchezza > 80
                    ? 'Sei troppo stanco per studiare!'
                    : 'Non è periodo scolastico'
            }
            variant="secondary"
            ariaLabel="Studia per migliorare i voti. Aumenta l'intelligenza e i voti scolastici. Richiede periodo scolastico. Tasto rapido: Ctrl+5"
            helpText="Studia per migliorare i voti. Aumenta l'intelligenza e i voti in una materia a scelta. L'incremento dipende dalla tua intelligenza. Richiede periodo scolastico."
            announce={announce}
          />
        </div>
        <div className="mt-3 text-xs text-muted-foreground p-3 bg-muted/30 rounded">
          <p>Formula studio: +{calculateStudyGradeIncrease(intelligenza).toFixed(1)} per sessione</p>
        </div>
      </Card>

      <Card className="p-3 border-2 border-primary bg-card">
        <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
          <Chats size={24} weight="fill" />
          SOCIALIZZA GRATIS
        </h3>
        <div className="space-y-3">
          <ActionButton
            icon={<Chats size={48} />}
            label="Chiacchiera"
            onClick={handleChiacchiera}
            disabled={morningChoicePending || phaseActionsLeft <= 0}
            blockedReason={
              morningChoicePending
                ? '🏫 Scegli prima se andare a scuola o marinare!'
                : 'Nessuna azione per questa fascia oraria'
            }
            variant="secondary"
            ariaLabel="Chiacchiera con qualcuno. Gratis. +5 Carisma, +3 Reputazione"
            helpText="Chiacchiera con qualcuno. Gratis. Aumenta il Carisma di 5 e la Reputazione di 3."
            announce={announce}
          />
          <ActionButton
            icon={<PersonSimpleRun size={48} />}
            label="Giro al Parco"
            onClick={handleParco}
            disabled={morningChoicePending || phaseActionsLeft <= 0}
            blockedReason={
              morningChoicePending
                ? '🏫 Scegli prima se andare a scuola o marinare!'
                : 'Nessuna azione per questa fascia oraria'
            }
            variant="secondary"
            ariaLabel="Giro rilassante al parco. Gratis. +5 Carisma, -5 Stanchezza, +2 Reputazione"
            helpText="Giro rilassante al parco. Gratis. Aumenta il Carisma di 5, riduce la Stanchezza di 5 e aumenta la Reputazione di 2."
            announce={announce}
          />
          <ActionButton
            icon={<UserCircle size={48} />}
            label="Telefona"
            onClick={handleTelefona}
            disabled={morningChoicePending || phaseActionsLeft <= 0}
            blockedReason={
              morningChoicePending
                ? '🏫 Scegli prima se andare a scuola o marinare!'
                : 'Nessuna azione per questa fascia oraria'
            }
            variant="secondary"
            ariaLabel="Telefona a un amico. Gratis. +3 Carisma (richiede almeno un amico)"
            helpText="Telefona a un amico. Gratis. Aumenta il Carisma di 3. Richiede almeno un amico sbloccato."
            announce={announce}
          />
        </div>
      </Card>

      <Card className="p-6 border-2 border-accent bg-card">
        <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
          <Heart size={24} weight="fill" />
          RIMORCHIO
        </h3>
        <div className="space-y-3">
          <ActionButton
            icon={<Heart size={48} />}
            label="Atipa"
            shortcut="Ctrl+9"
            onClick={handleProvarciConAtipa}
            disabled={morningChoicePending || phaseActionsLeft <= 0}
            blockedReason={
              morningChoicePending
                ? '🏫 Scegli prima se andare a scuola o marinare!'
                : 'Nessuna azione per questa fascia oraria'
            }
            variant="default"
            ariaLabel="Prova a rimorchiare un'atipa. Se rifiuta perdi Figosiità e Carisma; se accetta guadagni entrambi. Tasto rapido: Ctrl+9"
            helpText="Prova a rimorchiare. In caso di successo guadagni Figosiità e Carisma; in caso di rifiuto li perdi. Tasto rapido: Ctrl+9."
            announce={announce}
          />
        </div>
        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
          <p>💡 Altri modi per socializzare: vai in <strong>Città</strong> per visitare discoteca, cinema, centro commerciale!</p>
        </div>
      </Card>

      <Card className="p-3 border-2 border-secondary bg-card">
        <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
          <Motorcycle size={24} weight="fill" />
          MOTORINO
        </h3>
        <div className="space-y-3">
          <ActionButton
            icon={<Motorcycle size={48} />}
            label="Trucca Motorino"
            shortcut="Ctrl+4"
            onClick={handleMotorino}
            disabled={morningChoicePending || phaseActionsLeft <= 0 || soldi < 50 || stanchezza > 80}
            blockedReason={
              morningChoicePending
                ? '🏫 Scegli prima se andare a scuola o marinare!'
                : phaseActionsLeft <= 0
                  ? 'Nessuna azione per questa fascia oraria'
                  : soldi < 50
                    ? 'Servono almeno 50€'
                    : 'Sei troppo stanco per trafficare col motorino!'
            }
            ariaLabel="Trucca il motorino per aumentare molto la coattaggine. Costa 50 euro. Tasto rapido: Ctrl+4"
          />
          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
            <p className="font-semibold mb-1">Effetti:</p>
            <p>• +15 Coattaggine</p>
            <p>• +10 Figosità</p>
            <p className="mt-2 text-destructive font-semibold">Costo: 50€</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
