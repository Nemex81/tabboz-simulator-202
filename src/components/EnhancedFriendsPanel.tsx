import React from 'react'
import { User, Users, Barbell, Brain, Lightning, Fist, HandCoins, XCircle, Crown } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { GameStats, Friend } from '@/lib/types'
import {
  getFriendTypeDescription,
  FRIEND_ACTIONS,
  checkBestFriend
} from '@/lib/enhanced-friend-system'

interface EnhancedFriendsPanelProps {
  friends: Friend[]
  stats: GameStats
  actionsRemaining: number
  onFriendAction: (friendId: string, actionId: string) => void
}

export const EnhancedFriendsPanel = React.memo(function EnhancedFriendsPanel({
  friends,
  stats,
  actionsRemaining,
  onFriendAction
}: EnhancedFriendsPanelProps) {
  if (friends.length === 0) {
    return (
      <Card className="p-6 border-2 border-muted bg-card/50 text-center">
        <Users size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" weight="fill" />
        <p className="text-lg text-muted-foreground">
          Nessun amico ancora. Esci di più (Palestra, Disco, Cinema, Shopping) per conoscere gente!
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          💡 Probabilità base 15% + bonus Carisma. Max 4 amici contemporaneamente.
        </p>
      </Card>
    )
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sportivo':
        return <Barbell size={24} weight="fill" />
      case 'secchione':
        return <Brain size={24} weight="fill" />
      case 'coatto':
        return <Lightning size={24} weight="fill" />
      case 'ribelle':
        return <Fist size={24} weight="fill" />
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
      {friends.map((friend) => {
        const isBestFriend = checkBestFriend(friend.affinita)
        const affinitaColor = friend.affinita < 30 
          ? 'bg-destructive'
          : friend.affinita < 60
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
                  friend.affinita < 30 ? 'text-destructive' :
                  friend.affinita < 60 ? 'text-accent' : 'text-primary'
                }`}>
                  {friend.affinita}
                </span>
              </div>
              <Progress 
                value={friend.affinita} 
                className="h-2"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                {friend.affinita <= 0 && '💔 Amicizia finita'}
                {friend.affinita > 0 && friend.affinita < 30 && '😐 Conoscente'}
                {friend.affinita >= 30 && friend.affinita < 60 && '😊 Amico'}
                {friend.affinita >= 60 && friend.affinita < 100 && '😎 Amico stretto'}
                {friend.affinita >= 100 && '👑 Migliore amico - Copertura genitori sbloccata!'}
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
            
            {friend.affinita <= 0 && (
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
