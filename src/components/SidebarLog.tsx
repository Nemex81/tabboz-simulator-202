import React from 'react'
import { Card } from '@/components/ui/card'
import { BookOpen, CheckCircle, XCircle, MinusCircle } from '@phosphor-icons/react'
import type { GameLogEntry } from '@/lib/types'

interface SidebarLogProps {
  gameLog: GameLogEntry[]
}

function ResultIcon({ result }: { result: GameLogEntry['result'] }) {
  if (result === 'positive') return <CheckCircle size={14} weight="fill" className="text-secondary shrink-0" aria-hidden="true" />
  if (result === 'negative') return <XCircle size={14} weight="fill" className="text-destructive shrink-0" aria-hidden="true" />
  return <MinusCircle size={14} weight="fill" className="text-muted-foreground shrink-0" aria-hidden="true" />
}

export const SidebarLog = React.memo(function SidebarLog({ gameLog }: SidebarLogProps) {
  const entries = gameLog.slice(0, 8)

  return (
    <Card className="p-4 border-2 border-accent bg-card">
      <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <BookOpen size={18} weight="fill" />
        DIARIO DI BORDO
      </h3>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-4 text-center">
          Nessun evento registrato.
        </p>
      ) : (
        <ul role="list" aria-label="Ultimi eventi registrati" className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              role="listitem"
              className="text-xs flex gap-2 items-start border-b border-border/40 pb-2 last:border-0 last:pb-0"
            >
              <ResultIcon result={entry.result} />
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span className="font-semibold uppercase">{entry.phase}</span>
                  <span>
                    {String(entry.date.day).padStart(2, '0')}/
                    {String(entry.date.month).padStart(2, '0')}
                  </span>
                </div>
                <h4 className="font-bold text-foreground truncate">{entry.title}</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {entry.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
})
