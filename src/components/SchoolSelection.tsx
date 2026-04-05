import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SchoolType, getSchoolTypeName, PlayerProfile, ThemeVariant } from '@/lib/types'
import { GraduationCap, Tractor, PaintBrush, User, GenderMale, GenderFemale, Palette, Moon, Sun, Plant } from '@phosphor-icons/react'

interface SchoolSelectionProps {
  onSelectSchool: (schoolType: SchoolType, profile: PlayerProfile, theme: ThemeVariant) => void
}

export function SchoolSelection({ onSelectSchool }: SchoolSelectionProps) {
  const [step, setStep] = useState<'profile' | 'school'>('profile')
  const [playerName, setPlayerName] = useState('')
  const [playerGender, setPlayerGender] = useState<'maschio' | 'femmina' | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<ThemeVariant>('default')

  useEffect(() => {
    const htmlElement = document.querySelector('html')
    if (htmlElement) {
      htmlElement.setAttribute('data-theme', selectedTheme)
    }
  }, [selectedTheme])

  const handleProfileComplete = () => {
    if (playerName.trim() && playerGender) {
      setStep('school')
    }
  }

  const handleSchoolSelect = (schoolType: SchoolType) => {
    if (playerName.trim() && playerGender) {
      const profile: PlayerProfile = {
        name: playerName.trim(),
        gender: playerGender,
        traits: []
      }
      onSelectSchool(schoolType, profile, selectedTheme)
    }
  }

  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-5xl md:text-6xl font-black text-primary neon-text-glow tracking-wider">
              TABBOZ SIMULATOR
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary">
              CREA IL TUO PERSONAGGIO
            </h2>
            <p className="text-lg text-muted-foreground">
              Inizia la tua avventura da coatto! Chi sei?
            </p>
          </div>

          <Card className="p-8 border-2 border-primary bg-card">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="player-name" className="text-lg font-bold text-primary flex items-center gap-2">
                  <User size={24} weight="fill" />
                  Come ti chiami?
                </Label>
                <Input
                  id="player-name"
                  type="text"
                  placeholder="Inserisci il tuo nome..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-lg h-12 border-2 border-primary"
                  maxLength={20}
                  aria-label="Inserisci il tuo nome. Massimo 20 caratteri."
                  autoFocus
                />
                {playerName.trim() && (
                  <p className="text-sm text-muted-foreground">
                    ✓ Nome: <strong className="text-primary">{playerName}</strong>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-bold text-primary">
                  Sei maschio o femmina?
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={playerGender === 'maschio' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setPlayerGender('maschio')}
                    className={`h-20 text-lg ${playerGender === 'maschio' ? 'bg-primary border-2 border-primary' : 'border-2'}`}
                    aria-label="Seleziona sesso: Maschio"
                  >
                    <GenderMale size={32} weight="fill" className="mr-2" />
                    Maschio
                  </Button>
                  <Button
                    variant={playerGender === 'femmina' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setPlayerGender('femmina')}
                    className={`h-20 text-lg ${playerGender === 'femmina' ? 'bg-primary border-2 border-primary' : 'border-2'}`}
                    aria-label="Seleziona sesso: Femmina"
                  >
                    <GenderFemale size={32} weight="fill" className="mr-2" />
                    Femmina
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-bold text-primary flex items-center gap-2">
                  <Palette size={24} weight="fill" />
                  Scegli il tema visivo
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={selectedTheme === 'default' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setSelectedTheme('default')}
                    className={`h-20 flex-col text-sm ${selectedTheme === 'default' ? 'bg-primary border-2 border-primary' : 'border-2'}`}
                    aria-label="Tema Default: Neon blu e teal"
                  >
                    <Sun size={28} weight="fill" className="mb-1" />
                    Default
                    <span className="text-xs opacity-70">Neon Blu</span>
                  </Button>
                  <Button
                    variant={selectedTheme === 'dark' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setSelectedTheme('dark')}
                    className={`h-20 flex-col text-sm ${selectedTheme === 'dark' ? 'bg-primary border-2 border-primary' : 'border-2'}`}
                    aria-label="Tema Dark: Nero profondo con accenti viola"
                  >
                    <Moon size={28} weight="fill" className="mb-1" />
                    Dark
                    <span className="text-xs opacity-70">Nero Viola</span>
                  </Button>
                  <Button
                    variant={selectedTheme === 'green' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setSelectedTheme('green')}
                    className={`h-20 flex-col text-sm ${selectedTheme === 'green' ? 'bg-primary border-2 border-primary' : 'border-2'}`}
                    aria-label="Tema Green: Ispirato alla ganja con verdi e marroni"
                  >
                    <Plant size={28} weight="fill" className="mb-1" />
                    Green
                    <span className="text-xs opacity-70">Ganja Style</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  💡 Potrai cambiare il tema in seguito dal Pannello di Controllo
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleProfileComplete}
                  disabled={!playerName.trim() || !playerGender}
                  size="lg"
                  className="w-full h-14 text-lg bg-accent hover:bg-accent/90"
                  aria-label={!playerName.trim() || !playerGender ? 'Compila nome e sesso per continuare' : 'Continua alla selezione scuola'}
                >
                  CONTINUA →
                </Button>
              </div>
            </div>
          </Card>

          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              ⚠️ <strong>ATTENZIONE:</strong> Il nome e il sesso non possono essere cambiati dopo!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-black text-primary neon-text-glow tracking-wider">
            TABBOZ SIMULATOR
          </h1>
          <div className="flex items-center justify-center gap-3 text-xl text-secondary font-bold">
            <User size={28} weight="fill" />
            <span>Giocatore: {playerName}</span>
            <span className="text-muted-foreground">•</span>
            <span>{playerGender === 'maschio' ? '♂' : '♀'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary">
            SCEGLI IL TUO INDIRIZZO
          </h2>
          <p className="text-lg text-muted-foreground">
            La scelta dell'indirizzo determinerà le materie che studierai e gli eventi che incontrerai!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-primary bg-card hover:bg-primary/10 transition-all cursor-pointer group"
            onClick={() => handleSchoolSelect('tecnico')}>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <GraduationCap size={80} weight="fill" className="text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-primary">
                {getSchoolTypeName('tecnico')}
              </h3>
              <p className="text-sm text-muted-foreground">
                Informatica, Elettronica, Meccanica, Sistemi e altre materie tecniche
              </p>
              <div className="pt-4">
                <Button className="w-full bg-primary" size="lg">
                  SCEGLI TECNICO
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p>✓ 12 Materie tecniche</p>
                <p>✓ Eventi laboratorio</p>
                <p>✓ Progetti pratici</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-accent bg-card hover:bg-accent/10 transition-all cursor-pointer group"
            onClick={() => handleSchoolSelect('agrario')}>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Tractor size={80} weight="fill" className="text-accent group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-accent">
                {getSchoolTypeName('agrario')}
              </h3>
              <p className="text-sm text-muted-foreground">
                Agronomia, Zootecnia, Botanica, Ecologia e gestione aziendale agricola
              </p>
              <div className="pt-4">
                <Button className="w-full bg-accent" size="lg">
                  SCEGLI AGRARIA
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p>✓ 12 Materie agricole</p>
                <p>✓ Lavoro in serra</p>
                <p>✓ Gestione animali</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-secondary bg-card hover:bg-secondary/10 transition-all cursor-pointer group"
            onClick={() => handleSchoolSelect('artistico')}>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <PaintBrush size={80} weight="fill" className="text-secondary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-secondary">
                {getSchoolTypeName('artistico')}
              </h3>
              <p className="text-sm text-muted-foreground">
                Disegno, Pittura, Scultura, Storia dell'Arte e discipline creative
              </p>
              <div className="pt-4">
                <Button className="w-full bg-secondary" size="lg">
                  SCEGLI ARTISTICO
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p>✓ 12 Materie artistiche</p>
                <p>✓ Progetti creativi</p>
                <p>✓ Mostre d'arte</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setStep('profile')}
            className="border-2"
          >
            ← Torna indietro
          </Button>
          <div className="bg-muted/30 rounded-lg px-4 py-2 text-center flex-1 mx-4">
            <p className="text-sm text-muted-foreground">
              ⚠️ <strong>ATTENZIONE:</strong> La scelta è PERMANENTE! Ogni indirizzo ha materie ed eventi unici!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
