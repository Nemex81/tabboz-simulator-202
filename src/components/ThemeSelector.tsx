import React from 'react'
import { Button } from '@/components/ui/button'
import { ThemeVariant } from '@/lib/types'
interface ThemeSelectorProps {
import { ThemeVariant } from '@/lib/types'

interface ThemeSelectorProps {
  currentTheme: ThemeVariant
  onThemeChange: (theme: ThemeVariant) => void
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
    {
    id: ThemeVariant
      description
    description: string
    {
  }> = [
    {
      id: 'default',
      label: 'Default Neon Blu',
      description: 'Tema classico con tonalità blu/teal neon',
      description: 'Tema verde terra con ac
    },
  ]
      id: 'dark',
      label: 'Dark Nero Viola',
      description: 'Tema scuro con accenti viola e rosa',
      icon: <Moon size={32} weight="fill" />
    },
     
      id: 'green',
      label: 'Green Ganja Style',
      description: 'Tema verde terra con accenti ganja',
      icon: <Plant size={32} weight="fill" />
    }
   

          
    <Card className="p-6 border-2 border-primary bg-card">
      <h3 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
        <Palette size={32} weight="fill" />
                <h4 class
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
}
                : 'border-border bg-muted/30 hover:border-primary/50'

          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={`${currentTheme === theme.id ? 'text-primary' : 'text-muted-foreground'}`}>






















