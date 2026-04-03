import { useState } from 'react'
import { Heart, ChatCircle, FilmSlate, Motorcycle, BookOpen, Sparkle, X } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { GameStats } from '@/lib/types'
import { 
  Ragazza, 
  getAspettoDescription, 
  getPersonalitaDescription,
  getWhatSheLikes,
  calculateMissingStats
} from '@/lib/girlfriend-system'

interface GirlfriendPanelProps {
  girlfriend: Ragazza | null
  stats: GameStats
  actionsRemaining: number
  onAction: (action: string) => void
  onBreakup: () => void
}

export function GirlfriendPanel({
  girlfriend,
  stats,
  actionsRemaining,
  onAction,
  onBreakup
}: GirlfriendPanelProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  
  if (!girlfriend) {
    return (
      <Card className="p-6 border-2 border-muted bg-card/50 text-center">
        <Heart size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" weight="fill" />
        <p className="text-lg text-muted-foreground">
          Nessuna ragazza al momento. Esci di più per conoscere qualcuna!
        </p>
      </Card>
    )
  }
  
  const interesseColor = girlfriend.interessePerTe < 30 
    ? 'bg-destructive'
    : girlfriend.interessePerTe < 60
    ? 'bg-accent'
    : 'bg-primary'
  
  const likes = getWhatSheLikes(girlfriend.personalita, girlfriend.statPreferita)
  const missingStats = calculateMissingStats(stats, girlfriend)
  
  const canDichiararti = girlfriend.interessePerTe >= 70
  const canInvitareCinema = girlfriend.interessePerTe >= 30
  const canPortareMotorino = girlfriend.interessePerTe >= 40 && stats.coattaggine >= 50
  
  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-accent bg-gradient-to-br from-accent/10 to-primary/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Heart size={32} weight="fill" className="text-accent" />
              <div>
                <h3 className="text-2xl font-bold text-accent">
                  {girlfriend.nome} {girlfriend.cognome}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {girlfriend.eta} anni • Classe {girlfriend.classe} • {girlfriend.scuola}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase font-semibold mb-1">Aspetto</p>
                <p className="text-foreground">{getAspettoDescription(girlfriend.aspetto)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase font-semibold mb-1">Capelli</p>
                <p className="text-foreground">{girlfriend.coloreCapelli}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground uppercase font-semibold mb-1">Personalità</p>
                <p className="text-foreground">{getPersonalitaDescription(girlfriend.personalita)}</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onBreakup}
            variant="outline"
            size="sm"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <X size={20} className="mr-1" />
            Lascia
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground uppercase font-semibold">
              Interesse per te
            </span>
            <span className={`text-2xl font-bold ${
              girlfriend.interessePerTe < 30 ? 'text-destructive' :
              girlfriend.interessePerTe < 60 ? 'text-accent' : 'text-primary'
            }`}>
              {girlfriend.interessePerTe}%
            </span>
          </div>
          <Progress 
            value={girlfriend.interessePerTe} 
            className="h-3"
          />
          <div className="mt-2 text-xs text-muted-foreground">
            {girlfriend.interessePerTe < 30 && '❄️ Fredda - Ti conosce a malapena'}
            {girlfriend.interessePerTe >= 30 && girlfriend.interessePerTe < 60 && '😊 Interessata - Inizia a piacerti'}
            {girlfriend.interessePerTe >= 60 && girlfriend.interessePerTe < 70 && '😍 Molto interessata - Ci sei quasi!'}
            {girlfriend.interessePerTe >= 70 && '💕 Innamorata - Puoi dichiararti!'}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-lg font-bold text-accent mb-3">🎯 Cosa le piace:</h4>
          <ul className="space-y-2">
            {likes.map((like, index) => (
              <li key={index} className="text-sm text-foreground flex items-center gap-2">
                <Sparkle size={16} weight="fill" className="text-accent flex-shrink-0" />
                {like}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-lg font-bold text-accent mb-3">🎨 Hobby:</h4>
          <div className="flex flex-wrap gap-2">
            {girlfriend.hobby.map((hobby, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-muted rounded-full text-sm font-semibold"
              >
                {hobby.icon} {hobby.name}
              </span>
            ))}
          </div>
        </div>
        
        {missingStats.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-lg font-bold text-destructive mb-3">⚠️ Soglia per uscire insieme:</h4>
            <ul className="space-y-2">
              {missingStats.map((missing, index) => (
                <li key={index} className="text-sm text-destructive">
                  Ti servono ancora <strong>+{missing.missing}</strong> punti {missing.stat}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
      
      <Card className="p-6 border-2 border-primary bg-card">
        <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Heart size={28} weight="fill" />
          AZIONI CON {girlfriend.nome.toUpperCase()}
        </h3>
        
        <div className="space-y-3">
          <Button
            onClick={() => onAction('messaggio')}
            disabled={actionsRemaining === 0}
            className="w-full justify-start"
            variant="secondary"
          >
            <ChatCircle size={24} className="mr-3" weight="fill" />
            <div className="flex-1 text-left">
              <div className="font-bold">Mandagli un messaggio</div>
              <div className="text-xs opacity-80">+5 Interesse • Gratis • Sempre disponibile</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onAction('cinema')}
            disabled={actionsRemaining === 0 || !canInvitareCinema || stats.soldi < 40}
            className="w-full justify-start"
            variant="default"
          >
            <FilmSlate size={24} className="mr-3" weight="fill" />
            <div className="flex-1 text-left">
              <div className="font-bold">Invitala al cinema</div>
              <div className="text-xs opacity-80">
                +15 Interesse, +5 Figosità • Costa 40€ • Interesse min: 30
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => onAction('motorino')}
            disabled={actionsRemaining === 0 || !canPortareMotorino || stats.soldi < 20}
            className="w-full justify-start"
            variant="default"
          >
            <Motorcycle size={24} className="mr-3" weight="fill" />
            <div className="flex-1 text-left">
              <div className="font-bold">Portala in giro col motorino</div>
              <div className="text-xs opacity-80">
                +20 Interesse • Costa 20€ • Interesse min: 40, Coattaggine min: 50
              </div>
            </div>
          </Button>
          
          {girlfriend.personalita === 'secchiona' && (
            <Button
              onClick={() => onAction('compiti')}
              disabled={actionsRemaining === 0 || stats.intelligenza < 40}
              className="w-full justify-start"
              variant="secondary"
            >
              <BookOpen size={24} className="mr-3" weight="fill" />
              <div className="flex-1 text-left">
                <div className="font-bold">Falle i compiti</div>
                <div className="text-xs opacity-80">
                  +10 Interesse, +0.3 Media tua, -10 Coattaggine • Serve INT ≥ 40
                </div>
              </div>
            </Button>
          )}
          
          {canDichiararti && (
            <Button
              onClick={() => onAction('dichiarati')}
              disabled={actionsRemaining === 0}
              className="w-full justify-start bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Heart size={24} className="mr-3" weight="fill" />
              <div className="flex-1 text-left">
                <div className="font-bold">💕 DICHIARATI!</div>
                <div className="text-xs opacity-80">
                  Diventa la tua fidanzata ufficiale! Interesse min: 70
                </div>
              </div>
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
