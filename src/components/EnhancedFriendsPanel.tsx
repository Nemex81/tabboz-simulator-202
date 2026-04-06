import React from 'react'
import { User, Users, Barbell, Brain, Lightning, HandFist, HandCoins, XCircle, Crown } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { GameStats, Friend, getRelationshipTier, getRelationshipTierLabel } from '@/lib/types'
import { getAffinita } from '@/lib/relation-system'
import { RelationCard } from '@/components/RelationCard'
import type { Ragazza } from '@/lib/girlfriend-system'
import {
  getFriendTypeDescription,
  FRIEND_ACTIONS,
} from '@/lib/enhanced-friend-system'
import { GirlfriendPanel } from '@/components/GirlfriendPanel'

interface EnhancedFriendsPanelProps {
  friends: Friend[]
  stats: GameStats
  actionsRemaining: number
  onFriendAction: (friendId: string, actionId: string) => void
  onRelationInteraction?: (friendId: string, interactionId: string) => void
  girlfriend: Ragazza | null
  onGirlfriendAction: (action: string) => void
  onGirlfriendBreakup: () => void
}

export const EnhancedFriendsPanel = React.memo(function EnhancedFriendsPanel({
  friends,
  stats,
  actionsRemaining,
  onFriendAction,
  onRelationInteraction,
  girlfriend,
  onGirlfriendAction,
  onGirlfriendBreakup,
}: EnhancedFriendsPanelProps) {
  // FIX-A: early-return rimosso — la sezione fidanzata deve renderizzarsi anche senza amici
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sportivo':
        return <Barbell size={24} weight="fill" />
      case 'secchione':
        return <Brain size={24} weight="fill" />
      case 'coatto':
        return <Lightning size={24} weight="fill" />
      case 'ribelle':
        return <HandFist size={24} weight="fill" />
      default:
        return <User size={24} weight="fill" />
    }
  }
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sportivo':
        return 'text-secondary'
      case 'secchione':
        return 'text-primary'
      case 'coatto':
        return 'text-accent'
      case 'ribelle':
        return 'text-destructive'
      default:
        return 'text-foreground'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* C3-2: GirlfriendPanel embedded — sostituisce la card inline di C2-3 */}
      {girlfriend && (
        <GirlfriendPanel
          girlfriend={girlfriend}
          stats={stats}
          actionsRemaining={actionsRemaining}
          onAction={onGirlfriendAction}
          onBreakup={onGirlfriendBreakup}
        />
      )}

      {/* FIX-A: messaggio amici vuoti inline — non blocca più il rendering della fidanzata */}
      {friends.length === 0 && (
        <Card className="p-6 border-2 border-muted bg-card/50 text-center">
          <Users size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" weight="fill" />
          <p className="text-lg text-muted-foreground">
            Nessun amico ancora. Esci di più (Palestra, Disco, Cinema, Shopping) per conoscere gente!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            💡 Probabilità base 15% + bonus Carisma. Max 4 amici contemporaneamente.
          </p>
        </Card>
      )}

      {friends.map((friend) => {
        const _affinita = getAffinita(friend)
        const tier = getRelationshipTier(_affinita, friend.bondType)
        const isBestFriend = tier === 'migliore_amico'
        const isRomantic = tier === 'trombamica' || tier === 'fidanzata'
        const affinitaColor = _affinita < 30 
          ? 'bg-destructive'
          : _affinita < 60
          ? 'bg-accent'
          : 'bg-primary'
        
        const availableActions = FRIEND_ACTIONS.filter(action => {
          if (action.compatibleTypes && !action.compatibleTypes.includes(friend.type)) {
            return false
          }
          const check = action.requirements(stats, friend)
          return check.canDo || action.cost === 0
        })
        
        return (
          <Card key={friend.id} className="p-6 border-2 border-primary bg-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-3 rounded-lg bg-muted ${getTypeColor(friend.type)}`}>
                  {getTypeIcon(friend.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-primary">
                      {friend.name}
                    </h3>
                    {isBestFriend && (
                      <Badge className="bg-accent text-accent-foreground">
                        <Crown size={16} className="mr-1" weight="fill" />
                        MIGLIORE AMICO
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getFriendTypeDescription(friend.type)}
                  </p>
                  {friend.intelligenza && friend.intelligenza > 60 && (
                    <Badge className="mt-2 bg-primary/20 text-primary border border-primary">
                      <Brain size={16} className="mr-1" weight="fill" />
                      BONUS STUDIO +50%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground uppercase font-semibold">
                  Affinità
                </span>
                <span className={`text-2xl font-bold ${
                  _affinita < 30 ? 'text-destructive' :
                  _affinita < 60 ? 'text-accent' : 'text-primary'
                }`}>
                  {_affinita}
                </span>
              </div>
              <Progress 
                value={_affinita} 
                className="h-2"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium">
                  {getRelationshipTierLabel(tier)}
                </span>
                {tier === 'migliore_amico' && (
                  <span className="ml-2 text-xs text-primary">— Copertura genitori sbloccata!</span>
                )}
                {isRomantic && (
                  <Badge className={`ml-2 ${
                    tier === 'fidanzata'
                      ? 'bg-red-500 text-white'
                      : 'bg-pink-400 text-white'
                  }`}>
                    {getRelationshipTierLabel(tier)}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-bold text-muted-foreground uppercase mb-3">
                Azioni disponibili:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableActions.map((action) => {
                  const check = action.requirements(stats, friend)
                  const isDisabled = actionsRemaining < action.cost || !check.canDo
                  
                  return (
                    <Button
                      key={action.id}
                      onClick={() => onFriendAction(friend.id, action.id)}
                      disabled={isDisabled}
                      variant={action.id === 'litiga' ? 'destructive' : 'secondary'}
                      className="justify-start h-auto py-3"
                    >
                      <div className="flex-1 text-left">
                        <div className="font-bold text-sm">{action.name}</div>
                        <div className="text-xs opacity-80 mt-1">{action.effects}</div>
                        {!check.canDo && check.reason && (
                          <div className="text-xs text-destructive mt-1">
                            ⚠️ {check.reason}
                          </div>
                        )}
                      </div>
                      {action.cost > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {action.cost} azione
                        </Badge>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
            
            {/* ── Interazioni relazionali (sistema 4-assi) — usa RelationCard ── */}
            {onRelationInteraction && friend.rel && (
              <div className="mt-4 pt-4 border-t border-border">
                <RelationCard
                  friend={friend}
                  onInteraction={onRelationInteraction}
                  actionsRemaining={actionsRemaining}
                  maxInteractions={6}
                />
              </div>
            )}

            {_affinita <= 0 && (
              <div className="mt-4 p-4 bg-destructive/20 border border-destructive rounded text-center">
                <XCircle size={32} className="mx-auto mb-2 text-destructive" weight="fill" />
                <p className="text-destructive font-bold">
                  L'amicizia con {friend.name} è FINITA! Non potete più interagire.
                </p>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
})
