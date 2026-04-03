import { Friend } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { UserCircle, Brain, Star } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'

interface FriendsPanelProps {
  friends: Friend[]
}

export function FriendsPanel({ friends }: FriendsPanelProps) {
  if (friends.length === 0) {
    return (
      <Card className="p-6 border-2 border-muted bg-card/50">
        <div className="text-center text-muted-foreground">
          <UserCircle size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Nessun amico ancora!</p>
          <p className="text-sm mt-2">Vai in giro e fai nuove conoscenze!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-2 border-accent bg-card">
      <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
        <UserCircle size={28} weight="fill" />
        RUBRICA AMICI ({friends.length})
      </h3>
      <div className="grid gap-3">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="p-4 rounded-lg bg-muted/30 border border-border hover:border-accent transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <UserCircle size={24} weight="fill" className="text-accent" />
                  <span className="font-bold text-lg">{friend.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    Livello {friend.legameLevel}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {friend.specialty && (
                    <div className="flex items-center gap-2">
                      <Star size={16} weight="fill" className="text-accent" />
                      <span>{friend.specialty}</span>
                    </div>
                  )}
                  {friend.intelligenza && friend.intelligenza > 60 && (
                    <div className="flex items-center gap-2">
                      <Brain size={16} weight="fill" className="text-primary" />
                      <span className="text-primary font-semibold">
                        AMICO INTELLIGENTE! Studiare insieme è più efficace!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
