import { useState } from 'react'
import { 
  Heart, 
  ChatCircle, 
  FilmSlate, 
  Motorcycle, 
  BookOpen, 
  Sparkle, 
  X, 
  Gift,
  ChartLine,
  Calendar,
  Smiley,
  ShieldCheck,
  WarningCircle
} from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GameStats } from '@/lib/types'
import { 
  Ragazza, 
  getAspettoDescription, 
  getPersonalitaDescription,
  getWhatSheLikes,
  calculateMissingStats,
  calculateRelationshipHealth
} from '@/lib/girlfriend-system'

interface GirlfriendPanelProps {
  girlfriend: Ragazza          // C3-1: non più nullable — il guard è nel padre
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
  // C3-1: guard null rimosso — il componente è sempre renderizzato dentro {girlfriend && ...}
  const interesseColor = girlfriend.interessePerTe < 30 
    ? 'bg-destructive'
    : girlfriend.interessePerTe < 60
    ? 'bg-accent'
    : 'bg-primary'
  
  const likes = getWhatSheLikes(girlfriend.personalita, girlfriend.statPreferita)
  const missingStats = calculateMissingStats(stats, girlfriend)
  const relationshipHealth = calculateRelationshipHealth(girlfriend)
  
  const canDichiararti = girlfriend.interessePerTe >= 70 && girlfriend.relationshipStatus !== 'fidanzata'
  const canInvitareCinema = girlfriend.interessePerTe >= 30
  const canPortareMotorino = girlfriend.interessePerTe >= 40 && stats.coattaggine >= 50
  const isFidanzata = girlfriend.relationshipStatus === 'fidanzata'
  
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
                  {isFidanzata && <span className="ml-2">💕</span>}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {girlfriend.eta} anni • Classe {girlfriend.classe} • {girlfriend.scuola}
                </p>
                <Badge className="mt-1 bg-accent">
                  {girlfriend.relationshipStatus === 'fidanzata' ? '💕 Fidanzata' :
                   girlfriend.relationshipStatus === 'interessata' ? '😍 Interessata' :
                   girlfriend.relationshipStatus === 'amica' ? '😊 Amica' :
                   girlfriend.relationshipStatus === 'conoscente' ? '👋 Conoscente' : '❓ Sconosciuta'}
                </Badge>
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
        
