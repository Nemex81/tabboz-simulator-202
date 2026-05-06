/**
 * RelationshipsPanel: pannello del sistema romantico e dei potenziali partner.
 */

import React from 'react'
import { Relationship, GameStats, PlayerProfile } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Sparkle, User } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { getRelationshipPreferenceText, getDifficultyText, calculateRelationshipSuccess } from '@/lib/relationship-utils'
import { getPotentialPartnersEmptyLabel, getPotentialPartnersHeading, getPartnerSubjectPronoun } from '@/lib/gender-utils'

function getRelationshipMetAtLabel(metAt: Relationship['metAt']): string | null {
  switch (metAt) {
    case 'online':
      return 'Rete'
    case 'quartiere':
      return 'Quartiere'
    case 'palestra':
      return 'Palestra'
    case 'festa':
      return 'Festa'
    case 'classe':
      return 'Classe'
    case 'corridoio':
      return 'Corridoio'
    case 'sport':
      return 'Sport'
    case 'lavoro':
      return 'Lavoro'
    default:
      return null
  }
}

interface RelationshipsPanelProps {
  playerProfile: PlayerProfile | null
  relationships: Relationship[]
  stats: GameStats
  onTryRelationship: (relationshipId: string) => void
  actionsRemaining: number
}

export function RelationshipsPanel({ playerProfile, relationships, stats, onTryRelationship, actionsRemaining }: RelationshipsPanelProps) {
  const activeRelationships = relationships.filter(r => r.isActive)
  const availableRelationships = relationships.filter(r => !r.isActive)

  return (
    <div className="space-y-6" role="region" aria-label="Relazioni sentimentali">
      {activeRelationships.length > 0 && (
        <Card className="p-6 border-2 border-accent bg-gradient-to-br from-accent/20 to-primary/10">
          <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
            <Heart size={28} weight="fill" />
            RELAZIONI ATTIVE ({activeRelationships.length})
          </h3>
          <div className="grid gap-3">
            {activeRelationships.map((rel) => (
              <div
                key={rel.id}
                className="p-4 rounded-lg bg-accent/10 border-2 border-accent"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart size={24} weight="fill" className="text-accent" />
                      <span className="font-bold text-xl">{rel.name}</span>
                      <Badge className="ml-auto bg-accent">
                        Livello {rel.relationshipLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Sparkle size={16} weight="fill" className="text-primary" />
                      <span className="text-sm text-muted-foreground">
                        State insieme! Continua a uscire con {getPartnerSubjectPronoun(rel.gender ?? 'F')}!
                      </span>
                    </div>
                    {rel.metAt && getRelationshipMetAtLabel(rel.metAt) && (
                      <div className="mt-2">
                        <Badge variant="outline">Origine: {getRelationshipMetAtLabel(rel.metAt)}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {availableRelationships.length > 0 && (
        <Card className="p-6 border-2 border-secondary bg-card">
          <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
            <User size={28} weight="fill" />
            {getPotentialPartnersHeading(playerProfile?.gender ?? 'maschio')} ({availableRelationships.length})
          </h3>
          <div className="grid gap-3">
            {availableRelationships.map((rel) => {
              const successChance = calculateRelationshipSuccess(stats, rel)
              return (
                <div
                  key={rel.id}
                  className="p-4 rounded-lg bg-muted/30 border border-border hover:border-secondary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={24} weight="fill" className="text-secondary" />
                        <span className="font-bold text-lg">{rel.name}</span>
                        <Badge 
                          variant={rel.difficulty === 'facile' ? 'default' : rel.difficulty === 'media' ? 'secondary' : 'destructive'}
                          className="ml-2"
                        >
                          {getDifficultyText(rel.difficulty)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkle size={16} weight="fill" className="text-accent" />
                          <span>{getRelationshipPreferenceText(rel.preference)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-primary font-bold">
                            Probabilità di successo: {successChance.toFixed(0)}%
                          </span>
                        </div>
                        {rel.metAt && getRelationshipMetAtLabel(rel.metAt) && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">Origine: {getRelationshipMetAtLabel(rel.metAt)}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => onTryRelationship(rel.id)}
                      disabled={actionsRemaining === 0 || stats.soldi < 80}
                      variant="default"
                      className="bg-secondary hover:bg-secondary/80"
                    >
                      <Heart size={20} weight="fill" className="mr-2" />
                      Provarci
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            <p>💡 Aumenta le statistiche richieste (Muscoli/Figosità/Intelligenza) e il Carisma per avere più possibilità!</p>
          </div>
        </Card>
      )}

      {relationships.length === 0 && (
        <Card className="p-6 border-2 border-muted bg-card/50">
          <div className="text-center text-muted-foreground">
            <Heart size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">{getPotentialPartnersEmptyLabel(playerProfile?.gender ?? 'maschio')}</p>
            <p className="text-sm mt-2">Esci di più per incontrare nuove persone!</p>
          </div>
        </Card>
      )}
    </div>
  )
}
