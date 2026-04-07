<!-- linked-plan: docs/PLAN_AdvancedSchoolSystem_V1.md -->
# TODO — Sistema Scolastico Avanzato

> Prima di ogni fase, Copilot DEVE leggere il file
> `docs/PLAN_AdvancedSchoolSystem_V1.md` per consultare le specifiche
> tecniche complete, i tipi, le firme delle funzioni e le regole di
> compatibilita. Non procedere a memoria.

---

## [ ] Blocco 1 — Strutture Dati Base

### [ ] Fase 1A — Popolare `weeklyHours` in `subjects.ts`

- [ ] Aggiungere `weeklyHours` a tutte le entry in `COMMON_SUBJECTS` (7 materie)
- [ ] Aggiungere `weeklyHours` a tutte le entry in `SPECIFIC_SUBJECTS` per tutti e 6 gli indirizzi
- [ ] Verificare che il totale ore/settimana per ogni indirizzo/anno sia coerente (28-32 slot per 30 disponibili)
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 1B — Nuovi tipi in `types.ts`

- [ ] Aggiungere `TimetableSlot`, `WeeklyTimetable`
- [ ] Aggiungere `ClassmatePersonality`, `Classmate`
- [ ] Aggiungere `Teacher`, `TeacherMemoryEntry`
- [ ] Aggiungere `OrdinaryHourEvent`, `HourSlot`, `SchoolDayState`
- [ ] Aggiungere `BreakActionType` (anticipato da Blocco 4)
- [ ] Aggiungere costanti di default: `DEFAULT_SCHOOL_DAY_STATE`
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 1C — Generatore Orario Settimanale

- [ ] Creare `src/lib/school-timetable.ts`
- [ ] Implementare `generateWeeklyTimetable(schoolType, schoolYear, teachers)`
- [ ] Vincoli: max 2 stessa materia/giorno, materie pesanti nelle prime ore, 6 slot pieni/giorno
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 1D — Generatore Registro Classe

- [ ] Creare `src/lib/school-roster.ts`
- [ ] Implementare `generateClassRoster(schoolYear)` — 18-25 compagni
- [ ] Distribuzione personalita e relazione iniziale come da piano
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 1E — Generatore Corpo Docente

- [ ] Creare `src/lib/school-teachers.ts`
- [ ] Implementare `generateTeachers(schoolType, schoolYear)` — 1 prof per materia
- [ ] Attributi 1-10 con distribuzione gaussiana centrata su 5
- [ ] **C9** — Relazione iniziale: `(simpatia * 6 - 20) + Math.round((Math.random() - 0.5) * 16)` applicato una sola volta, persistito in KV (NON ricalcolato)
- [ ] `sogliaRottura`: `-30 - (severita * 5)`
- [ ] `isOstile`: derivato da `relazione < sogliaRottura`
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 1F — Hook `useSchoolSystem` e Init Partita

- [ ] Creare `src/hooks/useSchoolSystem.ts`
- [ ] 4 chiavi KV: `tabboz-weekly-timetable`, `tabboz-class-roster`, `tabboz-teachers`, `tabboz-school-day-state`
- [ ] Esporre: teachers, classRoster, timetable, schoolDayState + setter + helper
- [ ] Integrare in `App.tsx`: istanziare hook, passare a componenti
- [ ] Trigger generazione in `SchoolSelection.tsx` alla scelta scuola
- [ ] Backward compatibility: partite esistenti senza strutture continuano a funzionare
- [ ] `npx tsc --noEmit` zero errori

---

## [ ] Blocco 2 — Mattinata Sequenziale

### [ ] Fase 2A — Template Eventi Ordinari

- [ ] Creare `src/lib/school-day-templates.ts`
- [ ] 8-10 template per materia + pool fallback generico
- [ ] Template con placeholder: `{ora}`, `{teacher}`, `{materia}`
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 2B — Eventi Strutturati Contestuali

- [ ] Creare `src/lib/school-structured-events.ts`
- [ ] Estendere `SchoolMorningEvent` con `subjectFilter`, `severityRange`, `relationRange`
- [ ] Migrare/adattare eventi esistenti da `school-morning-events.ts` dove applicabile
- [ ] Aggiungere eventi nuovi specifici per materia (interrogazione, compito in classe, ecc.)
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 2C — Generatore Slot Giornalieri

- [ ] Creare `src/lib/school-day-engine.ts`
- [ ] Implementare `generateSchoolDaySlots(daySchedule, teachers, stats)`
- [ ] 7 slot: 3 ore + break + 3 ore
- [ ] Evento strutturato con probabilita 35% base + modificatori da prof
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 2D — Refactor `handleVaiAScuola`

- [ ] **C10** — Aggiungere `consumeAllMorningActions(): void` in `useGameTime` (imposta `phaseActionsRemaining = 0`) e includerlo nel return hook
- [ ] Sostituire `drawSchoolMorningEvents(6)` con generazione `SchoolDayState` via `generateSchoolDaySlots`
- [ ] Sostituire `consumeAction()` con `consumeAllMorningActions()` in `handleVaiAScuola`
- [ ] Salvare `SchoolDayState` in KV
- [ ] Mantenere fallback legacy se `timetable` e `null`
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 2E — Evoluzione `SchoolMorningPanel` (modalita sequenziale)

