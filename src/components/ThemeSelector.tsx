import React from 'react'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Plant, Palette } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { ThemeVariant } from '@/lib/types'

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
      label: 'Default Neon Blu',
      description: 'Tema classico con tonalità blu/teal neon',
      icon: <Sun size={32} weight="fill" />
    },
    {
      id: 'dark',
      label: 'Dark Nero Viola',
      description: 'Tema scuro con accenti viola e rosa',
      icon: <Moon size={32} weight="fill" />
    },
    {
      id: 'green',
      label: 'Green Ganja Style',
      description: 'Tema verde terra con accenti ganja',
      icon: <Plant size={32} weight="fill" />
    }
  ]

  return (
    <Card className="p-6 border-2 border-primary bg-card">
      <h3 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
        <Palette size={32} weight="fill" />
        🎨 SELETTORE TEMA
      </h3>
      <p className="text-muted-foreground mb-4">
        Cambia l'aspetto del gioco scegliendo uno dei temi disponibili
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              currentTheme === theme.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted/30 hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={`${currentTheme === theme.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {theme.icon}
              </div>
              <div>
                <h4 className={`font-bold text-lg mb-1 ${currentTheme === theme.id ? 'text-primary' : 'text-foreground'}`}>
                  {theme.label}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {theme.description}
                </p>
              </div>
              {currentTheme === theme.id && (
                <div className="text-xs text-primary font-bold">
                  ✓ Attivo
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
