// src/components/SchoolHomePanel.tsx
// Fase 4C — Home scolastica: info anno, orario giornaliero, ora corrente, link a sotto-pannelli.
// Fase 4E — Vista compagni di classe integrata (toggle interno).

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type {
  SchoolType,
  Teacher,
  Classmate,
  WeeklyTimetable,
  SchoolDayState,
  SchoolRecord,
  GameDate,
  ClassmatePersonality,
} from '@/lib/types'
import { getSchoolTypeName } from '@/lib/types'
import { COMMON_SUBJECTS, SPECIFIC_SUBJECTS } from '@/lib/subjects'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Lookup display name da subjectKey. */
function subjectName(key: string, schoolType: SchoolType): string {
  const specific = SPECIFIC_SUBJECTS[schoolType] ?? []
  const all = [...COMMON_SUBJECTS, ...specific]
  return all.find(s => s.key === key)?.displayName ?? key
}

/** Converte una GameDate in giorno della settimana scolastica (0=lun, 4=ven, 5-6=weekend). */
function schoolDayOfWeek(date: GameDate): number {
  return (new Date(date.year, date.month - 1, date.day).getDay() + 6) % 7
}

/** Barra relazione -100/+100, colori condivisi con TeachersPanel. */
function RelationBar({ value }: { value: number }) {
  const pct = ((value + 100) / 200) * 100
  const color =
    value > 20 ? 'bg-green-500' : value >= -20 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div
      className="relative h-2 w-full rounded bg-muted overflow-hidden"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={-100}
      aria-valuemax={100}
      aria-label={`Relazione: ${value}`}
    >
      <div
        className={`${color} h-full`}
        style={{ width: `${pct}%` }}
        aria-hidden
      />
    </div>
  )
}