        {isFidanzata && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-lg font-bold text-accent mb-3 flex items-center gap-2">
              <ChartLine size={24} weight="fill" />
              Salute della Relazione
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Stato:</span>
                  <Badge className={
                    relationshipHealth.health >= 80 ? 'bg-primary' :
                    relationshipHealth.health >= 60 ? 'bg-accent' :
                    relationshipHealth.health >= 40 ? 'bg-secondary' : 'bg-destructive'
                  }>
                    {relationshipHealth.status}
                  </Badge>
                </div>
                <Progress value={relationshipHealth.health} className="h-2" />
              </div>
              
              {relationshipHealth.warnings.length > 0 && (
                <div className="space-y-1">
                  {relationshipHealth.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-destructive">
                      <WarningCircle size={16} weight="fill" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center p-2 bg-muted/30 rounded">
                  <Smiley size={20} className="mx-auto mb-1 text-accent" weight="fill" />
                  <div className="text-xs text-muted-foreground">Felicità</div>
                  <div className="text-lg font-bold">{girlfriend.stats.happinessLevel}</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <ShieldCheck size={20} className="mx-auto mb-1 text-primary" weight="fill" />
                  <div className="text-xs text-muted-foreground">Fiducia</div>
                  <div className="text-lg font-bold">{girlfriend.stats.trustLevel}</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <Heart size={20} className="mx-auto mb-1 text-destructive" weight="fill" />
                  <div className="text-xs text-muted-foreground">Gelosia</div>
                  <div className="text-lg font-bold">{girlfriend.stats.jealousyLevel}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="actions">Azioni</TabsTrigger>
          <TabsTrigger value="stats">Statistiche</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4 mt-4">
          <Card className="p-6 border-2 border-accent bg-card">
            <h4 className="text-lg font-bold text-accent mb-3">🎯 Cosa le piace:</h4>
            <ul className="space-y-2">
              {likes.map((like, index) => (
                <li key={index} className="text-sm text-foreground flex items-center gap-2">
                  <Sparkle size={16} weight="fill" className="text-accent flex-shrink-0" />
                  {like}
                </li>
              ))}
            </ul>
          </Card>
          
          <Card className="p-6 border-2 border-accent bg-card">
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
          </Card>
          
          {missingStats.length > 0 && !isFidanzata && (
            <Card className="p-6 border-2 border-destructive bg-card">
              <h4 className="text-lg font-bold text-destructive mb-3">⚠️ Soglia per uscire insieme:</h4>
              <ul className="space-y-2">
                {missingStats.map((missing, index) => (
                  <li key={index} className="text-sm text-destructive">
                    Ti servono ancora <strong>+{missing.missing}</strong> punti {missing.stat}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="actions" className="space-y-3 mt-4">
          <Card className="p-6 border-2 border-primary bg-card">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Heart size={28} weight="fill" />
              AZIONI CON {girlfriend.nome.toUpperCase()}
            </h3>
            
            <div className="space-y-3">
              {/* FIX-B: messaggio è gratuito (non consuma azione) — non va mai disabilitato per azioni esaurite */}
              <Button
                onClick={() => onAction('messaggio')}
                disabled={false}
                className="w-full justify-start"
                variant="secondary"
              >
                <ChatCircle size={24} className="mr-3" weight="fill" />
                <div className="flex-1 text-left">
                  <div className="font-bold">Mandagli un messaggio</div>
                  <div className="text-xs opacity-80">+5 Interesse, +2 Felicità • Gratis</div>
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
                    +15 Interesse, +5 Figosità, +10 Felicità • 40€ • Int. min: 30
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
                    +20 Interesse, +5 Coatt., +15 Felic., +5 Fiducia • 20€ • Int: 40, Coatt: 50
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
                      +10 Interesse, +10 Fiducia, +0.3 Media, -10 Coattaggine • INT ≥ 40
                    </div>
                  </div>
                </Button>
              )}
              
              <Button
                onClick={() => onAction('regalo')}
                disabled={actionsRemaining === 0 || stats.soldi < 60}
                className="w-full justify-start bg-accent text-accent-foreground"
              >
                <Gift size={24} className="mr-3" weight="fill" />
                <div className="flex-1 text-left">
                  <div className="font-bold">Falle un regalo</div>
                  <div className="text-xs opacity-80">
                    +15-20 Interesse, +20 Felicità • Costa 60€
                  </div>
                </div>
              </Button>
              
              {canDichiararti && (
                <Button
                  onClick={() => onAction('dichiarati')}
                  disabled={actionsRemaining === 0}
                  className="w-full justify-start bg-primary text-primary-foreground animate-pulse"
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
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4 mt-4">
          <Card className="p-6 border-2 border-accent bg-card">
            <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
              <Calendar size={28} weight="fill" />
              STATISTICHE RELAZIONE
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded">
                <div className="text-xs text-muted-foreground uppercase">Uscite Totali</div>
                <div className="text-2xl font-bold text-primary">{girlfriend.stats.totalDates}</div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded">
                <div className="text-xs text-muted-foreground uppercase">Messaggi Scambiati</div>
                <div className="text-2xl font-bold text-accent">{girlfriend.stats.messagesExchanged}</div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded">
                <div className="text-xs text-muted-foreground uppercase">Regali Fatti</div>
                <div className="text-2xl font-bold text-secondary">{girlfriend.stats.giftsGiven}</div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded">
                <div className="text-xs text-muted-foreground uppercase">Litigi</div>
                <div className="text-2xl font-bold text-destructive">{girlfriend.stats.fightsHad}</div>
              </div>
            </div>
            
            {isFidanzata && girlfriend.stats.relationshipStartDate && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  💕 Insieme dal: <span className="font-bold text-accent">{girlfriend.stats.relationshipStartDate}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Giorni insieme: <span className="font-bold text-primary">{girlfriend.stats.daysTogether}</span>
                </div>
              </div>
            )}
          </Card>
          
          {girlfriend.stats.dateActivities.length > 0 && (
            <Card className="p-6 border-2 border-accent bg-card">
              <h4 className="text-lg font-bold text-accent mb-3">📅 Cronologia Appuntamenti</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {girlfriend.stats.dateActivities.slice().reverse().map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="p-3 bg-muted/30 rounded flex items-start justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm">{activity.activity}</div>
                      <div className="text-xs text-muted-foreground">{activity.notes}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{activity.date}</div>
                      <div className="text-xs text-accent">+{activity.interesseGain} int.</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
