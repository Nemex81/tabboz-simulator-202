import React from 'react'
import { Card } from '@/components/ui/card'

  currentTheme: ThemeVariant

export function ThemeSelector(
    {
      name: 'Default Neon Blu',
 

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
  ]
      description: 'Tema scuro con accenti viola intensi',
    <Card className="p-6 border-2 border-pri
    },
     
      id: 'green',
      name: 'Green Ganja Style',
      description: 'Tema verde terra con vibes rilassate',
      icon: <Plant size={24} weight="fill" />
    }
   

          
    <Card className="p-6 border-2 border-primary bg-card">
      <h3 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
        <Palette size={32} weight="fill" />
        SELETTORE TEMA
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

























