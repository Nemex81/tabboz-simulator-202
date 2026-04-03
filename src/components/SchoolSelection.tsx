import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SchoolType, getSchoolTypeName } from '@/lib/types'
import { GraduationCap, Tractor, PaintBrush } from '@phosphor-icons/react'

interface SchoolSelectionProps {
  onSelectSchool: (schoolType: SchoolType) => void
}

export function SchoolSelection({ onSelectSchool }: SchoolSelectionProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-black text-primary neon-text-glow tracking-wider">
            TABBOZ SIMULATOR
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary">
            SCEGLI IL TUO INDIRIZZO
          </h2>
          <p className="text-lg text-muted-foreground">
            La scelta dell'indirizzo determinerà le materie che studierai e gli eventi che incontrerai!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-primary bg-card hover:bg-primary/10 transition-all cursor-pointer group"
            onClick={() => onSelectSchool('tecnico')}>
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
            onClick={() => onSelectSchool('agraria')}>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Tractor size={80} weight="fill" className="text-accent group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-accent">
                {getSchoolTypeName('agraria')}
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
            onClick={() => onSelectSchool('artistico')}>
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

        <div className="bg-muted/30 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            ⚠️ <strong>ATTENZIONE:</strong> La scelta è PERMANENTE! Ogni indirizzo ha materie ed eventi unici!
          </p>
        </div>
      </div>
    </div>
  )
}
