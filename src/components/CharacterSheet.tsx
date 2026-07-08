import React from 'react'
import { 
  IdentificationCard, 
  Star, 
  Trophy, 
  GraduationCap, 
  BookOpen, 
  Heart, 
  UsersThree,
  Chats,
  Laptop,
  UserCircle,
  Sliders,
  Sparkle
} from '@phosphor-icons/react'
import { ActionButton } from '@/components/ActionButton'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GameStats, SchoolType, SchoolRecord, GameLogEntry, HealthRecord, SubjectGrades, Friend, Relationship, NarrativePlayerGender, CharacterActivities } from '@/lib/types'
import { getReputationLevel } from '@/lib/game-utils'
import { DiaryPanel } from '@/components/DiaryPanel'
import { HealthRecordPanel } from '@/components/HealthRecordPanel'
import { GradeProgressPanel } from '@/components/GradeProgressPanel'
import { FriendshipsPanel } from '@/components/FriendshipsPanel'
import { RelationshipsPanel } from '@/components/RelationshipsPanel'
import type { ActivePartner } from '@/lib/girlfriend-system'
import { getCharacterGenderLabel, getSexualOrientationLabel } from '@/lib/gender-utils'
import { ARCHETYPES } from '@/lib/school-activities'

interface CharacterSheetProps {
  playerProfile: import('@/lib/types').PlayerProfile | null
  stats: GameStats
  schoolType: SchoolType | null
  schoolYear: number
  age: number
  schoolRecord: SchoolRecord
  currentMedia: number
  gameLog: GameLogEntry[]
  healthRecord: HealthRecord
  grades: SubjectGrades
  gradesHistory: Record<number, SubjectGrades>
  // --- Relazioni ---
  friends: Friend[]
  relationships: Relationship[]
  actionsRemaining: number
  interactionsRemaining: number
  onFriendAction: (friendId: string, actionId: string) => void
  onRelationInteraction?: (friendId: string, interactionId: string) => void
  activePartners: ActivePartner[]
  onGirlfriendAction: (action: string, partnerKey?: string) => void
  onGirlfriendBreakup: (partnerKey?: string) => void
  onTryRelationship: (relationshipId: string) => void
  onChiacchiera: () => void
  onNavigaOnline: () => void
  onTelefona: () => void
  onRimorchia: () => void
  playerGender: NarrativePlayerGender
  activities: CharacterActivities
  onUpdateActivities: (activities: CharacterActivities) => void
}

