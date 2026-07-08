import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/ActionButton'
import { SchoolTab } from '@/components/tabs/SchoolTab'
import { 
  Barbell, 
  Sun, 
  Briefcase, 
  ShoppingCart, 
  FilmSlate, 
  MusicNotes, 
  Wrench, 
  Storefront, 
  Chats, 
  Bed, 
  House, 
  Tree, 
  GraduationCap 
} from '@phosphor-icons/react'
import type { GameStats, NarrativePlayerGender } from '@/lib/types'
import { ECONOMY } from '@/lib/game-balance.constants'
import { renderPlayerForm } from '@/lib/gender-utils'
import type { ComponentProps } from 'react'

interface LocationTabProps {
  currentLocation: string
  stats: GameStats
  playerGender: NarrativePlayerGender
  actionsRemaining: number
  currentPhase: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
  schoolTabProps: ComponentProps<typeof SchoolTab>
  onDisco: () => void
  onCinema: () => void
  onShopping: () => void
  onPalestra: () => void
  onLampada: () => void
  onLavoro: () => void
  onConcessionario: () => void
  onMeccanico: () => void
  onRiposa: () => void
  onDormi: () => void
  morningChoicePending?: boolean
  onGoToSchool?: () => void
  onMarinaSchool?: () => void
}

