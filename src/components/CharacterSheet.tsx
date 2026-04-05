import React from 'react'
import { Wrench } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'

export function CharacterSheet() {
  return (
    <div className="space-y-6 mt-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-accent mb-2">🧍 SCHEDA PERSONAGGIO</h2>
        <p className="text-muted-foreground">Il tuo alter ego coatto</p>
      </div>
      <Card className="p-8 border-2 border-accent bg-card flex flex-col items-center gap-6">
        <Wrench size={64} weight="fill" className="text-accent animate-pulse" />
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-accent">🚧 LAVORI IN CORSO 🚧</p>
          <p className="text-muted-foreground text-sm">
            La scheda personaggio è in costruzione.<br />
            Presto troverai qui il tuo profilo completo, lo stile, la storia e molto altro.
          </p>
        </div>
      </Card>
    </div>
  )
}
