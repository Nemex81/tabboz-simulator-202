// src/components/SchoolMorningPanel.tsx
// Pannello narrativo per la mattina scolastica feriale.
// Modalità A (legacy): prop `events` — mostra N event-card con scelte.
// Modalità B (slot):   prop `schoolDayState` + `onSlotComplete` — navigazione sequenziale ora per ora.

import React, { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GameStats, Friend, MorningEventCategory, SchoolDayState } from '@/lib/types'
import { SchoolMorningEvent, SchoolMorningChoice } from '@/lib/school-morning-events'
import { clampStat } from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'

interface SchoolMorningPanelProps {
  context: 'school' | 'street'
  events: SchoolMorningEvent[]
  stats: GameStats
  onStatChange: (updater: (prev: GameStats) => GameStats) => void
  onGainExtraAction: () => void
  announce: (msg: string) => void
  onNewFriend?: (f: Friend) => void
  addLogEntry: (
    type: import('@/lib/types').LogEntryType,
    title: string,
    description: string,
    result: import('@/lib/types').GameLogEntry['result'],
    date: import('@/lib/types').GameDate,
    phase: import('@/lib/types').DayPhase
  ) => void
  currentDate: import('@/lib/types').GameDate
  // Modalità slot (Fase 2E) — opzionali per retrocompatibilità
  schoolDayState?: SchoolDayState
  onSlotComplete?: (slotIndex: number) => void
}

const categoryLabel: Record<MorningEventCategory, string> = {
  didattica: '📚 Didattica',
  sociale: '👥 Sociale',
  istituto: '🏫 Istituto',
  strada: '🛤️ Strada',
  casa: '🏠 Casa',
  citta: '🏙️ Città',
  amici: '👫 Amici',
}

