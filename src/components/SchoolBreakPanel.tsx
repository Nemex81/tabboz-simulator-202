// src/components/SchoolBreakPanel.tsx
// Fase 4B — Pannello UI per l'intervallo scolastico.
// 3 tab: Compagni | Professori | Altro.
// Una sola azione eseguibile per intervallo.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  GameStats,
  Teacher,
  Classmate,
  SchoolDayState,
  SchoolRecord,
  GameDate,
} from '@/lib/types'
import {
  type BreakContext,
  type BreakResult,
  getAvailableActions,
} from '@/lib/school-break-actions'
import { clampStat } from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'

// ── Props ─────────────────────────────────────────────────────────────────────

interface SchoolBreakPanelProps {
  schoolDayState: SchoolDayState
  teachers: Teacher[]
  classRoster: Classmate[]
  stats: GameStats
  schoolRecord: SchoolRecord
  onStatChange: (updater: (prev: GameStats) => GameStats) => void
  onTeacherChange: (updater: (prev: Teacher[]) => Teacher[]) => void
  onClassmateChange: (updater: (prev: Classmate[]) => Classmate[]) => void
  onBreakComplete: () => void
  announce: (msg: string) => void
  currentDate: GameDate
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relationLabel(relation: number): string {
  if (relation >= 50) return '😊 Ottima'
  if (relation >= 20) return '🙂 Buona'
  if (relation >= 0) return '😐 Neutrale'
  if (relation >= -30) return '😕 Tesa'
  return '😠 Ostile'
}

function teacherRelationLabel(relazione: number): string {
  if (relazione >= 30) return '🟢'
  if (relazione >= 0) return '🟡'
  if (relazione >= -30) return '🟠'
  return '🔴'
}

// ── Componente principale ─────────────────────────────────────────────────────

export const SchoolBreakPanel = React.memo(function SchoolBreakPanel({
  schoolDayState,
  teachers,
  classRoster,
  stats,
  schoolRecord,
  onStatChange,
  onTeacherChange,
  onClassmateChange,
  onBreakComplete,
  announce,
  currentDate,
}: SchoolBreakPanelProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | undefined>(undefined)
  const [actionResult, setActionResult] = useState<BreakResult | null>(null)
  const [actionDone, setActionDone] = useState(false)
  const firstTabRef = useRef<HTMLButtonElement>(null)

  // Focus sul primo tab al mount (accessibilità)
  useEffect(() => {
    firstTabRef.current?.focus()
  }, [])

  // ── Derivazioni da schoolDayState (C11) ───────────────────────────────────
  const todayTeachers: Teacher[] = schoolDayState.slots
    .filter(s => s.type === 'lesson' && s.teacherId)
    .flatMap(s => {
      const t = teachers.find(t => t.id === s.teacherId)
      return t ? [t] : []
    })
    // Deduplica per id
    .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)

  const completedSlots = schoolDayState.slots.filter(
    s => s.completed && s.type === 'lesson'
  )

  // ── Contesto base per le azioni ───────────────────────────────────────────
  const buildCtx = useCallback(
    (target?: string): BreakContext => ({
      stats,
      teachers,
      todayTeachers,
      classRoster,
      schoolRecord,
      completedSlots,
      selectedTarget: target,
      currentDate,
    }),
    [stats, teachers, todayTeachers, classRoster, schoolRecord, completedSlots, currentDate]
  )

  // ── Esecuzione azione ─────────────────────────────────────────────────────
  const handleAction = useCallback(
    (actionKey: string) => {
      if (actionDone) return

      const allActions = [
        ...getAvailableActions(buildCtx(selectedTarget), 'compagno'),
        ...getAvailableActions(buildCtx(selectedTarget), 'professore'),
        ...getAvailableActions(buildCtx(selectedTarget), 'indipendente'),
      ]
      const action = allActions.find(a => a.type === actionKey || a.label === actionKey)
      if (!action) return

      const result = action.execute(buildCtx(selectedTarget))

      // Applica statDelta
      if (Object.keys(result.statDelta).length > 0) {
        onStatChange((prev) => {
          const updated = { ...prev }
          for (const [key, value] of Object.entries(result.statDelta)) {
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
      }

      // Aggiorna teacher se necessario
      if (result.updatedTeacher) {
        const updated = result.updatedTeacher
        onTeacherChange((prev) =>
          prev.map(t => t.id === updated.id ? updated : t)
        )
      }

      // Aggiorna classmate se necessario
      if (result.updatedClassmate) {
        const updated = result.updatedClassmate
        onClassmateChange((prev) =>
          prev.map(c => c.id === updated.id ? updated : c)
        )
      }

      playSound.buttonClick()
      announce(result.message)
      setActionResult(result)
      setActionDone(true)
    },
    [actionDone, selectedTarget, buildCtx, onStatChange, onTeacherChange, onClassmateChange, announce]
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="Pannello intervallo scolastico"
    >
      <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 text-center">
        <p className="font-bold text-amber-800">☕ Intervallo</p>
        <p className="text-sm text-amber-700">Hai 15 minuti. Scegli una sola azione.</p>
      </div>

      {actionResult ? (
        // ── Risultato azione ────────────────────────────────────────────────
        <div
          className="space-y-3"
          role="status"
          aria-live="polite"
          aria-label="Risultato azione"
        >
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-green-800">{actionResult.message}</p>
              {Object.keys(actionResult.statDelta).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(actionResult.statDelta).map(([k, v]) =>
                    v !== undefined && v !== 0 ? (
                      <Badge
                        key={k}
                        className={v > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {k}: {v > 0 ? '+' : ''}{v}
                      </Badge>
                    ) : null
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Button
            className="w-full"
            onClick={() => {
              announce('Intervallo terminato. Si torna in classe.')
              onBreakComplete()
            }}
            aria-label="Fine intervallo, torna in classe"
          >
            Fine intervallo →
          </Button>
        </div>
      ) : (
        // ── Selezione azione ────────────────────────────────────────────────
        <Tabs defaultValue="compagni" className="w-full">
          <TabsList
            className="w-full grid grid-cols-3"
            role="tablist"
            aria-label="Categorie azioni intervallo"
            onKeyDown={(e) => {
              // Arrow key navigation tra tab
              const tabs = Array.from(
                (e.currentTarget as HTMLElement).querySelectorAll('[role="tab"]')
              ) as HTMLElement[]
              const idx = tabs.indexOf(e.target as HTMLElement)
              if (e.key === 'ArrowRight' && idx < tabs.length - 1) {
                tabs[idx + 1].focus()
              } else if (e.key === 'ArrowLeft' && idx > 0) {
                tabs[idx - 1].focus()
              }
            }}
          >
            <TabsTrigger
              value="compagni"
              ref={firstTabRef}
              aria-label="Tab Compagni"
            >
              👥 Compagni
            </TabsTrigger>
            <TabsTrigger value="professori" aria-label="Tab Professori">
              🎓 Professori
            </TabsTrigger>
            <TabsTrigger value="altro" aria-label="Tab Altro">
              ☕ Altro
            </TabsTrigger>
          </TabsList>

          {/* ── TAB COMPAGNI ─────────────────────────────────────────── */}
          <TabsContent value="compagni">
            <div className="space-y-3" role="region" aria-label="Azioni con i compagni">
              {classRoster.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessun compagno in classe.
                </p>
              ) : (
                <fieldset>
                  <legend className="sr-only">Seleziona un compagno</legend>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {classRoster.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={selectedTarget === c.id}
                        className={`w-full text-left px-3 py-2 rounded-md border text-sm flex items-center justify-between transition-colors ${
                          selectedTarget === c.id
                            ? 'border-amber-400 bg-amber-50 font-semibold'
                            : 'border-muted bg-background hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedTarget(
                          selectedTarget === c.id ? undefined : c.id
                        )}
                        aria-label={`${c.name} — ${relationLabel(c.relation)}`}
                      >
                        <span>{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {relationLabel(c.relation)}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <ActionButtons
                actions={getAvailableActions(buildCtx(selectedTarget), 'compagno')}
                onAction={handleAction}
                disabled={actionDone}
              />
            </div>
          </TabsContent>

          {/* ── TAB PROFESSORI ───────────────────────────────────────── */}
          <TabsContent value="professori">
            <div className="space-y-3" role="region" aria-label="Azioni con i professori">
              {todayTeachers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessun professore presente oggi.
                </p>
              ) : (
                <fieldset>
                  <legend className="sr-only">Seleziona un professore</legend>
                  <div className="space-y-1">
                    {todayTeachers.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={selectedTarget === t.id}
                        className={`w-full text-left px-3 py-2 rounded-md border text-sm flex items-center justify-between transition-colors ${
                          selectedTarget === t.id
                            ? 'border-amber-400 bg-amber-50 font-semibold'
                            : 'border-muted bg-background hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedTarget(
                          selectedTarget === t.id ? undefined : t.id
                        )}
                        aria-label={`${t.name} — relazione ${t.relazione}${t.isOstile ? ' — OSTILE' : ''}`}
                      >
                        <span>
                          {t.name}
                          {t.isOstile && (
                            <span
                              className="ml-1 text-xs text-red-600 font-normal"
                              aria-hidden
                            >
                              (ostile)
                            </span>
                          )}
                        </span>
                        <span aria-hidden>
                          {teacherRelationLabel(t.relazione)}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <ActionButtons
                actions={getAvailableActions(buildCtx(selectedTarget), 'professore')}
                onAction={handleAction}
                disabled={actionDone}
              />
            </div>
          </TabsContent>

          {/* ── TAB ALTRO ────────────────────────────────────────────── */}
          <TabsContent value="altro">
            <div className="space-y-3" role="region" aria-label="Azioni indipendenti">
              <ActionButtons
                actions={getAvailableActions(buildCtx(undefined), 'indipendente')}
                onAction={handleAction}
                disabled={actionDone}
              />
              {getAvailableActions(buildCtx(undefined), 'indipendente').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessuna azione disponibile al momento.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Pulsante "Salta" sempre visibile se non è stata eseguita un'azione */}
      {!actionDone && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            announce('Hai trascorso l\'intervallo senza fare nulla di particolare.')
            onBreakComplete()
          }}
          aria-label="Salta intervallo e torna in classe"
        >
          Salta intervallo
        </Button>
      )}
    </div>
  )
})

// ── Sub-componente ActionButtons ──────────────────────────────────────────────

interface ActionButtonsProps {
  actions: ReturnType<typeof getAvailableActions>
  onAction: (key: string) => void
  disabled: boolean
}

function ActionButtons({ actions, onAction, disabled }: ActionButtonsProps) {
  if (actions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-2">
        Nessuna azione disponibile con il target selezionato.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Azioni disponibili">
      {actions.map(action => (
        <Button
          key={action.type + action.label}
          variant="outline"
          size="sm"
          disabled={disabled}
          className="w-full text-left justify-start h-auto whitespace-normal py-2"
          onClick={() => onAction(action.type)}
          aria-label={`${action.label}: ${action.description}`}
        >
          <span className="flex flex-col items-start gap-0.5">
            <span className="font-medium">{action.label}</span>
            <span className="text-xs text-muted-foreground font-normal">
              {action.description}
            </span>
          </span>
        </Button>
      ))}
    </div>
  )
}
