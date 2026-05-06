import React from 'react'
import { Trophy, ShieldWarning } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/ThemeSelector'
import type { ThemeVariant, PlayerProfile, SchoolType } from '@/lib/types'

interface StatusTabProps {
  currentTheme: ThemeVariant
  onThemeChange: (theme: ThemeVariant) => void
  schoolYear: number
  playerProfile: PlayerProfile | null
  schoolType: SchoolType | null
  age: number
  onResetRequest: () => void
}

export function StatusTab({
  currentTheme,
  onThemeChange,
  schoolYear,
  playerProfile,
  schoolType,
  age,
  onResetRequest,
}: StatusTabProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">⚙️ PANNELLO DI CONTROLLO</h2>
        <p className="text-muted-foreground">Gestisci le impostazioni del gioco</p>
      </div>

      <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />

      <Card className="p-6 border-2 border-accent bg-card">
        <h3 className="text-2xl font-bold mb-4 text-accent flex items-center gap-2">
          <Trophy size={32} weight="fill" />
          🎯 OBIETTIVO DEL GIOCO
        </h3>
        <p className="text-foreground mb-3">
          Completa tutti e 5 gli anni di scuola superiore e supera la MATURITÀ per vincere!
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schoolYear >= 1 ? 'bg-accent' : 'bg-muted'}`} />
            <span className={schoolYear === 1 ? 'text-accent font-bold' : ''}>
              1° Superiore (14 anni)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schoolYear >= 2 ? 'bg-accent' : 'bg-muted'}`} />
            <span className={schoolYear === 2 ? 'text-accent font-bold' : ''}>
              2° Superiore (15 anni)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schoolYear >= 3 ? 'bg-accent' : 'bg-muted'}`} />
            <span className={schoolYear === 3 ? 'text-accent font-bold' : ''}>
              3° Superiore (16 anni)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schoolYear >= 4 ? 'bg-accent' : 'bg-muted'}`} />
            <span className={schoolYear === 4 ? 'text-accent font-bold' : ''}>
              4° Superiore (17 anni)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schoolYear >= 5 ? 'bg-accent' : 'bg-muted'}`} />
            <span className={schoolYear === 5 ? 'text-accent font-bold' : ''}>
              5° Superiore - MATURITÀ (18 anni)
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            ⚠️ <strong>Attenzione:</strong> Se la tua media scende sotto il 6 alla pagella, sarai BOCCIATO e il gioco finirà!
          </p>
        </div>
      </Card>

      <Card className="p-6 border-2 border-destructive bg-card">
        <h3 className="text-2xl font-bold mb-4 text-destructive flex items-center gap-2">
          <ShieldWarning size={32} weight="fill" />
          GESTIONE GIOCO
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-bold text-lg mb-2">📊 Stato Salvataggio</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Il gioco salva automaticamente ogni tua azione. I tuoi progressi sono sempre al sicuro!
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Anno scolastico: <strong className="text-primary">{schoolYear}°</strong></p>
              <p>✓ Giocatore: <strong className="text-primary">{playerProfile?.name}</strong></p>
              <p>✓ Indirizzo: <strong className="text-primary">{schoolType?.toUpperCase()}</strong></p>
              <p>✓ Età: <strong className="text-primary">{age} anni</strong></p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button
              onClick={onResetRequest}
              variant="outline"
              size="lg"
              className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground w-full md:w-auto"
            >
              🔄 Reset Gioco Completo (Ctrl+R)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Attenzione: questa azione cancellerà TUTTA la tua progressione!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
