// src/components/RelationCard.tsx
// Card autonoma per visualizzare un NPC con le 4 barre relazionali.
// Mostra le interazioni disponibili filtrate e le statistiche del tier V2.

import React from 'react'
import { User, Barbell, Brain, Lightning, HandFist } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Friend } from '@/lib/types'
import {
  getRelationTierV2,
  getRelationTierV2Label,
  checkInteractionAvailable,
  INTERACTION_CATALOG,
  InteractionDef,
} from '@/lib/relation-system'

interface RelationCardProps {
  friend: Friend
  onInteraction: (friendId: string, interactionId: string) => void
  /** Quante azioni rimangono in questa fascia — disabilita bottoni se 0 */
  actionsRemaining?: number
  /** Numero massimo di interazioni da mostrare (default 8) */
  maxInteractions?: number
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  sportivo: <Barbell size={20} weight="fill" />,
  secchione: <Brain size={20} weight="fill" />,
  coatto:  <Lightning size={20} weight="fill" />,
  ribelle: <HandFist size={20} weight="fill" />,
}
const TYPE_COLOR: Record<string, string> = {
  sportivo: 'text-secondary',
  secchione: 'text-primary',
  coatto:  'text-accent',
  ribelle: 'text-destructive',
  generico: 'text-foreground',
}

// Ordine categoria desiderata per UI
const CATEGORY_ORDER = [0, 1, 2, 3, 4, 5, 6, 7]

/** Raggruppa le interazioni disponibili per categoria */
function getAvailableByCategory(
  rel: NonNullable<Friend['rel']>,
  max: number
): InteractionDef[] {
  const all = Object.values(INTERACTION_CATALOG)
  const available: InteractionDef[] = []
  for (const cat of CATEGORY_ORDER) {
    const inCat = all
      .filter(d => d.category === cat && checkInteractionAvailable(d.id, rel).canUse)
      .slice(0, 2) // max 2 per categoria
    available.push(...inCat)
    if (available.length >= max) break
  }
  return available.slice(0, max)
}

export const RelationCard = React.memo(function RelationCard({
  friend,
  onInteraction,
  actionsRemaining = 99,
  maxInteractions = 8,
}: RelationCardProps) {
  if (!friend.rel) return null

  const rel = friend.rel
  const tier = getRelationTierV2(rel)
  const tierLabel = getRelationTierV2Label(tier)
  const availableInteractions = getAvailableByCategory(rel, maxInteractions)
  const disabled = actionsRemaining <= 0

  return (
    <Card className="p-4 border border-border bg-card">
      {/* Header NPC */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-muted ${TYPE_COLOR[friend.type] ?? 'text-foreground'}`}>
          {TYPE_ICON[friend.type] ?? <User size={20} weight="fill" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-primary truncate">{friend.name}</span>
            <Badge variant="outline" className="text-xs shrink-0">{tierLabel}</Badge>
          </div>
          {friend.originType && (
            <span className="text-xs text-muted-foreground">
              {friend.originType === 'compagno_classe'
                ? 'Compagno di classe'
                : friend.originType === 'compagno_istituto'
                ? 'Compagno di istituto'
                : 'Extrascolastico'}
              {friend.metAt ? ` · ${friend.metAt}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* 4 barre relazionali */}
      <div className="space-y-1.5 mb-4">
        {([
          { key: 'amicizia',  label: 'Amicizia',  colorClass: 'bg-primary' },
          { key: 'romantico', label: 'Romantico', colorClass: 'bg-pink-400' },
          { key: 'amore',     label: 'Amore',     colorClass: 'bg-red-500' },
          { key: 'odio',      label: 'Odio',      colorClass: 'bg-destructive' },
        ] as const).map(({ key, label, colorClass }) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-16 text-muted-foreground shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClass} rounded-full transition-all duration-300`}
                style={{ width: `${rel[key]}%` }}
              />
            </div>
            <span className="w-7 text-right font-mono text-muted-foreground">{rel[key]}</span>
          </div>
        ))}
      </div>

      {/* Interazioni disponibili */}
      {availableInteractions.length > 0 ? (
        <div className="grid grid-cols-2 gap-1">
          {availableInteractions.map(def => (
            <Button
              key={def.id}
              size="sm"
              variant="outline"
              disabled={disabled}
              className="h-auto py-1.5 px-2 text-xs justify-start truncate"
              onClick={() => onInteraction(friend.id, def.id)}
              title={`${def.description}${def.failChance ? ` (${def.failChance}% rischio)` : ''}`}
            >
              {def.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center italic">
          Nessuna interazione disponibile al momento.
        </p>
      )}
    </Card>
  )
})
