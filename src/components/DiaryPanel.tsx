import React from 'react'
import { BookOpen, CheckCircle, XCircle, MinusCircle } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { GameLogEntry, GameDate } from '@/lib/types'

interface DiaryPanelProps {
  gameLog: GameLogEntry[]
  previewOnly?: boolean
}

function formatDate(date: GameDate): string {
  return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`
}

function ResultIcon({ result }: { result: GameLogEntry['result'] }) {
  if (result === 'positive') return <CheckCircle size={16} weight="fill" className="text-secondary shrink-0" aria-hidden="true" />
  if (result === 'negative') return <XCircle size={16} weight="fill" className="text-destructive shrink-0" aria-hidden="true" />
  return <MinusCircle size={16} weight="fill" className="text-muted-foreground shrink-0" aria-hidden="true" />
}

function resultLabel(result: GameLogEntry['result']): string {
  if (result === 'positive') return 'Esito positivo'
  if (result === 'negative') return 'Esito negativo'
  return 'Esito neutro'
}

export function DiaryPanel({ gameLog, previewOnly = false }: DiaryPanelProps) {
  const entries = previewOnly ? gameLog.slice(0, 7) : gameLog

  if (entries.length === 0) {
    return (
      <Card className="p-6 border-2 border-muted bg-card">
        <p className="text-muted-foreground text-sm italic">
          Nessun evento registrato. Inizia a giocare per riempire il diario!
        </p>
      </Card>
    )
  }

  return (
    <section aria-labelledby="diary-title">
      {!previewOnly && (
        <Card className="p-4 border-2 border-accent bg-card mb-4">
          <h2 id="diary-title" className="text-2xl font-bold text-accent flex items-center gap-2">
            <BookOpen size={28} weight="fill" aria-hidden="true" />
            DIARIO — {entries.length} eventi registrati
          </h2>
        </Card>
      )}
      {previewOnly && (
        <h3 id="diary-title" className="sr-only">Anteprima diario — ultimi 7 eventi</h3>
      )}
      <ul
        role="log"
        aria-label={previewOnly ? 'Ultimi 7 eventi del diario' : 'Diario completo degli eventi'}
        aria-live="off"
        className="space-y-2"
      >
        {entries.map((entry) => (
          <li
            key={entry.id}
            role="listitem"
            className={`flex gap-3 items-start p-3 rounded-lg border ${
              entry.result === 'positive' ? 'border-secondary/30 bg-secondary/5' :
              entry.result === 'negative' ? 'border-destructive/30 bg-destructive/5' :
              'border-muted bg-muted/20'
            }`}
            aria-label={`${entry.date ? formatDate(entry.date) : ''}, ${entry.phase}: ${entry.title}. ${resultLabel(entry.result)}. ${entry.description}`}
          >
            <ResultIcon result={entry.result} />
            <div className="flex-1 min-w-0" aria-hidden="true">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-mono">
                  {entry.date ? formatDate(entry.date) : '??/??/????'}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{entry.phase}</span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{entry.title}</p>
              {!previewOnly && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{entry.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
