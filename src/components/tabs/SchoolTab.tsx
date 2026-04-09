import React, { lazy, Suspense } from 'react'
import { GraduationCap, Brain, UserCircle, Trophy, HandCoins, HandFist, Chats } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ActionButton } from '@/components/ActionButton'
import { EnhancedFriendsPanel } from '@/components/EnhancedFriendsPanel'
import { SchoolBreakPanel } from '@/components/SchoolBreakPanel'
import type {
  GameStats,
  SubjectGrades,
  Friend,
  ScheduledExam,
  SchoolRecord,
  SchoolType,
  SchoolDayState,
  Teacher,
  Classmate,
  WeeklyTimetable,
  GameDate,
  TeacherMemoryEntry,
  LogEntryType,
  GameLogEntry,
  DayPhase,
} from '@/lib/types'
import type { AfternoonEvent } from '@/lib/afternoon-events'
import type { SchoolMorningEvent } from '@/lib/school-morning-events'
import type { Ragazza } from '@/lib/girlfriend-system'
import { getSubjectDisplayName } from '@/lib/types'
import { calculateStudyGradeIncrease } from '@/lib/game-utils'
import { AfternoonEventPanel } from '@/components/AfternoonEventPanel'
import { SchoolHomePanel } from '@/components/SchoolHomePanel'
import { TeachersPanel } from '@/components/TeachersPanel'
import { ExamsPanel } from '@/components/ExamsPanel'
import { SchoolMorningPanel } from '@/components/SchoolMorningPanel'
import { GradeProgressPanel } from '@/components/GradeProgressPanel'
import ChunkErrorBoundary from '@/components/ChunkErrorBoundary'

// ── Lazy components (peso > 20 kB) ────────────────────────────────────────
const StatsDashboard = lazy(() =>
  import('@/components/StatsDashboard').then(m => ({ default: m.StatsDashboard }))
)
// ── Props ─────────────────────────────────────────────────────────────────────

export interface SchoolTabProps {
  // Dati statici
  schoolType: SchoolType | null
  schoolYear: number
  grades: SubjectGrades
  currentMedia: number
  rawGradesHistory: Record<number, SubjectGrades>
  scheduledExams: ScheduledExam[]

  // Stato dinamico
  stats: GameStats
  friends: Friend[]
  teachers: Teacher[]
  classRoster: Classmate[]
  schoolRecord: SchoolRecord
  girlfriend: Ragazza | null

  // Fase / timing
  phaseActionsLeft: number
  phaseActionsRemaining: number
  interactionsRemaining: number
  dayType: string | null | undefined
  currentPhase: string | null | undefined
  currentDate: GameDate
  isSchoolPeriod: boolean

  // Stato mattina / scuola
  schoolSubPanel: 'home' | 'teachers' | 'break'
  setSchoolSubPanel: (v: 'home' | 'teachers' | 'break') => void
  schoolDayState: SchoolDayState | undefined
  timetable: WeeklyTimetable | null
  showSchoolMorning: boolean
  schoolMorningEvents: SchoolMorningEvent[]
  showStreetMorning: boolean
  streetMorningEvents: SchoolMorningEvent[]
  morningChoicePending: boolean
  marinatoOggi: boolean
  afternoonEvent: AfternoonEvent | null

  // Handler azioni
  handleVaiAScuola: () => void
  handleMarina: () => void
  handleOpenCorrompiDialog: () => void
  handleOpenMinacciaDialog: () => void
  handleFriendAction: (friendId: string, actionId: string) => void
  handleGirlfriendAction: (action: string) => void
  handleGirlfriendBreakup: () => void
  handlePrepareExam: (examSubject: string) => void
  handleAfternoonChoice: (choiceId: string) => void
  handlePromoteToFriend: (classmateId: string) => void
  doInteraction: (friendId: string, interactionId: string) => void

