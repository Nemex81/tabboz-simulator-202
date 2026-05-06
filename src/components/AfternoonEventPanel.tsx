// src/components/AfternoonEventPanel.tsx
// Pannello narrativo per eventi pomeridiani/serali.
// Struttura identica a SchoolMorningPanel — tipi adattati a AfternoonEvent/AfternoonChoice.

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AfternoonEvent } from '@/lib/afternoon-events'

interface AfternoonEventPanelProps {
  event: AfternoonEvent
  onChoice: (choiceId: string) => void
}

const locationLabel: Record<AfternoonEvent['location'], string> = {
  palestra:          '🏋️ Palestra',
  festa:             '🎉 Festa',
  sport:             '⚽ Sport',
  online:            '💻 Online',
  quartiere:         '🏘️ Quartiere',
  lavoro:            '💼 Lavoro',
  centro_commerciale: '🛒 Centro Commerciale',
}

export const AfternoonEventPanel = React.memo(function AfternoonEventPanel({
  event,
  onChoice,
}: AfternoonEventPanelProps) {
  return (
    <Card className="mb-4 border-2 border-amber-300 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-amber-100 text-amber-800">
            {locationLabel[event.location] ?? event.location}
          </Badge>
          <Badge variant="outline" className="text-amber-700 border-amber-400">
            🌆 Pomeriggio/Sera
          </Badge>
        </div>
        <CardTitle className="text-base">{event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
        <div className="flex flex-col gap-2">
          {event.choices.map(choice => (
            <Button
              key={choice.id}
              variant="outline"
              size="sm"
              className="w-full text-left justify-start h-auto whitespace-normal py-2"
              onClick={() => onChoice(choice.id)}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})
