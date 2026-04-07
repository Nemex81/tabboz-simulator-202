<!-- linked-plan: docs/PLAN_AdvancedSchoolSystem_V1.md -->
# TODO — Sistema Scolastico Avanzato

> Prima di ogni fase, Copilot DEVE leggere il file
> `docs/PLAN_AdvancedSchoolSystem_V1.md` per consultare le specifiche
> tecniche complete, i tipi, le firme delle funzioni e le regole di
> compatibilita. Non procedere a memoria.

---

## [x] Blocco 1 — Strutture Dati Base

### [x] Fase 1A — Popolare `weeklyHours` in `subjects.ts`

- [x] Aggiungere `weeklyHours` a tutte le entry in `COMMON_SUBJECTS` (7 materie)
- [x] Aggiungere `weeklyHours` a tutte le entry in `SPECIFIC_SUBJECTS` per tutti e 6 gli indirizzi
- [x] Verificare che il totale ore/settimana per ogni indirizzo/anno sia coerente (28-32 slot per 30 disponibili)
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 1B — Nuovi tipi in `types.ts`

- [x] Aggiungere `TimetableSlot`, `WeeklyTimetable`
- [x] Aggiungere `ClassmatePersonality`, `Classmate`
- [x] Aggiungere `Teacher`, `TeacherMemoryEntry`
- [x] Aggiungere `OrdinaryHourEvent`, `HourSlot`, `SchoolDayState`
- [x] Aggiungere `BreakActionType` (anticipato da Blocco 4)
- [x] Aggiungere costanti di default: `DEFAULT_SCHOOL_DAY_STATE`
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 1C — Generatore Orario Settimanale

- [x] Creare `src/lib/school-timetable.ts`
- [x] Implementare `generateWeeklyTimetable(schoolType, schoolYear, teachers)`
- [x] Vincoli: max 2 stessa materia/giorno, materie pesanti nelle prime ore, 6 slot pieni/giorno
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 1D — Generatore Registro Classe

- [x] Creare `src/lib/school-roster.ts`
- [x] Implementare `generateClassRoster(schoolYear)` — 18-25 compagni
- [x] Distribuzione personalita e relazione iniziale come da piano
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 1E — Generatore Corpo Docente

- [x] Creare `src/lib/school-teachers.ts`
- [x] Implementare `generateTeachers(schoolType, schoolYear)` — 1 prof per materia
- [x] Attributi 1-10 con distribuzione gaussiana centrata su 5
- [x] **C9** — Relazione iniziale: `(simpatia * 6 - 20) + Math.round((Math.random() - 0.5) * 16)` applicato una sola volta, persistito in KV (NON ricalcolato)
- [x] `sogliaRottura`: `-30 - (severita * 5)`
- [x] `isOstile`: derivato da `relazione < sogliaRottura`
- [x] `npx tsc --noEmit` zero errori

### [~] Fase 1F — Hook `useSchoolSystem` e Init Partita

- [x] Creare `src/hooks/useSchoolSystem.ts`
- [x] 4 chiavi KV: `tabboz-weekly-timetable`, `tabboz-class-roster`, `tabboz-teachers`, `tabboz-school-day-state`
- [x] Esporre: teachers, classRoster, timetable, schoolDayState + setter + helper
- [ ] Integrare in `App.tsx`: istanziare hook, passare a componenti
- [ ] Trigger generazione in `SchoolSelection.tsx` alla scelta scuola
- [x] Backward compatibility: partite esistenti senza strutture continuano a funzionare
- [x] `npx tsc --noEmit` zero errori

---

## [x] Blocco 2 — Mattinata Sequenziale (parziale: 2A-2C completate)

### [x] Fase 2A — Template Eventi Ordinari

- [x] Creare `src/lib/school-day-templates.ts`
- [x] 8-10 template per materia + pool fallback generico
- [x] Template con placeholder: `{ora}`, `{teacher}`, `{materia}`
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 2B — Eventi Strutturati Contestuali

- [x] Creare `src/lib/school-structured-events.ts`
- [x] Estendere `SchoolMorningEvent` con `subjectFilter`, `severityRange`, `relationRange`
- [x] Migrare/adattare eventi esistenti da `school-morning-events.ts` dove applicabile
- [x] Aggiungere eventi nuovi specifici per materia (interrogazione, compito in classe, ecc.)
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 2C — Generatore Slot Giornalieri

- [x] Creare `src/lib/school-day-engine.ts`
- [x] Implementare `generateSchoolDaySlots(daySchedule, teachers, stats)`
- [x] 7 slot: 3 ore + break + 3 ore
- [x] Evento strutturato con probabilita 35% base + modificatori da prof
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 2D — Refactor `handleVaiAScuola`

