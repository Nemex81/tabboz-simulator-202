// src/components/FriendshipsPanel.tsx
// Wrapper con 3 tab (Tutti / Scuola / Extra) — il filtro vive qui, EnhancedFriendsPanel è passivo.

/**
 * FriendshipsPanel: gestione delle amicizie filtrate per origine.
 */

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Friend, GameStats, PlayerProfile } from '@/lib/types'
import type { ActivePartner } from '@/lib/girlfriend-system'
import { EnhancedFriendsPanel } from '@/components/EnhancedFriendsPanel'

interface FriendshipsPanelProps {
  playerProfile?: PlayerProfile | null
  friends: Friend[]
  stats: GameStats
  interactionsRemaining: number
  onFriendAction: (friendId: string, actionId: string) => void
  onRelationInteraction?: (friendId: string, interactionId: string) => void
  activePartners: ActivePartner[]
  onGirlfriendAction: (action: string, partnerKey?: string) => void
  onGirlfriendBreakup: (partnerKey?: string) => void
}

export const FriendshipsPanel = React.memo(function FriendshipsPanel(props: FriendshipsPanelProps) {
  const { friends, ...rest } = props

  // Il filtro vive qui — EnhancedFriendsPanel riceve solo l'array già filtrato
  const schoolFriends = friends.filter(f =>
    f.originType === 'compagno_classe' || f.originType === 'compagno_istituto'
  )
  const reteFriends = friends.filter(f => f.metAt === 'online')
  const extraFriends = friends.filter(f => f.originType === 'extrascolastico' && f.metAt !== 'online')

  return (
    <Tabs defaultValue="tutti" className="w-full">
      <TabsList className="w-full grid grid-cols-4">
        <TabsTrigger value="tutti">
          Tutti ({friends.length})
        </TabsTrigger>
        <TabsTrigger value="scuola">
          Scuola ({schoolFriends.length})
        </TabsTrigger>
        <TabsTrigger value="extra">
          Extra ({extraFriends.length})
        </TabsTrigger>
        <TabsTrigger value="rete">
          Rete ({reteFriends.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tutti">
        <EnhancedFriendsPanel friends={friends} {...rest} />
      </TabsContent>

      <TabsContent value="scuola">
        <EnhancedFriendsPanel friends={schoolFriends} {...rest} />
      </TabsContent>

      <TabsContent value="extra">
        <EnhancedFriendsPanel friends={extraFriends} {...rest} />
      </TabsContent>

      <TabsContent value="rete">
        <EnhancedFriendsPanel friends={reteFriends} {...rest} />
      </TabsContent>
    </Tabs>
  )
})
