// src/components/SchoolMorningPanel.tsx
// Pannello narrativo per la mattina scolastica feriale.
// Mostra fino a 3 eventi randomizzati con scelte interattive.

import React, { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GameStats } from '@/lib/types'
import { SchoolMorningEvent, SchoolMorningChoice } from '@/lib/school-morning-events'
import { clampStat } from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'

interface SchoolMorningPanelProps {
  events: SchoolMorningEvent[]
  stats: GameStats
  onStatChange: (updater: (prev: GameStats) => GameStats) => void
  onGainExtraAction: () => void
  announce: (msg: string) => void
}

const categoryLabel: Record<SchoolMorningEvent['category'], string> = {
  didattica: '📚 Didattica',
  sociale: '👥 Sociale',
  istituto: '🏫 Istituto',
}

const categoryColor: Record<SchoolMorningEvent['category'], string> = {
  didattica: 'bg-blue-100 text-blue-800',
  sociale: 'bg-green-100 text-green-800',
  istituto: 'bg-orange-100 text-orange-800',
}

function EventCard({
  event,
  stats,
  onChoice,
  resolved,
}: {
  event: SchoolMorningEvent
  stats: GameStats
  onChoice: (choice: SchoolMorningChoice) => void
  resolved: boolean
}) {
  return (
    <Card className="mb-4 border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={categoryColor[event.category]}>
            {categoryLabel[event.category]}
          </Badge>
          {event.choices.some(c => c.grantsExtraAction) && (
            <Badge variant="outline" className="text-yellow-700 border-yellow-400">
              ⚡ Puoi guadagnare azione extra
            </Badge>
          )}
        </div>
        <CardTitle className="text-base">{event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
        {!resolved && (
          <div className="flex flex-col gap-2">
            {event.choices.map((choice, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start h-auto whitespace-normal py-2"
                onClick={() => onChoice(choice)}
              >
                {choice.grantsExtraAction && <span className="mr-1 text-yellow-500">⚡</span>}
                {choice.label}
              </Button>
            ))}
          </div>
        )}
        {resolved && (
          <p className="text-sm text-muted-foreground italic">Scelta già effettuata.</p>
        )}
      </CardContent>
    </Card>
  )
}

export const SchoolMorningPanel = React.memo(function SchoolMorningPanel({
  events,
  stats,
  onStatChange,
  onGainExtraAction,
  announce,
}: SchoolMorningPanelProps) {
  const [resolvedIds, setResolvedIds] = React.useState<Set<string>>(new Set())

  const handleChoice = useCallback(
    (event: SchoolMorningEvent, choice: SchoolMorningChoice) => {
      if (resolvedIds.has(event.id)) return

      const result = choice.outcome(stats)

      // Applica delta alle statistiche
      onStatChange((prev) => {
        const updated = { ...prev }
        for (const [key, value] of Object.entries(result.delta)) {
          if (value === undefined) continue
          const k = key as keyof GameStats
          if (k === 'soldi') {
            updated[k] = clampStat((updated[k] as number) + value, 0, 1000)
          } else {
            updated[k] = clampStat((updated[k] as number) + value)
          }
        }
        return updated
      })

      if (choice.grantsExtraAction) {
        onGainExtraAction()
      }

      playSound.buttonClick()
      announce(result.message)
      setResolvedIds((prev) => new Set([...prev, event.id]))
    },
    [resolvedIds, stats, onStatChange, onGainExtraAction, announce]
  )

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 text-center">
        <p className="font-bold text-amber-800">🏫 Mattina scolastica</p>
        <p className="text-sm text-amber-700">
          Sei a scuola. Gestisci gli eventi della mattina, poi premi "Fine mattina" per passare al pomeriggio.
        </p>
      </div>

      {events.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            Mattinata tranquilla. Niente eventi particolari oggi.
          </CardContent>
        </Card>
      )}

      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          stats={stats}
          onChoice={(choice) => handleChoice(event, choice)}
          resolved={resolvedIds.has(event.id)}
        />
      ))}
    </div>
  )
})
