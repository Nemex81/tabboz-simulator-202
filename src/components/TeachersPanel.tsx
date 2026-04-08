// src/components/TeachersPanel.tsx
// Fase 4D — Lista professori con card espandibili.
// Azioni disponibili fuori mattinata (consumano azione pomeridiana).

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type {
  Teacher,
  GameStats,
  GameDate,
  TeacherMemoryEntry,
} from '@/lib/types'
import { playSound } from '@/lib/sound-effects'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Colore barra relazione [0,100]. */
function relationColor(value: number): string {
  if (value > 60) return 'bg-green-500'
  if (value >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

/** Testo descrittivo relazione per screen reader. */
function relationLabel(value: number): string {
  if (value > 60) return 'Buona'
  if (value >= 40) return 'Neutrale'
  return 'Tesa'
}

/** Barra relazione [0,100]. */
function RelationBar({ value }: { value: number }) {
  const pct = value
  return (
    <div
      className="relative h-2 w-full rounded bg-muted overflow-hidden"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Relazione: ${value} (${relationLabel(value)})`}
    >
      <div
        className={`${relationColor(value)} h-full transition-all`}
        style={{ width: `${pct}%` }}
        aria-hidden
      />
    </div>
  )
}

const MEMORY_TYPE_LABELS: Record<TeacherMemoryEntry['type'], string> = {
  corruzione: '💰 Corruzione',
  minaccia: '⚡ Minaccia',
  buon_voto: '✅ Voto positivo',
  cattivo_voto: '❌ Voto negativo',
  conversazione: '💬 Conversazione',
  richiesta_spiegazione: '❓ Spiegazione',
  richiesta_revoca_voto: '🔄 Revoca voto',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TeachersPanelProps {
  teachers: Teacher[]
  currentDate: GameDate
  onTeacherInteraction: (teacherId: string, delta: number, reason: TeacherMemoryEntry['type'], date: GameDate) => void
  stats: GameStats
  announce: (msg: string) => void
  onConsumeAction: () => void
  actionsRemaining: number
}

// ── Componente principale ─────────────────────────────────────────────────────

export const TeachersPanel = React.memo(function TeachersPanel({
  teachers,
  currentDate,
  onTeacherInteraction,
  announce,
  onConsumeAction,
  actionsRemaining,
}: TeachersPanelProps) {
  // id dei professori con card espansa
  const [expanded, setExpanded] = useState<string | null>(null)
  // feedback azione (id teacher → messaggio)
  const [lastAction, setLastAction] = useState<{ teacherId: string; message: string } | null>(null)

  function toggleExpand(id: string) {
    setExpanded(prev => (prev === id ? null : id))
  }

  function handleConversazione(teacher: Teacher) {
    if (actionsRemaining <= 0) return
    const delta = 3 + Math.round(Math.random() * 2) // +3 / +4 / +5
    onTeacherInteraction(teacher.id, delta, 'conversazione', currentDate)
    onConsumeAction()
    playSound.buttonClick()
    const msg = `Hai avuto una breve conversazione con ${teacher.name}. Relazione +${delta}.`
    announce(msg)
    setLastAction({ teacherId: teacher.id, message: msg })
  }

  function handleChiediSpiegazione(teacher: Teacher) {
    if (actionsRemaining <= 0) return
    onTeacherInteraction(teacher.id, 2, 'richiesta_spiegazione', currentDate)
    onConsumeAction()
    playSound.buttonClick()
    const msg = `${teacher.name} ti ha dato ulteriori spiegazioni. Relazione +2.`
    announce(msg)
    setLastAction({ teacherId: teacher.id, message: msg })
  }

  if (teachers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8" role="status">
        Nessun professore assegnato. Genera l'anno scolastico per popolare il corpo docente.
      </p>
    )
  }

  return (
    <div
      className="space-y-2"
      role="region"
      aria-label="Lista professori"
    >
      {teachers.map(teacher => {
        const isExpandedCard = expanded === teacher.id
        const recentMemory = teacher.memoria.slice(-5).reverse()
        const feedbackMsg = lastAction?.teacherId === teacher.id ? lastAction.message : null

        return (
          <Card key={teacher.id} className="overflow-hidden">
            {/* Header card — clic per espandere */}
            <button
              type="button"
              className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-muted/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              aria-expanded={isExpandedCard}
              aria-controls={`teacher-detail-${teacher.id}`}
              aria-label={`${teacher.name}${teacher.isOstile ? ' — OSTILE' : ''}, relazione ${teacher.relazione}`}
              onClick={() => toggleExpand(teacher.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{teacher.name}</span>
                  {teacher.isOstile && (
                    <Badge
                      className="text-xs bg-red-100 text-red-800 border-red-200"
                      aria-label="Professore ostile"
                    >
                      ⚠️ Ostile
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {teacher.subjectKey}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1">
                    <RelationBar value={teacher.relazione} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">
                    {teacher.relazione > 0 ? '+' : ''}{teacher.relazione}
                  </span>
                </div>
              </div>
              <span
                className="text-muted-foreground text-sm shrink-0 mt-1"
                aria-hidden
              >
                {isExpandedCard ? '▲' : '▼'}
              </span>
            </button>

            {/* Dettaglio espandibile */}
            {isExpandedCard && (
              <CardContent
                id={`teacher-detail-${teacher.id}`}
                className="pt-0 pb-3 px-4 border-t border-muted"
              >
                {/* Feedback ultima azione */}
                {feedbackMsg && (
                  <div
                    className="mt-2 text-xs rounded bg-green-50 border border-green-200 px-2 py-1 text-green-800"
                    role="status"
                    aria-live="polite"
                  >
                    {feedbackMsg}
                  </div>
                )}

                {/* Storico interazioni */}
                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Storico interazioni recenti
                  </p>
                  {recentMemory.length === 0 ? (
                    <p
                      className="text-xs text-muted-foreground italic"
                      aria-live="polite"
                    >
                      Nessuna interazione registrata.
                    </p>
                  ) : (
                    <ul
                      className="space-y-1"
                      role="list"
                      aria-label="Storico interazioni"
                      aria-live="polite"
                    >
                      {recentMemory.map((entry, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>
                            {MEMORY_TYPE_LABELS[entry.type] ?? entry.type}
                          </span>
                          <span className="ml-auto font-mono">
                            {entry.impactOnRelation > 0 ? '+' : ''}{entry.impactOnRelation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Azioni fuori mattinata */}
                {actionsRemaining > 0 && (
                  <div
                    className="mt-3 flex flex-col gap-1.5"
                    role="group"
                    aria-label="Azioni disponibili con il professore"
                  >
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                      Azioni pomeridiane
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-1.5"
                      onClick={() => handleConversazione(teacher)}
                      aria-label={`Conversa con ${teacher.name} — consuma azione`}
                      disabled={teacher.isOstile}
                    >
                      💬 Conversazione
                      <span className="ml-auto text-muted-foreground font-normal">+3/5</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-1.5"
                      onClick={() => handleChiediSpiegazione(teacher)}
                      aria-label={`Chiedi una spiegazione a ${teacher.name} — consuma azione`}
                    >
                      ❓ Chiedi spiegazione
                      <span className="ml-auto text-muted-foreground font-normal">+2</span>
                    </Button>
                  </div>
                )}
                {actionsRemaining === 0 && (
                  <p className="mt-3 text-xs text-muted-foreground italic">
                    Nessuna azione rimanente nel pomeriggio.
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
})