  // Callback che wrappano i setter (App.tsx gestisce la mutazione KV)
  onTeacherInteraction: (teacherId: string, delta: number, reason: TeacherMemoryEntry['type'], date: GameDate) => void
  onStatChange: React.Dispatch<React.SetStateAction<GameStats | undefined>>
  onTeacherChange: (updater: (prev: Teacher[]) => Teacher[]) => void
  onClassmateChange: (updater: (prev: Classmate[]) => Classmate[]) => void
  onNewFriend: (f: Friend) => void
  onSlotComplete: (idx: number) => void
  onBreakComplete: () => void
  gainExtraAction: () => void
  consumeAction: () => void

  // Utilità
  announce: (message: string) => void
  addLogEntry: (
    type: LogEntryType,
    title: string,
    description: string,
    result: GameLogEntry['result'],
    date: GameDate,
    phase: DayPhase
  ) => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function SchoolTab({
  schoolType,
  schoolYear,
  grades,
  currentMedia,
  rawGradesHistory,
  scheduledExams,
  stats,
  friends,
  teachers,
  classRoster,
  schoolRecord,
  girlfriend,
  phaseActionsLeft,
  phaseActionsRemaining,
  interactionsRemaining,
  dayType,
  currentPhase,
  currentDate,
  isSchoolPeriod,
  schoolSubPanel,
  setSchoolSubPanel,
  schoolDayState,
  timetable,
  showSchoolMorning,
  schoolMorningEvents,
  showStreetMorning,
  streetMorningEvents,
  morningChoicePending,
  marinatoOggi,
  afternoonEvent,
  handleVaiAScuola,
  handleMarina,
  handleOpenCorrompiDialog,
  handleOpenMinacciaDialog,
  handleFriendAction,
  handleGirlfriendAction,
  handleGirlfriendBreakup,
  handlePrepareExam,
  handleAfternoonChoice,
  handlePromoteToFriend,
  doInteraction,
  onTeacherInteraction,
  onStatChange,
  onTeacherChange,
  onClassmateChange,
  onNewFriend,
  onSlotComplete,
  onBreakComplete,
  gainExtraAction,
  consumeAction,
  announce,
  addLogEntry,
}: SchoolTabProps) {
  const hasActiveSchoolSequence =
    dayType === 'feriale' &&
    currentPhase === 'mattina' &&
    isSchoolPeriod &&
    schoolRecord.wentToSchoolToday &&
    schoolDayState !== undefined &&
    schoolDayState.slots.length > 0 &&
    !schoolDayState.isComplete

  return (
    <Tabs defaultValue="home" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 bg-card/50 p-1">
        <TabsTrigger value="home" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
          <GraduationCap size={18} className="mr-2" weight="fill" />
          Home
        </TabsTrigger>
        <TabsTrigger value="voti" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
          <GraduationCap size={18} className="mr-2" weight="fill" />
          Voti
        </TabsTrigger>
        <TabsTrigger value="verifiche" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Brain size={18} className="mr-2" weight="fill" />
          Verifiche
        </TabsTrigger>
        <TabsTrigger value="amici" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
          <UserCircle size={18} className="mr-2" weight="fill" />
          Amici
        </TabsTrigger>
        <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Trophy size={18} className="mr-2" weight="fill" />
          Dashboard
        </TabsTrigger>
      </TabsList>

      {/* ── Sotto-tab: Home ─────────────────────────────────────────────── */}
      <TabsContent value="home" className="space-y-4 mt-6">
        {/* Pannello Professori */}
        {schoolSubPanel === 'teachers' && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSchoolSubPanel('home')}
              aria-label="Torna alla home scolastica"
              className="flex items-center gap-1"
            >
              ← Scuola
            </Button>
            <TeachersPanel
              teachers={teachers ?? []}
              currentDate={currentDate}
              onTeacherInteraction={onTeacherInteraction}
              stats={stats}
              announce={announce}
              onConsumeAction={consumeAction}
              actionsRemaining={phaseActionsRemaining}
            />
          </div>
        )}