- [ ] Aggiungere props: `schoolDayState`, `onAdvanceHour`, `onBreakAction`, `onDayComplete`, `teachers`
- [ ] Modalita `context="school"`: mostra slot corrente, pulsante "Avanti", navigazione bloccante
- [ ] Modalita `context="street"`: comportamento invariato
- [ ] Slot break: delega a `SchoolBreakPanel` (stub iniziale, completato in Blocco 4)
- [ ] Completamento tutti gli slot → chiama `onDayComplete`
- [ ] Accessibilita: focus management, annunci ARIA per cambio ora
- [ ] `npx tsc --noEmit` zero errori

---

## [ ] Blocco 3 — Sistema Relazionale Professori e Compagni

### [ ] Fase 3A — Logica Relazionale Professori

- [ ] Creare `src/lib/teacher-relations.ts`
- [ ] `applyTeacherRelationChange(teacher, change, reason, date)` con isteresi ostilita
- [ ] `getCorruptionChance(teacher, amount)` — formula con scaling corruzione
- [ ] `getThreatSuccess(teacher)` — formula con conseguenze
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 3B — Logica Relazionale Compagni

- [ ] Creare `src/lib/classmate-relations.ts`
- [ ] Interazioni: chiacchiera, studia insieme, litiga, promuovi ad amico
- [ ] `classmateRelationToFriendship(classmate)` — mapping scala -100/+100 → 0/100
- [ ] `promotClassmateToFriend(classmate)` — crea Friend in friends[]
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 3C — Transizioni Annuali

- [ ] Creare `src/lib/school-roster-transitions.ts`
- [ ] `applyYearTransition(classRoster, teachers, schoolType, newYear, friends)`
- [ ] Bocciatura 1-4 compagni, arrivo 0-2 nuovi
- [ ] Sostituzione 0-2 professori
- [ ] Compagni bocciati → amici extrascolastici (relazione preservata)
- [ ] Integrare in `useGameTime` al cambio anno scolastico
- [ ] `npx tsc --noEmit` zero errori

---

## [ ] Blocco 4 — Intervallo e Pannello Scolastico

### [ ] Fase 4A — Sistema Azioni Intervallo

- [ ] Creare `src/lib/school-break-actions.ts`
- [ ] 9 azioni divise in 3 categorie: compagno, professore, indipendente
- [ ] Ogni azione con `available()` e `execute()` context-aware
- [ ] **C11** — `BreakContext` deve includere `todayTeachers: Teacher[]` (filtro da `daySchedule`) e `completedSlots: HourSlot[]` (slot lesson gia completati); entrambi derivabili da `SchoolDayState` senza nuovi KV
- [ ] L'azione `chiedi_revoca_voto` usa `completedSlots` per trovare un voto insufficiente recente; usare `todayTeachers` per limitare la lista prof disponibili all'intervallo
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 4B — UI Pannello Intervallo

- [ ] Creare `src/components/SchoolBreakPanel.tsx`
- [ ] 3 tab: Compagni, Professori, Altro
- [ ] Una sola azione selezionabile, poi chiusura automatica
- [ ] Accessibilita: tab navigabili da tastiera, focus trap
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 4C — Home Scolastica Aggiornata

- [ ] Creare o refactorare pannello home scuola
- [ ] Contatore "Amici fatti: X / Y compagni"
- [ ] Orario del giorno corrente (griglia 6 righe)
- [ ] Ora corrente + materia + professore durante mattinata attiva
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 4D — Pannello Professori

- [ ] Creare `src/components/TeachersPanel.tsx`
- [ ] Lista con nome, materia, indicatore relazione, segnale ostilita
- [ ] Espandibile: storico interazioni
- [ ] Azioni fuori mattinata (consumano azione pomeridiana)
- [ ] Accessibilita: lista navigabile, stati annunciati
- [ ] `npx tsc --noEmit` zero errori

### [ ] Fase 4E — Filtro Compagni nel Pannello Amici

- [ ] Aggiungere filtro/tab "Compagni di classe" in `EnhancedFriendsPanel` o nella home scuola
- [ ] Mostra roster con relazione e azioni disponibili
- [ ] `npx tsc --noEmit` zero errori

---

## Note per Copilot

- Consulta SEMPRE `docs/PLAN_AdvancedSchoolSystem_V1.md` prima di implementare ogni fase
- Le fasi dentro ogni blocco vanno eseguite **nell'ordine indicato**
- Blocchi diversi possono procedere in parallelo SOLO se le dipendenze (sezione 7 del piano) sono soddisfatte
- Ogni fase termina con `npx tsc --noEmit` → zero errori prima di spuntare la checkbox
- Partite legacy (senza strutture generate) DEVONO continuare a funzionare