- [x] **C10** — Aggiungere `consumeAllMorningActions(): void` in `useGameTime` (imposta `phaseActionsRemaining = 0`) e includerlo nel return hook
- [x] Sostituire `drawSchoolMorningEvents(6)` con generazione `SchoolDayState` via `generateSchoolDaySlots`
- [x] Sostituire `consumeAction()` con `consumeAllMorningActions()` in `handleVaiAScuola`
- [x] Salvare `SchoolDayState` in KV
- [x] Mantenere fallback legacy se `timetable` e `null`
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 2E — Evoluzione `SchoolMorningPanel` (modalita sequenziale)

- [x] Aggiungere props: `schoolDayState`, `onSlotComplete`
- [x] Modalita `context="school"` + `schoolDayState` presente: mostra slot corrente, pulsante "Ora terminata", navigazione bloccante
- [x] Modalita `context="street"` / legacy: comportamento invariato
- [x] Slot break: card "Intervallo" con pulsante "Fine intervallo" e applicazione statDelta
- [x] Completamento tutti gli slot → mostra riepilogo "Giornata scolastica completata!"
- [x] Accessibilita: `role="region"`, `aria-label` per ora corrente, `aria-live="polite"` su cambio slot
- [x] `npx tsc --noEmit` zero errori

---

## [x] Blocco 3 — Sistema Relazionale Professori e Compagni

### [x] Fase 3A — Logica Relazionale Professori

- [x] Creare `src/lib/teacher-relations.ts`
- [x] `applyTeacherRelationChange(teacher, change, reason, date)` con isteresi ostilita
- [x] `getCorruptionChance(teacher, amount)` — formula con scaling corruzione
- [x] `getThreatSuccess(teacher)` — formula con conseguenze
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 3B — Logica Relazionale Compagni

- [x] Creare `src/lib/classmate-relations.ts`
- [x] Interazioni: chiacchiera, studia insieme, litiga, promuovi ad amico
- [x] `classmateRelationToFriendship(classmate)` — mapping scala -100/+100 → 0/100
- [x] `promoteToFriend(classmate, schoolYear)` — crea Friend in friends[]
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 3C — Transizioni Annuali

- [x] Creare `src/lib/school-roster-transitions.ts`
- [x] `applyYearTransition(classRoster, teachers, schoolType, newYear, friends)`
- [x] Bocciatura 1-4 compagni, arrivo 0-2 nuovi
- [x] Sostituzione 0-2 professori
- [x] Compagni bocciati → amici extrascolastici (relazione preservata)
- [x] Integrare in `App.tsx` nel blocco `if (actuallyPassed)` dopo `setSchoolRecord`
- [x] `npx tsc --noEmit` zero errori

---

## [x] Blocco 4 — Intervallo e Pannello Scolastico

### [x] Fase 4A — Sistema Azioni Intervallo

- [x] Creare `src/lib/school-break-actions.ts`
- [x] 9 azioni divise in 3 categorie: compagno, professore, indipendente
- [x] Ogni azione con `available()` e `execute()` context-aware
- [x] **C11** — `BreakContext` deve includere `todayTeachers: Teacher[]` (filtro da `daySchedule`) e `completedSlots: HourSlot[]` (slot lesson gia completati); entrambi derivabili da `SchoolDayState` senza nuovi KV
- [x] L'azione `chiedi_revoca_voto` usa `completedSlots` per trovare un voto insufficiente recente; usare `todayTeachers` per limitare la lista prof disponibili all'intervallo
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 4B — UI Pannello Intervallo

- [x] Creare `src/components/SchoolBreakPanel.tsx`
- [x] 3 tab: Compagni, Professori, Altro
- [x] Una sola azione selezionabile, poi chiusura automatica
- [x] Accessibilita: tab navigabili da tastiera, focus trap
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 4C — Home Scolastica Aggiornata

- [x] Creare `src/components/SchoolHomePanel.tsx`
- [x] Contatore "Compagni promossi ad amici: X / Y compagni"
- [x] Orario del giorno corrente (griglia 6 righe)
- [x] Ora corrente + materia + professore durante mattinata attiva
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 4D — Pannello Professori

- [x] Creare `src/components/TeachersPanel.tsx`
- [x] Lista con nome, materia, indicatore relazione, segnale ostilita
- [x] Espandibile: storico interazioni
- [x] Azioni fuori mattinata (consumano azione pomeridiana)
- [x] Accessibilita: lista navigabile, stati annunciati
- [x] `npx tsc --noEmit` zero errori

### [x] Fase 4E — Filtro Compagni nel Pannello Amici

- [x] Vista compagni integrata in `SchoolHomePanel` con toggle interno
- [x] Mostra roster con relazione e azioni disponibili (promozione ad amico)
- [x] `npx tsc --noEmit` zero errori

---

## Note per Copilot

- Consulta SEMPRE `docs/PLAN_AdvancedSchoolSystem_V1.md` prima di implementare ogni fase
- Le fasi dentro ogni blocco vanno eseguite **nell'ordine indicato**
- Blocchi diversi possono procedere in parallelo SOLO se le dipendenze (sezione 7 del piano) sono soddisfatte
- Ogni fase termina con `npx tsc --noEmit` → zero errori prima di spuntare la checkbox
- Partite legacy (senza strutture generate) DEVONO continuare a funzionare