        {/* Vista home (SchoolHomePanel + azioni mattina) */}
        {schoolSubPanel === 'home' && (
          <div className="space-y-4">
            <SchoolHomePanel
              schoolType={schoolType as NonNullable<typeof schoolType>}
              schoolYear={schoolYear}
              schoolRecord={schoolRecord}
              timetable={timetable ?? null}
              schoolDayState={schoolDayState ?? null}
              teachers={teachers ?? []}
              classRoster={classRoster ?? []}
              currentDate={currentDate}
              currentPhase={(currentPhase as DayPhase | null) ?? null}
              onGoToTeachers={() => setSchoolSubPanel('teachers')}
              onGoToClassmates={() => setSchoolSubPanel('home')}
              onPromoteToFriend={handlePromoteToFriend}
            />

            {/* Messaggio contestuale */}
            {(() => {
              if (schoolRecord.assenze >= 20) return (
                <Card className="p-3 border border-destructive bg-destructive/5">
                  <p className="text-sm text-destructive font-medium">⚠️ Attenzione: stai accumulando troppe assenze.</p>
                </Card>
              )
              if (currentMedia < 6) return (
                <Card className="p-3 border border-destructive bg-destructive/5">
                  <p className="text-sm text-destructive font-medium">⚠️ La tua media è insufficiente. Studia di più!</p>
                </Card>
              )
              if (currentMedia >= 8) return (
                <Card className="p-3 border border-secondary bg-secondary/5">
                  <p className="text-sm text-secondary font-medium">⭐ Ottima media! Continua così.</p>
                </Card>
              )
              return (
                <Card className="p-3 border border-muted bg-muted/20">
                  <p className="text-sm text-muted-foreground">📚 Settimana nella norma. Niente di urgente.</p>
                </Card>
              )
            })()}

            {/* Azioni scuola — solo mattina feriale nel periodo scolastico */}
            {currentPhase === 'mattina' && dayType === 'feriale' && isSchoolPeriod && (
              <>
                <Card className="p-3 border-2 border-primary bg-card">
                  <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                    <GraduationCap size={24} weight="fill" />
                    VAI A SCUOLA
                  </h3>
                  <ActionButton
                    icon={<GraduationCap size={48} />}
                    label="Vai a Scuola"
                    onClick={handleVaiAScuola}
                    disabled={
                      phaseActionsLeft <= 0 ||
                      dayType !== 'feriale' ||
                      currentPhase !== 'mattina' ||
                      !isSchoolPeriod ||
                      marinatoOggi
                    }
                    blockedReason={
                      marinatoOggi
                        ? 'Hai già marinato stamattina'
                        : phaseActionsLeft <= 0
                          ? 'Nessuna azione per questa fascia oraria'
                          : dayType !== 'feriale'
                            ? 'Disponibile solo nei giorni feriali'
                            : currentPhase !== 'mattina'
                              ? 'Disponibile solo la mattina'
                              : 'Non è periodo scolastico'
                    }
                    variant="default"
                    ariaLabel="Vai a scuola durante la mattina dei giorni feriali. +2 Intelligenza, +10 Stanchezza."
                    helpText="Frequenta le lezioni a scuola. Disponibile solo la mattina dei giorni feriali durante il periodo scolastico. +2 Intelligenza, +10 Stanchezza."
                    announce={announce}
                  />
                  <div className="mt-3 text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                    <p className="font-semibold mb-1">Effetti:</p>
                    <p>• +2 Intelligenza</p>
                    <p>• +10 Stanchezza</p>
                    <p className="mt-2 text-primary font-semibold">📅 Disponibile: Mattina dei giorni feriali (periodo scolastico)</p>
                  </div>
                </Card>

                {/* F6: Pulsante Marina */}
                {!schoolRecord.wentToSchoolToday && !marinatoOggi && (
                  <Card className="p-3 border-2 border-destructive bg-card">
                    <h3 className="text-xl font-bold mb-4 text-destructive flex items-center gap-2">
                      <GraduationCap size={24} weight="fill" />
                      MARINA LA SCUOLA
                    </h3>
                    <ActionButton
                      icon={<GraduationCap size={48} />}
                      label="Marina!"
                      onClick={handleMarina}
                      disabled={
                        phaseActionsLeft <= 0 ||
                        dayType !== 'feriale' ||
                        currentPhase !== 'mattina' ||
                        !isSchoolPeriod
                      }
                      blockedReason={
                        phaseActionsLeft <= 0
                          ? 'Nessuna azione per questa fascia oraria'
                          : dayType !== 'feriale'
                            ? 'Disponibile solo nei giorni feriali'
                            : currentPhase !== 'mattina'
                              ? 'Disponibile solo la mattina'
                              : 'Non è periodo scolastico'
                      }
                      variant="destructive"
                      ariaLabel="Marina la scuola. +1 Assenza conta per le soglie bocciatura, +5 Coattaggine, 1 azione extra."
                      helpText="Non vai a scuola. Guadagni 1 azione extra ma accumuli 1 Assenza che conta verso le soglie 15/25/35. Oltre 35 assenze sei bocciato automaticamente!"
                      announce={announce}
                    />
                    <div className="mt-3 text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                      <p className="font-semibold mb-1">Effetti:</p>
                      <p>• +1 Assenza (conta verso le soglie 15 / 25 / 35)</p>
                      <p>• +5 Coattaggine</p>
                      <p>• +1 Azione extra</p>
                      <p className="mt-2 text-destructive font-semibold">⚠️ Oltre 35 assenze = BOCCIATO automaticamente!</p>
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* SchoolBreakPanel — slot intervallo attivo */}
            {hasActiveSchoolSequence &&
             schoolDayState !== undefined &&
             schoolDayState.slots[schoolDayState.currentSlotIndex]?.type === 'break' && (
              <SchoolBreakPanel
                schoolDayState={schoolDayState}
                teachers={teachers ?? []}
                classRoster={classRoster ?? []}
                stats={stats}
                schoolRecord={schoolRecord}
                onStatChange={onStatChange as (updater: (prev: GameStats) => GameStats) => void}
                onTeacherChange={onTeacherChange}
                onClassmateChange={onClassmateChange}
                onBreakComplete={onBreakComplete}
                announce={announce}
                currentDate={currentDate}
              />
            )}

            {/* SchoolMorningPanel — slot lezione attivo */}
            {hasActiveSchoolSequence &&
             schoolDayState?.slots[schoolDayState?.currentSlotIndex]?.type !== 'break' && (
              <SchoolMorningPanel
                key={`smp-${schoolDayState?.isComplete ? 'done' : 'live'}`}
                context="school"
                events={schoolMorningEvents}
                stats={stats}
                onStatChange={onStatChange as (updater: (prev: GameStats) => GameStats) => void}
                onGainExtraAction={gainExtraAction}
                onConsumeAction={consumeAction}
                announce={announce}
                onNewFriend={onNewFriend}
                addLogEntry={addLogEntry}
                currentDate={currentDate}
                schoolDayState={schoolDayState ?? undefined}
                onSlotComplete={onSlotComplete}
              />
            )}

            {/* SchoolMorningPanel — contesto strada (marinatori) */}
            {showStreetMorning && dayType === 'feriale' && currentPhase === 'mattina' && marinatoOggi && (
              <SchoolMorningPanel
                context="street"
                events={streetMorningEvents}
                stats={stats}
                onStatChange={onStatChange as (updater: (prev: GameStats) => GameStats) => void}
                onGainExtraAction={gainExtraAction}
                onConsumeAction={consumeAction}
                announce={announce}
                onNewFriend={onNewFriend}
                addLogEntry={addLogEntry}
                currentDate={currentDate}
              />
            )}

            {/* AfternoonEventPanel */}
            {afternoonEvent && (currentPhase === 'pomeriggio' || currentPhase === 'sera') && (
              <AfternoonEventPanel
                event={afternoonEvent}
                onChoice={handleAfternoonChoice}
              />
            )}
          </div>
        )}
      </TabsContent>

      {/* ── Sotto-tab: Voti ──────────────────────────────────────────────── */}
      <TabsContent value="voti" className="space-y-6 mt-6">
        <Card className="p-6 border-2 border-secondary bg-card">
          <h3 className="text-2xl font-bold mb-4 text-secondary flex items-center gap-2">
            <GraduationCap size={32} weight="fill" />
            📊 PAGELLA
          </h3>
          <div role="table" aria-label="Tabella dei voti scolastici" className="space-y-1">
            {Object.entries(grades).map(([subject, grade]) => (
              <div
                key={subject}
                role="row"
                aria-label={`${getSubjectDisplayName(subject)}: ${grade.toFixed(1)} su 10${grade < 6 ? ' — INSUFFICIENTE' : ''}`}
                className="flex items-center gap-2 py-1.5 px-2"
              >
                <span className="text-xs text-muted-foreground flex-1">
                  {getSubjectDisplayName(subject)}
                </span>
                <span className={`text-sm font-bold w-8 text-right ${grade < 6 ? 'text-destructive' : 'text-secondary'}`}>
                  {grade.toFixed(1)}
                </span>
                <div className="w-16 h-1.5 bg-muted rounded-sm overflow-hidden" aria-hidden="true">
                  <div
                    className={`h-full ${grade < 6 ? 'bg-destructive' : 'bg-secondary'}`}
                    style={{ width: `${(grade / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg text-muted-foreground">Media totale:</span>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${currentMedia < 6 ? 'text-destructive' : 'text-accent'}`}>
                  {currentMedia.toFixed(1)}
                </span>
                {currentMedia < 4 && (
                  <span className="text-destructive font-bold animate-pulse">BOCCIATO!</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <span className="text-sm text-muted-foreground">Condotta:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${schoolRecord.condotta < 6 ? 'text-destructive' : 'text-primary'}`}>
                    {schoolRecord.condotta.toFixed(1)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Assenze:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${schoolRecord.assenze > 20 ? 'text-destructive' : 'text-foreground'}`}>
                    {schoolRecord.assenze}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Note:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {schoolRecord.note}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Sospensioni:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${schoolRecord.sospensioni > 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {schoolRecord.sospensioni}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* GradeProgressPanel + storico anni precedenti */}
        {schoolType ? (
          <>
            <GradeProgressPanel
              grades={grades}
              schoolType={schoolType}
              schoolYear={schoolYear}
            />
            {Object.keys(rawGradesHistory ?? {}).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                  Storico anni precedenti
                </h4>
                {Object.entries(rawGradesHistory ?? {})
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([year, histGrades]) => {
                    const avg = Object.values(histGrades).length
                      ? (Object.values(histGrades).reduce((s, v) => s + v, 0) /
                          Object.values(histGrades).length).toFixed(1)
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

        <Card className="p-3 border-2 border-destructive bg-card">
          <h3 className="text-xl font-bold mb-4 text-destructive flex items-center gap-2">
            <HandCoins size={24} weight="fill" />
            METODI ALTERNATIVI
          </h3>
          <div className="space-y-3">
            <ActionButton
              icon={<HandCoins size={48} />}
              label="Corrompi Professore"
              shortcut="Ctrl+6"
              onClick={handleOpenCorrompiDialog}
              disabled={phaseActionsLeft <= 0 || stats.soldi < 100}
              blockedReason={phaseActionsLeft <= 0 ? 'Nessuna azione per questa fascia oraria' : 'Servono almeno 100€'}
              variant="default"
              ariaLabel="Corrompi un professore con una mazzetta da 100 euro. Aumenta i voti. Tasto rapido: Ctrl+6"
              helpText="Corrompi un professore con 100 euro. Scegli quale professore corrompere. Aumenta i voti di 0.5 punti nella materia scelta."
              announce={announce}
            />
            <ActionButton
              icon={<HandFist size={48} />}
              label="Minaccia Professore"
              shortcut="Ctrl+7"
              onClick={handleOpenMinacciaDialog}
              disabled={phaseActionsLeft <= 0}
              blockedReason="Nessuna azione per questa fascia oraria"
              variant="destructive"
              ariaLabel="Minaccia un professore. Rischio 30% di espulsione! Aumenta molto i voti e la coattaggine. Tasto rapido: Ctrl+7"
              helpText="Minaccia un professore. Scegli quale professore minacciare. Rischio del 30% di essere espulso dal gioco! Se riesce, +1.5 al voto e +15 coattaggine. Usare con cautela."
              announce={announce}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-destructive">
            <p className="font-bold">⚠️ ATTENZIONE: Metodi rischiosi! L'opzione Minaccia ha 30% di probabilità di ESPULSIONE!</p>
          </div>
        </Card>
      </TabsContent>

      {/* ── Sotto-tab: Verifiche ─────────────────────────────────────────── */}
      <TabsContent value="verifiche" className="space-y-6 mt-6">
        <ExamsPanel
          exams={scheduledExams}
          onPrepareExam={handlePrepareExam}
          actionsRemaining={phaseActionsRemaining}
          stanchezza={stats.stanchezza}
        />
        <Card className="p-3 border-2 border-accent bg-card">
          <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
            <Brain size={28} weight="fill" />
            SISTEMA INTELLIGENZA
          </h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-accent">L'Intelligenza</strong> è la tua arma segreta per dominare la scuola!
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Studiare aumenta i voti in modo DECIMALE basato sulla tua Intelligenza</li>
              <li>Formula: <code className="bg-muted px-2 py-1 rounded">+{calculateStudyGradeIncrease(stats.intelligenza).toFixed(1)}</code> per ogni studio</li>
              <li>Preparare le verifiche aumenta l'Intelligenza e moltiplica il voto finale!</li>
              <li>Le interrogazioni a sorpresa dipendono da (Media + Intelligenza) / 2</li>
              <li>Amici intelligenti (INT {'>'} 60) aumentano del 50% l'efficacia dello studio!</li>
            </ul>
          </div>
        </Card>
      </TabsContent>

      {/* ── Sotto-tab: Amici ─────────────────────────────────────────────── */}
      <TabsContent value="amici" className="space-y-6 mt-6">
        <EnhancedFriendsPanel
          friends={friends.filter(f =>
            f.originType === 'compagno_classe' || f.originType === 'compagno_istituto'
          )}
          stats={stats}
          interactionsRemaining={interactionsRemaining}
          onFriendAction={handleFriendAction}
          onRelationInteraction={doInteraction}
          girlfriend={girlfriend ?? null}
          onGirlfriendAction={handleGirlfriendAction}
          onGirlfriendBreakup={handleGirlfriendBreakup}
        />
        <Card className="p-3 border-2 border-accent bg-card">
          <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
            <Chats size={28} weight="fill" />
            SISTEMA CARISMA
          </h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-accent">Il Carisma</strong> è la tua capacità di convincere e socializzare!
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Influenza TUTTE le interazioni sociali (Disco, Cinema, Rimorchio)</li>
              <li>Con Carisma {'>'} 70 hai 20% di evitare eventi negativi con la PARLANTINA!</li>
              <li>Aumenta le probabilità di fare nuove amicizie (base 15% + bonus Carisma)</li>
              <li>Migliora le chance romantiche con i potenziali partner (ogni tipo ha preferenze diverse!)</li>
              <li>Contribuisce al 20% della tua REPUTAZIONE totale!</li>
            </ul>
          </div>
        </Card>
      </TabsContent>

      {/* ── Sotto-tab: Dashboard ─────────────────────────────────────────── */}
      <TabsContent value="dashboard" className="space-y-6 mt-6">
        <ChunkErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center p-8 text-sm text-muted-foreground">Caricamento statistiche...</div>}>
            <StatsDashboard stats={stats} grades={grades} />
          </Suspense>
        </ChunkErrorBoundary>
      </TabsContent>
    </Tabs>
  )
}