const categoryColor: Record<MorningEventCategory, string> = {
  didattica: 'bg-primary/10 text-primary border border-primary/30',
  sociale:   'bg-secondary/10 text-secondary border border-secondary/30',
  istituto:  'bg-accent/10 text-accent border border-accent/30',
  strada:    'bg-muted text-muted-foreground',
  casa:      'bg-secondary/10 text-secondary border border-secondary/30',
  citta:     'bg-accent/10 text-accent border border-accent/30',
  amici:     'bg-primary/10 text-primary border border-primary/30',
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
  context,
  events,
  stats,
  onStatChange,
  onGainExtraAction,
  announce,
  onNewFriend,
  addLogEntry,
  currentDate,
  schoolDayState,
  onSlotComplete,
}: SchoolMorningPanelProps) {
  const [resolvedIds, setResolvedIds] = React.useState<Set<string>>(new Set())

  // ── Modalità slot: gestione scelta su structuredEvent ──────────────────────
  const handleSlotChoice = useCallback(
    (choice: SchoolMorningChoice, slotIndex: number, eventId: string) => {
      if (resolvedIds.has(eventId)) return

      {
        const result = choice.outcome(stats)

        onStatChange((prev) => {
          const updated = { ...prev }
          const numericUpdated = updated as unknown as Record<string, number>
          for (const [key, value] of Object.entries(result.delta)) {
            if (typeof value !== 'number') continue
            const k = key as keyof GameStats
            if (k === 'soldi') {
              numericUpdated[k] = clampStat((numericUpdated[k] ?? 0) + value, 0, 1000)
            } else {
              numericUpdated[k] = clampStat((numericUpdated[k] ?? 0) + value)
            }
          }
          return updated
        })

        if (choice.grantsExtraAction) onGainExtraAction()

        playSound.buttonClick()
        announce(result.message)
        if (result.newFriend && onNewFriend) onNewFriend(result.newFriend)

        const deltaSum = Object.entries(result.delta)
          .filter(([k, v]) => k !== 'soldi' && typeof v === 'number')
          .reduce((acc, [, v]) => acc + (v as number), 0)
        const logResult: import('@/lib/types').GameLogEntry['result'] =
          deltaSum > 0 ? 'positive' : deltaSum < 0 ? 'negative' : 'neutral'
        addLogEntry('school', 'Evento scolastico', result.message, logResult, currentDate, 'mattina')

        setResolvedIds((prev) => new Set([...prev, eventId]))
        setTimeout(() => onSlotComplete?.(slotIndex), 0)
      }
    },
    [resolvedIds, stats, onStatChange, onGainExtraAction, announce, onNewFriend, addLogEntry, currentDate, onSlotComplete]
  )

  // ── Modalità slot: UI ──────────────────────────────────────────────────────
  if (schoolDayState && context === 'school') {
    const { slots, currentSlotIndex, isComplete } = schoolDayState

    // Giornata completata
    if (isComplete) {
      const structuredOccurred = slots.filter(
        (s) => s.type === 'lesson' && s.structuredEvent
      )
      return (
        <div
          className="space-y-4"
          role="region"
          aria-label="Giornata scolastica completata"
        >
          <div className="rounded-lg bg-green-50 border border-green-300 p-4 text-center">
            <p className="font-bold text-green-800 text-lg">🎓 Giornata scolastica completata!</p>
            <p className="text-sm text-green-700 mt-1">
              Hai terminato tutte le ore. Passa al pomeriggio quando sei pronto.
            </p>
          </div>
          {structuredOccurred.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Eventi della giornata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {structuredOccurred.map((s) => (
                    <li key={s.hourIndex} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground shrink-0">
                        {s.hourIndex < 3 ? `${s.hourIndex + 1}ª ora` : `${s.hourIndex}ª ora`}
                      </span>
                      <span>{s.structuredEvent!.title}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }

    const currentSlot = slots[currentSlotIndex]
    if (!currentSlot) return null

    // Numero totale di slot lezione (esclude break) per header "Ora X di Y"
    const lessonSlots = slots.filter((s) => s.type === 'lesson')
    const currentLessonNumber =
      slots
        .slice(0, currentSlotIndex + 1)
        .filter((s) => s.type === 'lesson').length
    const totalLessons = lessonSlots.length

    // ── Slot break ─────────────────────────────────────────────────────────
    if (currentSlot.type === 'break') {
      const delta = currentSlot.ordinaryEvent.statDelta
      const deltaText = Object.entries(delta)
        .filter(([, v]) => v !== 0 && v !== undefined)
        .map(([k, v]) => `${(v as number) > 0 ? '+' : ''}${v} ${k}`)
        .join(', ')

      return (
        <div
          className="space-y-4"
          role="region"
          aria-label="Intervallo scolastico"
          aria-live="polite"
        >
          <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 text-center">
            <p className="font-bold text-amber-800">🏫 Mattina scolastica</p>
            <p className="text-sm text-amber-700">Intervallo — 15 minuti liberi</p>
          </div>
          <Card className="border-2 border-amber-200">
            <CardHeader className="pb-2">
              <Badge className="w-fit bg-amber-100 text-amber-800">☕ Intervallo</Badge>
              <CardTitle className="text-base mt-2">
                {currentSlot.ordinaryEvent.message}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deltaText && (
                <p className="text-sm text-muted-foreground mb-3">{deltaText}</p>
              )}
              <Button
                className="w-full"
                onClick={() => {
                  {
                    if (Object.keys(delta).length > 0) {
                      onStatChange((prev) => {
                        const updated = { ...prev }
                        const numericUpdated = updated as unknown as Record<string, number>
                        for (const [key, value] of Object.entries(delta)) {
                          if (typeof value !== 'number') continue
                          const k = key as keyof GameStats
                          if (k === 'soldi') {
                            numericUpdated[k] = clampStat((numericUpdated[k] ?? 0) + value, 0, 1000)
                          } else {
                            numericUpdated[k] = clampStat((numericUpdated[k] ?? 0) + value)
                          }
                        }
                        return updated
                      })
                    }
                    playSound.buttonClick()
                    announce('Intervallo terminato. Si torna in classe.')
                    setTimeout(() => onSlotComplete?.(currentSlotIndex), 0)
                  }
                }}
                aria-label="Fine intervallo, torna in classe"
              >
                Fine intervallo
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    // ── Slot lezione ────────────────────────────────────────────────────────
    const { ordinaryEvent, structuredEvent } = currentSlot
    const isResolved = structuredEvent ? resolvedIds.has(structuredEvent.id) : false

    return (
      <div
        className="space-y-4"
        role="region"
        aria-label={`Ora ${currentLessonNumber} di ${totalLessons}`}
        aria-live="polite"
      >
        <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 text-center">
          <p className="font-bold text-amber-800">🏫 Mattina scolastica</p>
          <p className="text-sm text-amber-700" aria-live="polite">
            Ora {currentLessonNumber} di {totalLessons}
          </p>
        </div>

        <Card className="border-2">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">{ordinaryEvent.message}</p>

            {structuredEvent && !isResolved && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={categoryColor[structuredEvent.category]}>
                    {categoryLabel[structuredEvent.category]}
                  </Badge>
                </div>
                <p className="font-semibold mb-1">{structuredEvent.title}</p>
                <p className="text-sm text-muted-foreground mb-3">
                  {structuredEvent.description}
                </p>
                <div className="flex flex-col gap-2">
                  {structuredEvent.choices.slice(0, 3).map((choice, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto whitespace-normal py-2"
                      onClick={() =>
                        handleSlotChoice(choice, currentSlotIndex, structuredEvent.id)
                      }
                      aria-label={choice.label}
                    >
                      {choice.grantsExtraAction && (
                        <span className="mr-1 text-yellow-500" aria-hidden>⚡</span>
                      )}
                      {choice.label}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {structuredEvent && isResolved && (
              <p className="text-sm text-muted-foreground italic">Scelta già effettuata.</p>
            )}

            {(!structuredEvent || isResolved) && (
              <Button
                className="w-full mt-2"
                onClick={() => {
                  {
                    const delta = ordinaryEvent.statDelta
                    if (Object.keys(delta).length > 0) {
                      onStatChange((prev) => {
                        const updated = { ...prev }
                        const numericUpdated = updated as unknown as Record<string, number>
                        for (const [key, value] of Object.entries(delta)) {
                          if (typeof value !== 'number') continue
                          const k = key as keyof GameStats
                          if (k === 'soldi') {
                            numericUpdated[k] = clampStat((numericUpdated[k] ?? 0) + value, 0, 1000)
                          } else {
                            numericUpdated[k] = clampStat((numericUpdated[k] ?? 0) + value)
                          }
                        }
                        return updated
                      })
                    }
                    playSound.buttonClick()
                    announce(`Ora ${currentLessonNumber} terminata.`)
                    setTimeout(() => onSlotComplete?.(currentSlotIndex), 0)
                  }
                }}
                aria-label={`Termina ora ${currentLessonNumber} e vai alla successiva`}
              >
                Ora terminata →
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Modalità legacy (events) ───────────────────────────────────────────────
  const handleChoice = useCallback(
    (event: SchoolMorningEvent, choice: SchoolMorningChoice) => {
      if (resolvedIds.has(event.id)) return

      {
        const result = choice.outcome(stats)

        onStatChange((prev) => {
          const updated = { ...prev }
          const numericUpdated = updated as unknown as Record<string, number>
          for (const [key, value] of Object.entries(result.delta)) {
            if (typeof value !== 'number') continue
            const k = key as keyof GameStats
            if (k === 'soldi') {
              numericUpdated[k] = clampStat((numericUpdated[k] ?? 0) + value, 0, 1000)
            } else {
              numericUpdated[k] = clampStat((numericUpdated[k] ?? 0) + value)
            }
          }
          return updated
        })

        if (choice.grantsExtraAction) {
          onGainExtraAction()
        }

        playSound.buttonClick()
        announce(result.message)
        if (result.newFriend && onNewFriend) {
          onNewFriend(result.newFriend)
        }
        const deltaSum = Object.entries(result.delta)
          .filter(([k, v]) => k !== 'soldi' && typeof v === 'number')
          .reduce((acc, [, v]) => acc + (v as number), 0)
        const logResult: import('@/lib/types').GameLogEntry['result'] =
          deltaSum > 0 ? 'positive' : deltaSum < 0 ? 'negative' : 'neutral'
        addLogEntry(
          event.category === 'didattica' ? 'school' : 'social',
          event.title,
          result.message,
          logResult,
          currentDate,
          'mattina'
        )
        setResolvedIds((prev) => new Set([...prev, event.id]))
      }
    },
    [resolvedIds, stats, onStatChange, onGainExtraAction, announce, onNewFriend, addLogEntry, currentDate]
  )

  return (
    <div className="space-y-4">
      {context === 'school' ? (
        <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 text-center">
          <p className="font-bold text-amber-800">🏫 Mattina scolastica</p>
          <p className="text-sm text-amber-700">
            Sei a scuola. Gestisci gli eventi della mattina, poi usa i controlli nella schermata principale per passare al pomeriggio.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-slate-100 border border-slate-300 p-3 text-center">
          <p className="font-bold text-slate-700">🛤️ Mattina per strada</p>
          <p className="text-sm text-slate-600">
            Hai marinato. Vediamo cosa succede in giro oggi...
          </p>
        </div>
      )}

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
