import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Palette, Sun, Moon, Plant } from '@phosphor-icons/react'
import type { ThemeVariant } from '@/lib/types'

interface ThemeSelectorProps {
  currentTheme: ThemeVariant
  onThemeChange: (theme: ThemeVariant) => void
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const themes: Array<{ id: ThemeVariant; name: string; description: string; icon: React.ReactNode }> = [
    {
      id: 'default',
      name: 'Default Neon Blu',
      description: 'Tema classico con neon blu e teal',
      icon: <Sun size={24} weight="fill" />
    },
    {
      id: 'dark',
      name: 'Dark Nero Viola',
      description: 'Tema scuro con accenti viola intensi',
      icon: <Moon size={24} weight="fill" />
    },
    {
      id: 'green',
      name: 'Green Ganja Style',
      description: 'Tema verde terra con vibes rilassate',
      icon: <Plant size={24} weight="fill" />
    }
  ]

  return (
    <Card className="p-6 border-2 border-primary bg-card">
      <h3 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
        <Palette size={32} weight="fill" />
        SELETTORE TEMA
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <Button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            variant={currentTheme === theme.id ? 'default' : 'outline'}
            className={`h-auto flex flex-col items-center gap-3 p-4 ${
              currentTheme === theme.id
                ? 'bg-primary text-primary-foreground border-2 border-primary'
                : 'border-2 border-border hover:border-primary'
            }`}
          >
            <div className="text-3xl">{theme.icon}</div>
            <div className="text-center">
              <div className="font-bold text-base mb-1">{theme.name}</div>
              <div className="text-xs opacity-80">{theme.description}</div>
            </div>
            {currentTheme === theme.id && (
              <div className="text-xs font-bold">✓ ATTIVO</div>
            )}
          </Button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <p>💡 Cambia il tema per personalizzare l'aspetto del gioco! I colori e lo stile cambieranno immediatamente.</p>
      </div>
    </Card>
  )
}