export const CharacterSheet = React.memo(function CharacterSheet({
  playerProfile,
  stats,
  schoolType,
  schoolYear,
  age,
  schoolRecord,
  currentMedia,
  gameLog,
  healthRecord,
  grades,
  gradesHistory,
  friends,
  relationships,
  actionsRemaining,
  interactionsRemaining,
  onFriendAction,
  onRelationInteraction,
  activePartners,
  onGirlfriendAction,
  onGirlfriendBreakup,
  onTryRelationship,
  onChiacchiera,
  onNavigaOnline,
  onTelefona,
  onRimorchia,
  playerGender,
  activities,
  onUpdateActivities,
}: CharacterSheetProps) {
  return (
    <Tabs defaultValue="profilo" className="w-full mt-6">
      <TabsList className="flex w-full items-center justify-start gap-1 bg-muted/50 p-1 h-auto mb-6 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
        <TabsTrigger value="profilo" className="flex-1 min-w-[75px] sm:min-w-[100px]" aria-label="Profilo: informazioni personaggio">
          <IdentificationCard size={18} className="mr-1" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline">Profilo</span>
          <span className="sm:hidden">👤</span>
        </TabsTrigger>
        <TabsTrigger value="scuola" className="flex-1 min-w-[75px] sm:min-w-[100px]" aria-label="Scuola: voti e materie">
          <GraduationCap size={18} className="mr-1" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline">Scuola</span>
          <span className="sm:hidden">🎓</span>
        </TabsTrigger>
        <TabsTrigger value="relazioni" className="flex-1 min-w-[75px] sm:min-w-[100px]" aria-label="Relazioni: amicizie e partner">
          <UsersThree size={18} className="mr-1" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline">Relazioni</span>
          <span className="sm:hidden">👥</span>
        </TabsTrigger>
        <TabsTrigger value="azioni" className="flex-1 min-w-[75px] sm:min-w-[100px]" aria-label="Azioni: attività e socializzazione">
          <Chats size={18} className="mr-1" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline">Azioni</span>
          <span className="sm:hidden">💬</span>
        </TabsTrigger>
        <TabsTrigger value="diario" className="flex-1 min-w-[75px] sm:min-w-[100px]" aria-label="Diario: eventi recenti">
          <BookOpen size={18} className="mr-1" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline">Diario</span>
          <span className="sm:hidden">📓</span>
        </TabsTrigger>
        <TabsTrigger value="salute" className="flex-1 min-w-[75px] sm:min-w-[100px]" aria-label="Salute: condizioni attive">
          <Heart size={18} className="mr-1" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline">Salute</span>
          <span className="sm:hidden">❤️</span>
        </TabsTrigger>
        <TabsTrigger value="attivita" className="flex-1 min-w-[75px] sm:min-w-[100px]" aria-label="Attività: routine e condotta">
          <Sliders size={18} className="mr-1" weight="fill" aria-hidden="true" />
          <span className="hidden sm:inline">Attività</span>
          <span className="sm:hidden">⚙️</span>
        </TabsTrigger>
        <TabsTrigger value="obiettivi" disabled className="flex-1 min-w-[75px] sm:min-w-[100px]" aria-label="Obiettivi: traguardi (non ancora disponibile)">
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
            <div><dt className="text-muted-foreground">Genere</dt><dd className="font-bold text-foreground">{playerProfile ? getCharacterGenderLabel(playerProfile.gender) : '—'}</dd></div>
            <div><dt className="text-muted-foreground">Orientamento</dt><dd className="font-bold text-foreground">{playerProfile ? getSexualOrientationLabel(playerProfile.orientamentoSessuale) : '—'}</dd></div>
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
              ['Salute', stats.salute ?? 100, 'text-primary'],
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

      {/* Sezione 5 — Anteprima Diario */}
      <section aria-labelledby="cs-diary-preview-title">
        <Card className="p-4 border-2 border-muted bg-card">
          <h3 id="cs-diary-preview-title" className="text-lg font-bold text-muted-foreground mb-3 flex items-center gap-2">
            <BookOpen size={20} weight="fill" aria-hidden="true" />
            ULTIMI EVENTI
          </h3>
          <DiaryPanel gameLog={gameLog} previewOnly={true} />
        </Card>
      </section>

        </div>
      </TabsContent>

      <TabsContent value="relazioni">
        <div className="mt-2 space-y-6">
          <FriendshipsPanel
              playerProfile={playerProfile}
            friends={friends}
            stats={stats}
            interactionsRemaining={interactionsRemaining}
            onFriendAction={onFriendAction}
            onRelationInteraction={onRelationInteraction}
            activePartners={activePartners}
            onGirlfriendAction={onGirlfriendAction}
            onGirlfriendBreakup={onGirlfriendBreakup}
          />
          <RelationshipsPanel
              playerProfile={playerProfile}
            relationships={relationships}
            stats={stats}
            onTryRelationship={onTryRelationship}
            actionsRemaining={actionsRemaining}
          />
        </div>
      </TabsContent>

      <TabsContent value="diario">
        <div className="mt-2">
          <DiaryPanel gameLog={gameLog} previewOnly={false} />
        </div>
      </TabsContent>

      <TabsContent value="scuola">
        <div className="mt-2 space-y-6">
          {schoolType ? (
            <>
              <GradeProgressPanel
                grades={grades}
                schoolType={schoolType}
                schoolYear={schoolYear}
              />
              {Object.keys(gradesHistory).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                    Storico anni precedenti
                  </h4>
                  {Object.entries(gradesHistory)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([year, histGrades]) => {
                      const avg = Object.values(histGrades).length
                        ? (Object.values(histGrades).reduce((s, v) => s + v, 0) / Object.values(histGrades).length).toFixed(1)
                        : '—'
                      return (
                        <div key={year} className="flex items-center justify-between px-2 py-1.5 rounded bg-muted/20 text-sm">
                          <span className="text-muted-foreground">Anno {year}°</span>
                          <span className="font-semibold">{avg}</span>
                        </div>
                      )
                    })}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Seleziona prima un indirizzo scolastico.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="azioni">
        <div className="grid md:grid-cols-2 gap-6 mt-2">
          {/* Socializza */}
          <Card className="p-4 border-2 border-primary bg-card">
            <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
              <Chats size={24} weight="fill" />
              SOCIALIZZA
            </h3>
            <div className="space-y-3">
              <ActionButton
                icon={<Chats size={40} />}
                label="Chiacchiera"
                onClick={onChiacchiera}
                disabled={actionsRemaining <= 0}
                blockedReason={actionsRemaining <= 0 ? 'Nessuna azione per questa fascia oraria' : undefined}
                variant="secondary"
                ariaLabel="Chiacchiera con qualcuno. Gratis. Aumenta Carisma e Reputazione."
                helpText="Chiacchiera con qualcuno per strada. Aumenta il Carisma di 5 e la Reputazione di 3."
              />
              <ActionButton
                icon={<Laptop size={40} />}
                label="Naviga Online"
                onClick={onNavigaOnline}
                disabled={actionsRemaining <= 0}
                blockedReason={actionsRemaining <= 0 ? 'Nessuna azione per questa fascia oraria' : undefined}
                variant="secondary"
                ariaLabel="Naviga online e socializza in rete. Gratis. Aumenta Carisma e di poco la Reputazione."
                helpText="Usa il PC per chattare e navigare. Aumenta il Carisma di 4, la Reputazione di 1 e può farti conoscere nuovi amici online."
              />
              <ActionButton
                icon={<UserCircle size={40} />}
                label="Telefona ad un amico"
                onClick={onTelefona}
                disabled={actionsRemaining <= 0 || friends.length === 0}
                blockedReason={
                  actionsRemaining <= 0 
                    ? 'Nessuna azione per questa fascia oraria' 
                    : friends.length === 0 
                    ? 'Non hai nessun amico in rubrica da chiamare!' 
                    : undefined
                }
                variant="secondary"
                ariaLabel="Telefona a un amico. Gratis. Richiede amici in rubrica."
                helpText="Fai una chiamata ad un amico della tua rubrica. Aumenta il Carisma di 3."
              />
            </div>
          </Card>

          {/* Rimorchia */}
          <Card className="p-4 border-2 border-accent bg-card flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
                <Heart size={24} weight="fill" />
                RIMORCHIA
              </h3>
              <ActionButton
                icon={<Heart size={40} />}
                label="Rimorchia nel quartiere"
                shortcut="Ctrl+9"
                onClick={onRimorchia}
                disabled={actionsRemaining <= 0}
                blockedReason={actionsRemaining <= 0 ? 'Nessuna azione per questa fascia oraria' : undefined}
                variant="default"
                ariaLabel={`Prova a rimorchiare qualcuno nel quartiere. Fondi attuali: ${stats.soldi} euro. Tasto rapido: Ctrl+9`}
                helpText="Prova a fare colpo su qualcuno nel quartiere. Se ci riesci avvierai una conoscenza romantica. Se fallisci perderai un po' di morale e figosità."
              />
            </div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground italic">
              💡 Spostati in discoteca o al cinema per sbloccare altri modi di socializzazione e divertimento!
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="salute">
        <div className="mt-2">
          <HealthRecordPanel healthRecord={healthRecord} gameLog={gameLog} />
        </div>
      </TabsContent>

      <TabsContent value="attivita">
        <div className="space-y-6">
          <Card className="p-6 border-2 border-primary bg-card/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2 mb-2">
              <Sliders size={28} weight="fill" aria-hidden="true" />
              Attività Automatiche & Condotta
            </h2>
            <p className="text-sm text-muted-foreground">
              Configura il comportamento del tuo personaggio per automatizzare o assistere le attività scolastiche ricorrenti. La struttura è predisposta per accogliere in seguito anche lavoro e tempo libero.
            </p>
          </Card>

          {/* Sotto-sezione Scuola */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colonna 1: Modalità & Archetipi */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Modalità di Esecuzione */}
              <Card className="p-5 border border-border bg-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  ⚙️ Modalità Risoluzione Scolastica
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'manuale', title: 'Manuale', desc: 'Risolvi ora per ora compiendo manualmente le scelte ed il break.' },
                    { key: 'assistita', title: 'Assistita', desc: 'La scuola scorre ora per ora, ma le scelte degli eventi sono automatiche.' },
                    { key: 'rapida', title: 'Rapida (In blocco)', desc: 'La scuola si risolve istantaneamente con un resoconto finale.' }
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => {
                        const next = { ...activities }
                        next.school.mode = m.key as any
                        onUpdateActivities(next)
                      }}
                      className={`p-3 border rounded-lg text-left transition-all flex flex-col justify-between ${
                        activities.school.mode === m.key
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                          : 'border-border bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <span className="font-bold text-sm capitalize">{m.title}</span>
                      <span className="text-xs text-muted-foreground mt-1">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Card 2: Archetipi Preimpostati */}
              <Card className="p-5 border border-border bg-card">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  🎭 Archetipi Condotta Scolastica
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Seleziona un archetipo per impostare rapidamente i comportamenti automatici del personaggio.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'secchione', label: 'Secchioni opportunista', icon: '📚' },
                    { key: 'tamarro', label: 'Tamaro disciplinato', icon: '🔥' },
                    { key: 'fancazzista', label: 'Fancazzista invisibile', icon: '💤' },
                    { key: 'casino', label: 'Casinanò organizzato', icon: '📣' },
                    { key: 'bullo', label: 'Bullo sociale', icon: '💪' },
                    { key: 'mediatore', label: 'Mediatore paraculo', icon: '🤝' },
                    { key: 'randagio', label: 'Randagio di Torre', icon: '🚶' }
                  ].map((arch) => (
                    <button
                      key={arch.key}
                      onClick={() => {
                        const defaults = ARCHETYPES[arch.key as keyof typeof ARCHETYPES]
                        if (defaults) {
                          const next = { ...activities }
                          next.school = {
                            ...next.school,
                            archetype: arch.key as any,
                            ...defaults
                          }
                          onUpdateActivities(next)
                        }
                      }}
                      className={`p-3 border rounded-lg text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        activities.school.archetype === arch.key
                          ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
                          : 'border-border bg-muted/15 hover:bg-muted/30'
                      }`}
                    >
                      <span className="text-2xl" aria-hidden="true">{arch.icon}</span>
                      <span className="text-xs font-bold leading-tight">{arch.label}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Colonna 2: Preferenze Dettagliate */}
            <Card className="p-5 border border-border bg-card space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                🔧 Condotta Personalizzata
              </h3>
              
              {/* Aula Didattica */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  📖 Comportamento Didattico
                </label>
                <select
                  value={activities.school.aulaDidattica}
                  onChange={(e) => {
                    const next = { ...activities }
                    next.school.aulaDidattica = e.target.value as any
                    next.school.archetype = 'custom'
                    onUpdateActivities(next)
                  }}
                  className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="impegno">Impegnati al massimo (+Studio)</option>
                  <option value="copia">Copia dai compagni (+Furbizia)</option>
                  <option value="invisibile">Fai finta di nulla (Nessun rischio)</option>
                  <option value="disturbo">Casino e Disturbo (+Coatto)</option>
                </select>
              </div>

              {/* Aula Sociale */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  👥 Comportamento Sociale
                </label>
                <select
                  value={activities.school.aulaSociale}
                  onChange={(e) => {
                    const next = { ...activities }
                    next.school.aulaSociale = e.target.value as any
                    next.school.archetype = 'custom'
                    onUpdateActivities(next)
                  }}
                  className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="sfida">Sfida a muso duro (Faccia a faccia)</option>
                  <option value="collabora">Collabora ed aiuta (+Amicizia)</option>
                  <option value="opportunista">Opportunismo e profitto</option>
                  <option value="evita">Evita rogne e scappa</option>
                </select>
              </div>

              {/* Gestione Intervallo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  ☕ Gestione Intervallo
                </label>
                <select
                  value={activities.school.intervalloMode}
                  onChange={(e) => {
                    const next = { ...activities }
                    next.school.intervalloMode = e.target.value as any
                    next.school.archetype = 'custom'
                    onUpdateActivities(next)
                  }}
                  className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="studia">Ripassa ed interroga (+Intelligenza)</option>
                  <option value="socializza">Fai gruppo nei corridoi (+Relazione)</option>
                  <option value="casino">Crea disordine nella scuola (+Coatto)</option>
                  <option value="riposa">Rilassati e riprendi fiato (-Stanchezza)</option>
                  <option value="snack">Merenda calda al bar (-3€, -Stanchezza)</option>
                </select>
              </div>

              {activities.school.archetype !== 'custom' && (
                <div className="mt-4 p-2.5 bg-accent/5 border border-accent/20 rounded flex items-start gap-2">
                  <Sparkle size={16} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    L'archetipo <strong>{activities.school.archetype}</strong> controlla questi campi. Modificandoli passerai alla condotta personalizzata.
                  </p>
                </div>
              )}
            </Card>

          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
})
