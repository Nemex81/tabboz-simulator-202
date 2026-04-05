import React from 'react'
import { IdentificationCard, Star, Trophy, GraduationCap } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GameStats, SchoolType, SchoolRecord } from '@/lib/types'
import { getReputationLevel } from '@/lib/game-utils'

interface CharacterSheetProps {
  playerProfile: { name: string; gender: 'maschio' | 'femmina' } | null
  stats: GameStats
  schoolType: SchoolType | null
  schoolYear: number
  age: number
  schoolRecord: SchoolRecord
  currentMedia: number
}

export function CharacterSheet({
  playerProfile,
  stats,
  schoolType,
  schoolYear,
  age,
  schoolRecord,
  currentMedia,
}: CharacterSheetProps) {
  return (
    <Tabs defaultValue="profilo" className="w-full mt-6">
      <TabsList className="grid w-full grid-cols-4 gap-1 bg-muted/50 p-1 h-auto mb-6">
        <TabsTrigger value="profilo">
          <IdentificationCard size={18} className="mr-1" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline">Profilo</span>
          <span className="sm:hidden">👤</span>
        </TabsTrigger>
        <TabsTrigger value="aspetto" disabled aria-label="Aspetto: non ancora disponibile">
          <span className="hidden sm:inline">Aspetto</span>
          <span className="sm:hidden">👕</span>
          <span className="ml-1 text-xs opacity-50">🔜</span>
        </TabsTrigger>
        <TabsTrigger value="diario" disabled aria-label="Diario: non ancora disponibile">
          <span className="hidden sm:inline">Diario</span>
          <span className="sm:hidden">📓</span>
          <span className="ml-1 text-xs opacity-50">🔜</span>
        </TabsTrigger>
        <TabsTrigger value="obiettivi" disabled aria-label="Obiettivi: non ancora disponibile">
          <span className="hidden sm:inline">Obiettivi</span>
          <span className="sm:hidden">🏆</span>
          <span className="ml-1 text-xs opacity-50">🔜</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profilo">
        <div className="space-y-6">

      {/* Sezione 1 — Intestazione */}
      <section aria-labelledby="cs-title">
        <Card className="p-6 border-2 border-accent bg-card">
          <h2 id="cs-title" className="text-3xl font-bold text-accent mb-4 flex items-center gap-2">
            <IdentificationCard size={32} weight="fill" aria-hidden="true" />
            SCHEDA PERSONAGGIO
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted-foreground">Nome</dt><dd className="font-bold text-foreground">{playerProfile?.name ?? '—'}</dd></div>
            <div><dt className="text-muted-foreground">Età</dt><dd className="font-bold text-foreground">{age} anni</dd></div>
            <div><dt className="text-muted-foreground">Genere</dt><dd className="font-bold text-foreground">{playerProfile?.gender === 'maschio' ? 'Maschio' : 'Femmina'}</dd></div>
            <div><dt className="text-muted-foreground">Indirizzo</dt><dd className="font-bold text-foreground">{schoolType?.toUpperCase() ?? '—'}</dd></div>
            <div><dt className="text-muted-foreground">Anno scolastico</dt><dd className="font-bold text-foreground">{schoolYear}° superiore</dd></div>
            <div><dt className="text-muted-foreground">Media voti</dt><dd className={`font-bold ${currentMedia < 6 ? 'text-destructive' : 'text-secondary'}`}>{currentMedia.toFixed(1)} su 10</dd></div>
          </dl>
        </Card>
      </section>

      {/* Sezione 2 — Statistiche */}
      <section aria-labelledby="cs-stats-title">
        <Card className="p-6 border-2 border-primary bg-card">
          <h3 id="cs-stats-title" className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Star size={24} weight="fill" aria-hidden="true" />
            STATISTICHE
          </h3>
          <ul role="list" className="space-y-3">
            {([
              ['Intelligenza', stats.intelligenza, 'text-secondary'],
              ['Figosità', stats.figosita, 'text-accent'],
              ['Coattaggine', stats.coattaggine, 'text-primary'],
              ['Muscoli', stats.muscoli, 'text-secondary'],
              ['Carisma', stats.carisma, 'text-accent'],
              ['Stanchezza', stats.stanchezza, 'text-destructive'],
              ['Stress', stats.stress ?? 0, 'text-destructive'],
              ['Morale', stats.morale ?? 60, 'text-accent'],
              ['Reputazione', stats.reputazione, 'text-primary'],
              ['Soldi', stats.soldi, 'text-secondary'],
            ] as [string, number, string][]).map(([label, value, color]) => (
              <li key={label} role="listitem" className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
                <div
                  className="flex-1 h-2 bg-muted rounded-full overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(100, (value / (label === 'Soldi' ? 1000 : 100)) * 100)}%` }}
                  />
                </div>
                <span
                  className={`text-sm font-bold w-16 text-right ${color}`}
                  aria-label={`${label === 'Stanchezza' ? 'Stanchezza fisica' : label}: ${label === 'Soldi' ? `${value} euro` : `${value} su 100`}`}
                >
                  {label === 'Soldi' ? `${value}€` : `${value} / 100`}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Sezione 3 — Reputazione */}
      <section aria-labelledby="cs-rep-title">
        <Card className="p-6 border-2 border-accent bg-card">
          <h3 id="cs-rep-title" className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
            <Trophy size={24} weight="fill" aria-hidden="true" />
            REPUTAZIONE
          </h3>
          {(() => {
            const repLevel = getReputationLevel(stats.reputazione)
            return (
              <div>
                <p
                  aria-label={`Livello reputazione: ${repLevel.label}. Punteggio: ${stats.reputazione} su 100.`}
                  className="text-2xl font-black text-accent mb-2"
                >
                  {repLevel.label}
                </p>
                <p className="text-sm text-muted-foreground">{repLevel.description}</p>
                <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden" aria-hidden="true">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${stats.reputazione}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stats.reputazione} / 100 punti</p>
              </div>
            )
          })()}
        </Card>
      </section>

      {/* Sezione 4 — Storico Scolastico */}
      <section aria-labelledby="cs-school-title">
        <Card className="p-6 border-2 border-secondary bg-card">
          <h3 id="cs-school-title" className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
            <GraduationCap size={24} weight="fill" aria-hidden="true" />
            STORICO SCOLASTICO
          </h3>
          <dl
            role="table"
            aria-label="Dati disciplinari anno corrente"
            className="grid grid-cols-2 gap-4"
          >
            <div role="row">
              <dt role="columnheader" className="text-sm text-muted-foreground">Condotta</dt>
              <dd
                role="cell"
                aria-label={`Condotta: ${schoolRecord.condotta.toFixed(1)} su 10${schoolRecord.condotta < 6 ? ', insufficiente' : ''}`}
                className={`text-2xl font-bold ${schoolRecord.condotta < 6 ? 'text-destructive' : 'text-primary'}`}
              >
                {schoolRecord.condotta.toFixed(1)}
              </dd>
            </div>
            <div role="row">
              <dt role="columnheader" className="text-sm text-muted-foreground">Assenze</dt>
              <dd
                role="cell"
                aria-label={`Assenze: ${schoolRecord.assenze}${schoolRecord.assenze >= 25 ? ', attenzione soglia critica' : ''}`}
                className={`text-2xl font-bold ${schoolRecord.assenze >= 25 ? 'text-destructive' : 'text-foreground'}`}
              >
                {schoolRecord.assenze}
              </dd>
            </div>
            <div role="row">
              <dt role="columnheader" className="text-sm text-muted-foreground">Note</dt>
              <dd role="cell" className="text-2xl font-bold text-foreground">{schoolRecord.note}</dd>
            </div>
            <div role="row">
              <dt role="columnheader" className="text-sm text-muted-foreground">Sospensioni</dt>
              <dd
                role="cell"
                className={`text-2xl font-bold ${schoolRecord.sospensioni > 0 ? 'text-destructive' : 'text-foreground'}`}
              >
                {schoolRecord.sospensioni}
              </dd>
            </div>
          </dl>
        </Card>
      </section>

        </div>
      </TabsContent>
    </Tabs>
  )
}