export function LocationTab({
  currentLocation,
  stats,
  playerGender,
  actionsRemaining,
  currentPhase,
  schoolTabProps,
  onDisco,
  onCinema,
  onShopping,
  onPalestra,
  onLampada,
  onLavoro,
  onConcessionario,
  onMeccanico,
  onRiposa,
  onDormi,
  morningChoicePending = false,
  onGoToSchool,
  onMarinaSchool,
}: LocationTabProps) {

  const hasNoActions = actionsRemaining <= 0

  // Helper per calcolare lo stato dei bottoni d'azione
  const getActionState = (extraCheck?: { condition: boolean; reason: string }) => {
    if (hasNoActions) {
      return { disabled: true, blockedReason: 'Nessuna azione rimasta per questa fascia oraria. Avanza di fase!' }
    }
    if (extraCheck?.condition) {
      return { disabled: true, blockedReason: extraCheck.reason }
    }
    return { disabled: false, blockedReason: undefined }
  }

  // A11y: Pronuncia per screen reader all'apertura del tab
  const getLocationName = (loc: string) => {
    switch (loc) {
      case 'cameretta': return 'Tua Cameretta'
      case 'scuola': return 'Liceo Copernico'
      case 'quartiere': return 'Quartiere'
      case 'palestra': return 'Palestra Fit & Co.'
      case 'lavoro': return 'Luogo di Lavoro'
      case 'shopping': return 'Centro Commerciale'
      case 'cinema': return 'Cinema Multisala'
      case 'disco': return 'Discoteca'
      case 'officina': return 'Officina Clandestina'
      case 'concessionaria': return 'Gennaro Moto'
      default: return 'Strada'
    }
  }

  const locName = getLocationName(currentLocation)
  const a11yHeading = `Luogo attuale: ${locName}. Fondi attuali: ${stats.soldi} euro. Azioni rimaste: ${actionsRemaining}.`

  // 0. SCELTA MATTUTINA PENDENTE
  if (morningChoicePending) {
    return (
      <div className="space-y-6">
        <h2 className="sr-only">{a11yHeading}</h2>
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
      </div>
    )
  }

  // 1. SCUOLA: Renderizza direttamente il SchoolTab per preservare condotta, esami e sub-panels
  if (currentLocation === 'scuola') {
    return (
      <div className="space-y-6">
        <h2 className="sr-only">{a11yHeading}</h2>
        <SchoolTab {...schoolTabProps} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="sr-only">{a11yHeading}</h2>

      <Card className="p-6 border-2 border-primary bg-card/60 backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            {currentLocation === 'cameretta' && <House size={36} weight="fill" />}
            {currentLocation === 'quartiere' && <Tree size={36} weight="fill" />}
            {currentLocation === 'palestra' && <Barbell size={36} weight="fill" />}
            {currentLocation === 'lavoro' && <Briefcase size={36} weight="fill" />}
            {currentLocation === 'shopping' && <ShoppingCart size={36} weight="fill" />}
            {currentLocation === 'cinema' && <FilmSlate size={36} weight="fill" />}
            {currentLocation === 'disco' && <MusicNotes size={36} weight="fill" />}
            {currentLocation === 'officina' && <Wrench size={36} weight="fill" />}
            {currentLocation === 'concessionaria' && <Storefront size={36} weight="fill" />}
          </div>
          <div>
            <h3 className="text-2xl font-bold uppercase tracking-tight text-foreground">{locName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {currentLocation === 'cameretta' && 'La tua camera da letto. Il posto perfetto per riposarsi o ricaricare le batterie.'}
              {currentLocation === 'quartiere' && 'La piazza principale del quartiere. Panchine, sbandati e ragazzi del muretto.'}
              {currentLocation === 'palestra' && 'Palestra Fit & Co. L\'odore di gomma e sudore ti carica. Si spinge ferro duro!'}
              {currentLocation === 'lavoro' && 'Qui è dove si fatica. Scegli il turno o cercati un impiego part-time.'}
              {currentLocation === 'shopping' && 'Il mega Centro Commerciale all\'EUR. Negozi, vestiti firmati e tamarri a passeggio.'}
              {currentLocation === 'cinema' && 'Multisala moderno. Il posto perfetto per svagarsi, rilassarsi o fare colpo.'}
              {currentLocation === 'disco' && 'La discoteca più alla moda di Via del Corso. Musica a palla, luci e pista da ballo.'}
              {currentLocation === 'officina' && 'Il garage segreto dell\'Officina Clandestina del tuning. Pezzi speciali e sgasate.'}
              {currentLocation === 'concessionaria' && 'Showroom di Gennaro Moto. Catorci usati, 50ini da corsa e moto di grossa cilindrata.'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-border bg-card">
        <h4 className="text-lg font-bold mb-4 text-accent border-b border-border pb-2">AZIONI DISPONIBILI</h4>
        
        <div className="space-y-4">
          {currentLocation === 'cameretta' && (
            <>
              <ActionButton
                icon={<Bed size={40} />}
                label="Riposati un po'"
                shortcut="Ctrl+8"
                onClick={onRiposa}
                {...getActionState()}
                ariaLabel={`Riposati nella tua stanza. Riduce molto la stanchezza e lo stress. Costo: gratis. Tasto rapido: Ctrl+8`}
                variant="default"
              />
              {currentPhase === 'notte' && (
                <ActionButton
                  icon={<Bed size={40} weight="fill" />}
                  label="Dormi (Cambia Giorno)"
                  shortcut="Alt+Enter"
                  onClick={onDormi}
                  {...getActionState()}
                  ariaLabel="Dormi e vai al giorno successivo. Ripristina salute, energia e azzera la stanchezza. Tasto rapido: Alt+Invio"
                  variant="default"
                />
              )}
            </>
          )}

          {currentLocation === 'palestra' && (
            <ActionButton
              icon={<Barbell size={40} />}
              label="Pompaci Ferro (Allenati)"
              shortcut="Ctrl+1"
              onClick={onPalestra}
              {...getActionState(
                stats.soldi < ECONOMY.PALESTRA_COSTO
                  ? { condition: true, reason: `Servono almeno ${ECONOMY.PALESTRA_COSTO}€` }
                  : stats.stanchezza > 80
                  ? { condition: true, reason: `Sei troppo ${renderPlayerForm(playerGender, 'stanco', 'stanca')} per allenarti!` }
                  : undefined
              )}
              ariaLabel={`Allenati sollevando pesi. Costo: ${ECONOMY.PALESTRA_COSTO} euro (Fondi disponibili: ${stats.soldi} euro). Aumenta Muscoli e Figosità, aumenta la stanchezza. Tasto rapido: Ctrl+1`}
              variant="default"
            />
          )}

          {currentLocation === 'lampada' && (
            <ActionButton
              icon={<Sun size={40} />}
              label="Fatti una Lampada Solare"
              shortcut="Ctrl+2"
              onClick={onLampada}
              {...getActionState({ condition: stats.soldi < ECONOMY.LAMPADA_COSTO, reason: `Servono almeno ${ECONOMY.LAMPADA_COSTO}€` })}
              ariaLabel={`Fai una lampada abbronzante. Costo: ${ECONOMY.LAMPADA_COSTO} euro (Fondi disponibili: ${stats.soldi} euro). Aumenta la Figosità e la Coattaggine. Tasto rapido: Ctrl+2`}
              variant="default"
            />
          )}

          {currentLocation === 'lavoro' && (
            <ActionButton
              icon={<Briefcase size={40} />}
              label="Turno di Lavoro (Selettore)"
              shortcut="Ctrl+3"
              onClick={onLavoro}
              {...getActionState()}
              ariaLabel="Apri il menu dei turni di lavoro part-time disponibili per guadagnare grana. Tasto rapido: Ctrl+3"
              variant="default"
            />
          )}

          {currentLocation === 'shopping' && (
            <ActionButton
              icon={<ShoppingCart size={40} />}
              label="Compra Vestiti Fichissimi"
              shortcut="Ctrl+S"
              onClick={onShopping}
              {...getActionState({ condition: stats.soldi < ECONOMY.SHOPPING_COSTO, reason: `Servono almeno ${ECONOMY.SHOPPING_COSTO}€` })}
              ariaLabel={`Fai shopping al centro commerciale. Costo: ${ECONOMY.SHOPPING_COSTO} euro (Fondi disponibili: ${stats.soldi} euro). Aumenta notevolmente Figosità, Coattaggine e Carisma. Tasto rapido: Ctrl+S`}
              variant="default"
            />
          )}

          {currentLocation === 'cinema' && (
            <ActionButton
              icon={<FilmSlate size={40} />}
              label="Guarda un Film al Cinema"
              shortcut="Ctrl+C"
              onClick={onCinema}
              {...getActionState({ condition: stats.soldi < ECONOMY.CINEMA_COSTO, reason: `Servono almeno ${ECONOMY.CINEMA_COSTO}€` })}
              ariaLabel={`Guarda uno spettacolo al cinema. Costo: ${ECONOMY.CINEMA_COSTO} euro (Fondi disponibili: ${stats.soldi} euro). Riduce stanchezza e stress, aumenta morale e carisma. Tasto rapido: Ctrl+C`}
              variant="default"
            />
          )}

          {currentLocation === 'disco' && (
            <ActionButton
              icon={<MusicNotes size={40} />}
              label="Entra in Pista (Discoteca)"
              shortcut="Ctrl+D"
              onClick={onDisco}
              {...getActionState(
                stats.soldi < ECONOMY.DISCO_COSTO
                  ? { condition: true, reason: `Servono almeno ${ECONOMY.DISCO_COSTO}€` }
                  : stats.stanchezza > 70
                  ? { condition: true, reason: 'Sei troppo devastato per ballare!' }
                  : undefined
              )}
              ariaLabel={`Vai in discoteca a fare strage in pista. Costo: ${ECONOMY.DISCO_COSTO} euro (Fondi disponibili: ${stats.soldi} euro). Aumenta molto Figosità, Coattaggine e Morale. Tasto rapido: Ctrl+D`}
              variant="default"
            />
          )}

          {currentLocation === 'officina' && (
            <ActionButton
              icon={<Wrench size={40} />}
              label="Apri Garage Officina"
              shortcut="Ctrl+4"
              onClick={onMeccanico}
              {...getActionState()}
              ariaLabel="Apri l'officina del tuning clandestino per montare marmitte, carburatori, kit cilindro, neon, o sgasare. Tasto rapido: Ctrl+4"
              variant="default"
            />
          )}

          {currentLocation === 'concessionaria' && (
            <ActionButton
              icon={<Storefront size={40} />}
              label="Entra da Gennaro Moto"
              onClick={onConcessionario}
              {...getActionState()}
              ariaLabel="Visualizza il listino dei ciclomotori e delle moto in vendita da Gennaro Moto per permute e acquisti."
              variant="default"
            />
          )}

          {currentLocation === 'quartiere' && (
            <div className="text-sm text-muted-foreground p-4 bg-muted/20 border border-dashed border-border rounded text-center">
              Sei nella piazza del quartiere. Le azioni sociali (Rimorchiare, Telefonare) si trovano direttamente nella scheda <strong>👤 Personaggio</strong>!
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