const PERSONALITY_LABELS: Record<ClassmatePersonality, string> = {
  secchione: '🤓 Secchione',
  bullo: '👊 Bullo',
  simpatico: '😄 Simpatico',
  silenzioso: '🤫 Silenzioso',
  sportivo: '⚽ Sportivo',
  ribelle: '🤘 Ribelle',
  nerd: '💻 Nerd',
  popolare: '⭐ Popolare',
  timido: '😳 Timido',
  leader: '👑 Leader',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface SchoolHomePanelProps {
  schoolType: SchoolType
  schoolYear: number
  schoolRecord: SchoolRecord
  timetable: WeeklyTimetable | null
  schoolDayState: SchoolDayState | null
  teachers: Teacher[]
  classRoster: Classmate[]
  currentDate: GameDate
  onGoToTeachers: () => void
  /** Chiamato solo come fallback se `onPromoteToFriend` NON è fornito. */
  onGoToClassmates: () => void
  /** Fase 4E: se fornito, abilita la vista compagni interna con promozione. */
  onPromoteToFriend?: (classmateId: string) => void
}

// ── Componente principale ─────────────────────────────────────────────────────

export const SchoolHomePanel = React.memo(function SchoolHomePanel({
  schoolType,
  schoolYear,
  schoolRecord,
  timetable,
  schoolDayState,
  teachers,
  classRoster,
  currentDate,
  onGoToTeachers,
  onGoToClassmates,
  onPromoteToFriend,
}: SchoolHomePanelProps) {
  // Fase 4E — toggle vista compagni
  const [showClassmates, setShowClassmates] = useState(false)

  // ── Dati derivati ─────────────────────────────────────────────────────────

  const promotedCount = classRoster.filter(c => c.promotedToFriend).length

  // Orario del giorno corrente
  const dow = schoolDayOfWeek(currentDate)
  const todaySlots: import('@/lib/types').TimetableSlot[] | null =
    timetable && dow >= 0 && dow <= 4 ? (timetable as WeeklyTimetable)[dow as 0 | 1 | 2 | 3 | 4] ?? null : null

  // Ora corrente (da schoolDayState se attivo)
  const isSchoolActive =
    schoolDayState !== null &&
    !schoolDayState.isComplete &&
    schoolDayState.slots.length > 0

  const currentSlot = isSchoolActive
    ? schoolDayState!.slots[schoolDayState!.currentSlotIndex]
    : null

  const currentTeacher = currentSlot?.teacherId
    ? teachers.find(t => t.id === currentSlot.teacherId)
    : undefined

  // ── Vista compagni (Fase 4E) ──────────────────────────────────────────────

  if (showClassmates) {
    return (
      <div
        className="space-y-3"
        role="region"
        aria-label="Vista compagni di classe"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClassmates(false)}
            aria-label="Torna alla home scolastica"
          >
            ← Torna alla home
          </Button>
          <span className="font-semibold text-sm">Compagni di classe</span>
        </div>

        {classRoster.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nessun compagno in classe.
          </p>
        ) : (
          <ul className="space-y-2" role="list" aria-label="Lista compagni di classe">
            {classRoster.map(c => (
              <li key={c.id}>
                <Card className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{c.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {PERSONALITY_LABELS[c.personality] ?? c.personality}
                      </Badge>
                      {c.promotedToFriend && (
                        <Badge className="text-xs bg-pink-100 text-pink-800 border-pink-200">
                          👫 Amico
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {c.relation > 0 ? '+' : ''}{c.relation}
                    </span>
                  </div>
                  <RelationBar value={c.relation} />
                  {c.relation >= 30 && !c.promotedToFriend && onPromoteToFriend && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => onPromoteToFriend(c.id)}
                      aria-label={`Aggiungi ${c.name} agli amici`}
                    >
                      + Aggiungi agli amici
                    </Button>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  // ── Vista home (default) ──────────────────────────────────────────────────

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="Home scolastica"
    >
      {/* Sezione 1 — Header */}
      <div
        className="rounded-lg bg-blue-50 border border-blue-200 p-3"
        role="region"
        aria-label="Informazioni anno scolastico"
      >
        <p className="font-bold text-blue-800">
          {getSchoolTypeName(schoolType)}
        </p>
        <p className="text-sm text-blue-700">
          Anno {schoolYear}° — {schoolRecord.year} scolastico
        </p>
      </div>

      {/* Sezione 2 — Contatore amici */}
      <div
        className="flex items-center gap-2"
        role="status"
        aria-label={`Compagni promossi ad amici: ${promotedCount} su ${classRoster.length}`}
      >
        <Badge variant="outline" className="text-xs">
          👫 Amici dalla classe: {promotedCount} / {classRoster.length}
        </Badge>
      </div>

      {/* Sezione 3 — Ora corrente (se mattinata attiva) */}
      {isSchoolActive && currentSlot && currentSlot.type === 'lesson' && (
        <Card
          className="border border-amber-300 bg-amber-50"
          role="region"
          aria-label="Ora scolastica corrente"
          aria-live="polite"
        >
          <CardContent className="pt-3 pb-2">
            <p className="text-sm font-medium text-amber-800">
              Ora corrente: {currentSlot.hourIndex + 1} —{' '}
              {currentSlot.subjectKey
                ? subjectName(currentSlot.subjectKey, schoolType)
                : '—'}
              {currentTeacher ? ` con Prof. ${currentTeacher.name}` : ''}
            </p>
          </CardContent>
        </Card>
      )}
      {isSchoolActive && currentSlot && currentSlot.type === 'break' && (
        <Card
          className="border border-green-300 bg-green-50"
          role="region"
          aria-label="Intervallo in corso"
          aria-live="polite"
        >
          <CardContent className="pt-3 pb-2">
            <p className="text-sm font-medium text-green-800">☕ Intervallo in corso</p>
          </CardContent>
        </Card>
      )}

      {/* Sezione 4 — Orario del giorno corrente */}
      <Card role="region" aria-label="Orario del giorno corrente">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-sm font-semibold">
            Orario di oggi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {todaySlots === null ? (
            <p className="text-sm text-muted-foreground" aria-label="Orario non ancora generato">
              {dow > 4
                ? 'Oggi è weekend — nessuna lezione.'
                : 'Orario non ancora generato.'}
            </p>
          ) : (
            <ul role="list" aria-label="Lista ore del giorno" className="space-y-1">
              {todaySlots.map((slot, i) => {
                const t = teachers.find(t => t.id === slot.teacherId)
                return (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="font-mono text-muted-foreground w-6 shrink-0">
                      {i + 1}.
                    </span>
                    <span>
                      {subjectName(slot.subjectKey, schoolType)}
                      {t ? ` — Prof. ${t.name}` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Sezione 5 — Navigazione sotto-pannelli */}
      <div
        className="flex gap-2"
        role="navigation"
        aria-label="Sotto-pannelli scolastici"
      >
        <Button
          variant="outline"
          className="flex-1"
          onClick={onGoToTeachers}
          aria-label="Vai al pannello professori"
        >
          Professori →
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={
            onPromoteToFriend
              ? () => setShowClassmates(true)
              : onGoToClassmates
          }
          aria-label="Vai alla lista compagni di classe"
        >
          Compagni di classe →
        </Button>
      </div>
    </div>
  )
})
