import { Card } from '@/components/ui/card'
import { AdvancePhaseButton } from '@/components/AdvancePhaseButton'
import { 
  Barbell, 
  Sun, 
  Briefcase, 
  ShoppingCart, 
  FilmSlate, 
  MusicNotes, 
  Wrench, 
  Storefront, 
  House, 
  Tree, 
  GraduationCap 
} from '@phosphor-icons/react'

import type { DayType } from '@/lib/types'

interface CityTabProps {
  currentLocation: string
  currentPhase: 'mattina' | 'pomeriggio' | 'sera' | 'notte'
  isSchoolPeriod: boolean
  dayType: DayType
  onTravel: (locationId: string) => void
  nextPhaseLabel: string
  onAdvance: () => void
  soldi: number
}

interface LocationItem {
  id: string
  name: string
  subtitle: string
  icon: React.ReactNode
  phases: Array<'mattina' | 'pomeriggio' | 'sera' | 'notte'>
  specialCondition?: (phase: string, day: string, school: boolean) => boolean
  closedMessage?: string
}

export function CityTab({
  currentLocation,
  currentPhase,
  isSchoolPeriod,
  dayType,
  onTravel,
  nextPhaseLabel,
  onAdvance,
  soldi,
}: CityTabProps) {

  // Elenco dei luoghi di gioco
  const locations: LocationItem[] = [
    {
      id: 'cameretta',
      name: 'Tua Cameretta',
      subtitle: 'Il tuo rifugio per dormire e riposare',
      icon: <House size={28} weight="fill" className="text-muted-foreground" />,
      phases: ['mattina', 'pomeriggio', 'sera', 'notte'],
    },
    {
      id: 'scuola',
      name: 'Liceo Scientifico Copernico',
      subtitle: 'Lezioni, compagni e professori',
      icon: <GraduationCap size={28} weight="fill" className="text-secondary" />,
      phases: ['mattina'],
      specialCondition: (p, day, school) => day === 'feriale' && school,
      closedMessage: 'Chiuso (Aperto solo mattina nei giorni feriali scolastici)',
    },
    {
      id: 'quartiere',
      name: 'Piazza del Quartiere',
      subtitle: 'Panchine, amici e contatti sociali',
      icon: <Tree size={28} weight="fill" className="text-emerald-500" />,
      phases: ['mattina', 'pomeriggio', 'sera', 'notte'],
    },
    {
      id: 'palestra',
      name: 'Palestra Fit & Co.',
      subtitle: 'Pesi e allenamento muscolare',
      icon: <Barbell size={28} weight="fill" className="text-blue-500" />,
      phases: ['pomeriggio', 'sera'],
      closedMessage: 'Chiusa (Aperta Pomeriggio e Sera)',
    },
    {
      id: 'lampada',
      name: 'Centro Abbronzatura Lampada',
      subtitle: 'Lampade UVA e cura dell\'aspetto',
      icon: <Sun size={28} weight="fill" className="text-amber-500" />,
      phases: ['pomeriggio', 'sera'],
      closedMessage: 'Chiuso (Aperto Pomeriggio e Sera)',
    },
    {
      id: 'lavoro',
      name: 'Posto di Lavoro',
      subtitle: 'Fai turni part-time per fare grana',
      icon: <Briefcase size={28} weight="fill" className="text-amber-700" />,
      phases: ['pomeriggio', 'sera', 'notte'],
      closedMessage: 'Chiuso la mattina',
    },
    {
      id: 'shopping',
      name: 'Centro Commerciale (Shopping)',
      subtitle: 'EUR - Negozi di vestiti fichissimi',
      icon: <ShoppingCart size={28} weight="fill" className="text-pink-500" />,
      phases: ['pomeriggio', 'sera'],
      closedMessage: 'Chiuso (Aperto Pomeriggio e Sera)',
    },
    {
      id: 'cinema',
      name: 'Cinema Multisala',
      subtitle: 'Film per staccare dallo stress e far colpo',
      icon: <FilmSlate size={28} weight="fill" className="text-indigo-500" />,
      phases: ['pomeriggio', 'sera', 'notte'],
      closedMessage: 'Chiuso la mattina',
    },
    {
      id: 'disco',
      name: 'Discoteca (Via del Corso)',
      subtitle: 'Pista da ballo e vita notturna',
      icon: <MusicNotes size={28} weight="fill" className="text-purple-500" />,
      phases: ['sera', 'notte'],
      closedMessage: 'Chiusa (Aperta solo di Sera e Notte)',
    },
    {
      id: 'officina',
      name: 'Officina del Tuning',
      subtitle: 'Modifiche e ricambi per sgasare',
      icon: <Wrench size={28} weight="fill" className="text-orange-500" />,
      phases: ['pomeriggio', 'sera'],
      closedMessage: 'Chiusa (Aperta Pomeriggio e Sera)',
    },
    {
      id: 'concessionaria',
      name: 'Gennaro Moto',
      subtitle: 'Acquista e permuta ciclomotori e moto',
      icon: <Storefront size={28} weight="fill" className="text-cyan-500" />,
      phases: ['pomeriggio', 'sera'],
      closedMessage: 'Chiuso (Aperto Pomeriggio e Sera)',
    },
  ]

  // A11y
  const a11ySummaryText = `Mappa città. Seleziona un luogo per spostarti fisicamente lì. Fondi attuali: ${soldi} euro.`

  return (
    <div className="space-y-6">
      <h2 className="sr-only" id="city-heading">
        {a11ySummaryText}
      </h2>

      <Card className="p-6 border-2 border-primary bg-card">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="text-3xl font-black tracking-tight text-primary">ROMA, ITALIA</h3>
          </div>
          <p className="text-sm text-muted-foreground">Seleziona un luogo e clicca spostati qui per viaggiare</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => {
            const isCurrent = currentLocation === loc.id
            
            // Verifica orario
            const phaseOk = loc.phases.includes(currentPhase)
            const conditionOk = loc.specialCondition 
              ? loc.specialCondition(currentPhase, dayType, isSchoolPeriod)
              : true
            const isOpen = phaseOk && conditionOk

            // A11y Label
            const buttonLabel = isCurrent 
              ? `Sei già qui in ${loc.name}` 
              : !isOpen 
              ? `${loc.name} è chiuso` 
              : `Spostati in ${loc.name}. ${loc.subtitle}. Fondi disponibili: ${soldi} euro`;

            return (
              <Card 
                key={loc.id} 
                className={`p-4 border flex items-center justify-between transition-all duration-200 ${
                  isCurrent 
                    ? 'border-2 border-primary bg-primary/5' 
                    : !isOpen 
                    ? 'opacity-40 bg-muted/20 border-border' 
                    : 'border-border bg-card/50 hover:bg-card/90 hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-3 pr-2">
                  <div className="p-2 bg-muted/40 rounded">
                    {loc.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      {loc.name}
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-bold">
                          SEI QUI
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                      {isOpen ? loc.subtitle : loc.closedMessage || 'Chiuso in questa fascia oraria'}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isCurrent ? (
                    <span 
                      className="text-xs text-primary font-bold px-3 py-1.5 rounded bg-primary/10 border border-primary/20"
                      aria-label={buttonLabel}
                    >
                      🟢 Sei qui
                    </span>
                  ) : !isOpen ? (
                    <span className="text-xs text-muted-foreground px-3 py-1.5 rounded bg-muted/40 font-semibold">
                      Chiuso
                    </span>
                  ) : (
                    <button
                      onClick={() => onTravel(loc.id)}
                      className="text-xs bg-foreground text-background font-bold px-3 py-1.5 rounded hover:bg-foreground/80 focus-visible:ring-2 focus-visible:ring-ring transition-all"
                      aria-label={buttonLabel}
                    >
                      🚶 Spostati
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </Card>

      <div className="mt-6 pt-4 border-t border-border flex justify-end">
        <AdvancePhaseButton
          disabled={false}
          label={nextPhaseLabel}
          onAdvance={onAdvance}
        />
      </div>
    </div>
  )
}
