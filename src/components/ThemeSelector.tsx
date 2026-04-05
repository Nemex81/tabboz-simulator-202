import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeVariant } from '@/lib/types'
import { Sun, Moon, Plant, Palette } from '@phosphor-icons/react'

interface ThemeSelectorProps {
  currentTheme: ThemeVariant
  onThemeChange: (theme: ThemeVariant) => void
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const themes: Array<{
    id: ThemeVariant
    label: string
    description: string
    icon: React.ReactNode
  }> = [
    {
      id: 'default',
      label: 'Default',
      description: 'Tema classico con neon blu e teal',
      icon: <Sun size={32} weight="fill" />
    },
    {
      id: 'dark',
      label: 'Dark',
      description: 'Tema scuro con nero profondo e accenti viola',
      icon: <Moon size={32} weight="fill" />
    },
    {
      id: 'green',
      label: 'Green Ganja',
      description: 'Tema ispirato alla ganja con verdi intensi',
      icon: <Plant size={32} weight="fill" />
    }
  ]

  return (
    <Card className="p-6 border-2 border-primary bg-card">
      <h3 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
        <Palette size={32} weight="fill" />
        TEMA VISIVO
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6">
        Scegli lo stile grafico che preferisci per il gioco. Il tema cambierà immediatamente.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              currentTheme === theme.id
                ? 'border-primary bg-primary/20 shadow-lg'
                : 'border-border bg-muted/30 hover:border-primary/50'
            }`}
            aria-label={`${theme.label}: ${theme.description}. ${currentTheme === theme.id ? 'Tema attualmente selezionato' : 'Clicca per selezionare'}`}
            aria-pressed={currentTheme === theme.id}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={currentTheme === theme.id ? 'text-primary' : 'text-muted-foreground'}>
                {theme.icon}
              </div>
              <div>
                <div className="font-bold text-lg mb-1">
                  {theme.label}
                  {currentTheme === theme.id && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/30 text-primary">
                      ✓ ATTIVO
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {theme.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
        <p>💡 <strong>Suggerimento:</strong> Il tema viene salvato automaticamente e sarà attivo anche alle prossime sessioni di gioco.</p>
      </div>
    </Card>
  )
}
