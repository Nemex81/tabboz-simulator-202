// src/components/RelationsPanel.tsx
// Wrapper con 3 tab (Tutti / Scuola / Extra) — il filtro vive qui, EnhancedFriendsPanel è passivo.

import React, { lazy, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Friend, GameStats } from '@/lib/types'
import type { Ragazza } from '@/lib/girlfriend-system'

const EnhancedFriendsPanel = lazy(() =>
  import('@/components/EnhancedFriendsPanel').then(m => ({ default: m.EnhancedFriendsPanel }))
)

interface RelationsPanelProps {
  friends: Friend[]
  stats: GameStats
  actionsRemaining: number
  onFriendAction: (friendId: string, actionId: string) => void
  onRelationInteraction?: (friendId: string, interactionId: string) => void
  girlfriend: Ragazza | null
  onGirlfriendAction: (action: string) => void
  onGirlfriendBreakup: () => void
}

export const RelationsPanel = React.memo(function RelationsPanel(props: RelationsPanelProps) {
  const { friends, ...rest } = props

  // Il filtro vive qui — EnhancedFriendsPanel riceve solo l'array già filtrato
  const schoolFriends = friends.filter(f =>
    f.originType === 'compagno_classe' || f.originType === 'compagno_istituto'
  )
  const extraFriends = friends.filter(f => f.originType === 'extrascolastico')

  return (
    <Tabs defaultValue="tutti" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="tutti">
          Tutti ({friends.length})
        </TabsTrigger>
        <TabsTrigger value="scuola">
          Scuola ({schoolFriends.length})
        </TabsTrigger>
        <TabsTrigger value="extra">
          Extra ({extraFriends.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tutti">
        <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Caricamento...</div>}>
          <EnhancedFriendsPanel friends={friends} {...rest} />
        </Suspense>
      </TabsContent>

      <TabsContent value="scuola">
        <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Caricamento...</div>}>
          <EnhancedFriendsPanel friends={schoolFriends} {...rest} />
        </Suspense>
      </TabsContent>

      <TabsContent value="extra">
        <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Caricamento...</div>}>
          <EnhancedFriendsPanel friends={extraFriends} {...rest} />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
})
