import React from 'react'
import { Palette, Sun, Moon, Plant } from '

  currentTheme: ThemeVariant

export function ThemeSelector(
  currentTheme: ThemeVariant
      name: 'Default Neon Blu',
 

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const themes: Array<{ id: ThemeVariant; name: string; description: string; icon: React.ReactNode }> = [
    {
      id: 'default',
      name: 'Default Neon Blu',
  ]
      icon: <Sun size={24} weight="fill" />
      
    {
      
      name: 'Dark Nero Viola',
      description: 'Tema scuro con accenti viola intensi',
      icon: <Moon size={24} weight="fill" />
      
    {
            <div c
      name: 'Green Ganja Style',
      description: 'Tema verde terra con vibes rilassate',
      icon: <Plant size={24} weight="fill" />
     
  ]

  return (
    <Card className="p-6 border-2 border-primary bg-card">
      <h3 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">

        SELETTORE TEMA


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((theme) => (

            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`p-4 rounded border-2 transition-all hover:scale-105 ${

                ? 'border-primary bg-primary/20 shadow-lg'
                : 'border-border bg-muted/30 hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`${currentTheme === theme.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {theme.icon}

              <div className="text-center">
                <h4 className="font-bold text-sm mb-1">{theme.name}</h4>
                <p className="text-xs text-muted-foreground">{theme.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )

