import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeVariant } from '@/lib/types'
import { Sun, Moon, Plant, Palette } from '@phosphor-icons/react'

}
  currentTheme: ThemeVariant
  const themes: Array<{
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
    {
    id: ThemeVariant
      description
    description: string
      label: 'Green Ganja
      ic
  ]
  return (
      <h3 className="te
        TEMA VISIVO
      
      

        {themes.m
            key={the
            className={`p-6 rounded-lg border-2 transition-all tex
                ? 'border-primary bg-primary
      
     
            <div c
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


























