# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Fourth version digit (x.y.z.n) is used for backward-compatible patches and chore
updates that do not introduce regressions.

## [Unreleased]

---


## [0.6.0] - 2026-04-22

### Fixed

- `fix(a11y)`: migliorato il flusso SR e ripristino del focus sui dialog dopo chiusura.
- Ripristinato il bridge di focus dalla scelta mattutina (CTA header) al pulsante azione
  reale "Vai a Scuola" nel tab `school` tramite target stabile `school-go-to-school-action`.
- `useKeyboardShortcuts`: `Ctrl+Alt+Invio` invoca `handleDormi` durante la fase `notte`;
  nelle altre fasi mantiene `advancePhaseOnly`.

### Added

- `ActionButton`: prop opzionale `buttonId` esposta sull'elemento `<button>` sottostante.
- `src/hooks/useKeyboardShortcuts.test.ts`: 2 test di regressione Vitest per il routing
  notturno di `Ctrl+Alt+Invio`.

### Changed

- `docs/api.md`: aggiunta sezione 22 Apr 2026; tabella scorciatoie aggiornata.
- `docs/architecture.md`: sezione Accessibilità aggiornata con bridge di focus e routing
  condizionale `Ctrl+Alt+Invio`.
- `README.md`: aggiornato il punto scorciatoie nella sezione Accessibilità.

## [0.5.2] - 2026-04-20

### Added

- `scripts/detect_agent.py`: script per la rilevazione e ispezione degli agenti SCF;
  usato anche nel gate ANALYZE del CI.

### Removed

- `SECURITY.md` rimosso dopo revisione della policy di sicurezza.

### Changed

- `docs/TODO.md` resettato dopo completamento delle attività pianificate.
- Archiviati i documenti di proposta implementativa UI e piano tecnico accessibilità
  in `docs/piani archiviati/`.

## [0.5.1] - 2026-04-18

### Fixed

- `ActionButton`: rimosso side-effect da focus passivo (`onFocus` + timer) —
  `announce(helpText)` è ora chiamato solo da `onClick`/`onKeyDown` (Enter/Space).
  Risolve doppio annuncio NVDA.
- `MainGameTabs`, `SchoolTab`: aggiunto `pendingFocusTargetRef` per bloccare shift del
  focus da redirect di stato non confermati dall'utente.
- `SchoolBreakPanel`: rimosso focus automatico al mount.
- Fix correttivi runtime scuola: rimosso `onConsumeAction` e `actionsRemaining` dai
  pannelli scolastici; semplificata la gestione delle azioni disponibili.

### Added

- `AdvancePhaseButton`: nuovo componente per avanzamento fase con guard contestuale.
- Sistema azioni dual-KV: separazione `phaseActions` / `actionsRemaining` con rimozione
  del blocco sull'avanzamento fase.
- `maxActions` configurabile; handler `Riposa` aggiornato.
- `useActionGuard`: guard centralizzato per azioni non disponibili.
- Implementazione Blocco 3 UI/Accessibilità: analisi preventiva schede nidificate,
  controlli contestuali, aggiustamenti globali UI.
- `docs/schooltab-states.md`: diagramma degli stati del sotto-tab `home`.

### Changed

- `ErrorFallback`: migliorata gestione errori lazy load; `AppHeader` aggiunge prop
  `maxPhase`.
- `docs/api.md`, `docs/architecture.md`: aggiornati con le modifiche accessibilità NVDA
  e nuovi hook/componenti.

## [0.5.0] - 2026-04-17

### Added

- Implementazione Blocco 1 UI/Accessibilità: bagliore neon adattivo, ridenominazione
  etichette, attributi `aria-live`, pulizia contenuti.
- Implementazione Blocco 2: accessibilità schede mobili, badge di categoria, schede
  contestuali per fasi di gioco (tab `school` accessibile da tastiera).
- `docs/todolist/`: cartella todo per blocchi accessibilità (todo_blocco1/2/3.md).
- Installazione e inizializzazione SCF spark-mcp-server + pacchetto base spark.
- Nuovi prompt SCF per operazioni di gestione pacchetti (install, update, remove,
  status).

### Removed

- Documentazione obsoleta `TODO` e piano espansione rete sociale rimossi (archiviati).

### Changed

- `.github/project-profile.md`: `spark_base_version` → 1.2.0.

## [0.4.1] - 2026-04-12 / 2026-04-16

### Changed

- Inizializzazione configurazione workspace (`tabboz-simulator-202.code-workspace`).
- `.scf-manifest.json`: creato per tracking formale dei pacchetti SCF installati.
- Installazione plugin `scf-master-codecrafter`; aggiornati agenti SCF.
- `fix(scf-registry)`: versione minima motore aggiornata a 1.9.0.
- `fix(manifest)`: ripristinato `schema_version` a 1.0; rimossi file agenti obsoleti.
- Pacchetti SCF ripristinati alla configurazione iniziale (2026-04-16).

## [0.4.0] - 2026-04-10

### Added

- `refactor(relazione romantica)`: migrazione `fidanzata: Girl|null` → `activePartners:
  ActivePartner[]` come unica fonte di verità per i partner romantici attivi.
- `girlfriend-system.ts`: aggiunti `asActivePartner()` e
  `upsertActivePartnerCollection()`.
- `useHydratedKV`: inizializzazione `activePartners` da KV al caricamento.
- `useAppEffects`: migrazione one-way `tabboz-girlfriend` → `tabboz-active-partners`;
  idempotente e retrocompatibile.
- `scripts/orchestrator-loop.py`: driver autonomo di fase per il ciclo E2E.
- `scripts/orchestrator-loop.py`: gate RELEASE e logica checkpoint.
- `.scf-manifest.json`: tracking formale dei pacchetti SCF installati.
- `Agent-Research.md`: agente di ricerca da `scf-master-codecrafter` v1.0.0.

### Fixed

- `refactor(social)`: rinominate le label sociali di quartiere in tutti i layer
  (UI, handler, dialog, shortcut, log, test, docs):
  - "Giro al Parco" → "Socializza nel quartiere"
  - "Prova a rimorchiare / Atipa" → "Rimorchia nel quartiere"
- Relazioni romantiche: aggiunti controlli di compatibilità e limiti; gestione
  e test delle relazioni migliorati.

### Changed

- `GirlfriendPanel` ora riceve `partnerKey` per instradare azioni e rottura.
- `CharacterSheet`, `SchoolTab`, `FriendshipsPanel`, `EnhancedFriendsPanel`: operano
  su `activePartners[]`.
- `tabboz-active-partners` sostituisce `tabboz-girlfriend` come store KV primario.
- `useGirlfriendActions.test.ts`: aggiunto (scioglimento manuale e automatico).
- `useEventEngine.test`, `useSocialActions.test`, `useGameActions.test`,
  `EnhancedFriendsPanel.test`, `FriendshipsPanel.test`: aggiornati.

## [0.3.0] - 2026-04-09

### Added

- Sistema sociale: `useSocialActions` con sistema interazioni sociali completo;
  azioni disponibili tracciate per turno.
- Sistema lavoro part-time: `job-system.ts` + `JobSelectionDialog`.
- Supporto genere e orientamento sessuale: `gender-utils.ts`; funzioni di utilità per
  normalizzazione, rendering e compatibilità romantica.
- `ScheduledExam.type?: 'scritto' | 'orale'` con ribilanciamento eventi mattutini.
- Suite unit test configurata con Vitest + `jsdom`; setup in `src/test-setup.ts`.
  Copertura: `GameDialogs`, `CityDialogsGroup`, `SchoolDialogsGroup`,
  `SocialDialogsGroup`, `useAppDialogs`, `useGameActions`.
- Rifattorizzazione interazioni gioco: `CityDialogsGroup`, `SchoolDialogsGroup`,
  `SocialDialogsGroup`; separazione `game-dialogs.types.ts` per città e social.
- `useAppViewModels`: separazione delle preoccupazioni per props dei componenti.
- `RelationshipsPanel`: nuovo pannello relazioni con documentazione accessibilità.
- Nuovo tipo di interazione `'risolvi conflitto'` per compagni di classe.

### Changed

- `useAppDialogs`, `useAppEffects`, `useGameActions`, `useGameRelations`: refactor per
  migliore gestione stato e logica.
- `school-event-handlers.ts`: gestione discussione in classe + test associati.
- `useSocialActions`: aggiunto supporto costi canonici e riorganizzazione azioni
  economiche/sociali.
- Riorganizzazione ed espansione eventi scolastici; rimossi eventi ripetitivi.

## [0.2.0] - 2026-04-08

### Added

- `FriendshipsPanel`: sostituisce `FriendsPanel` con navigazione a schede
  (Tutti / Scuola / Extra) e caricamento lazy di `EnhancedFriendsPanel`.
- `useSoundFeedback`: hook centralizzato per il feedback sonoro su azioni.
- `game-balance.constants.ts`: costanti di bilanciamento (studi, interazioni, costi).
- `useStudyActions`: hook per studio individuale, studio di gruppo, corruzione
  insegnante, minaccia.
- Regioni `aria-live` separate per messaggi assertivi e cortesi; aggiornate tutte
  le chiamate a `announce()`.
- Scorciatoie da tastiera: aggiornati `aria-label` e messaggi di annuncio;
  `KeyboardShortcutsDialog` con tutte le scorciatoie organizzate per categoria.
- `ChunkErrorBoundary`: gestione errori di caricamento dinamico in `SchoolTab`.
- Costanti `STUDY.GROUP_*` e sostituzione valori hardcoded in
  `game-balance.constants.ts`.
- `GameStats.hasMotorino: boolean` persistito in KV.
- `GameTime.lastPaghettaDate?: GameDate`; `phaseActions` tipizzato come `PhaseActions`;
  aggiunta interfaccia derivata `GameTimeV2`.

### Fixed

- `ErrorFallback`: migliorata gestione messaggi errore per caricamenti dinamici;
  semplificato il recupero errore.
- Logica interazione compagni di classe e insegnante: gestione relazioni migliorata,
  blocco valori relazione tra 0 e 100.
- `GradeProgressPanel`: gestiti i casi senza materie attive.

### Changed

- `Friend`: aggiunti `gender`, `carisma`, `relazione`, `schoolYearMet`; `affinita`
  deprecato (letto solo da `migrateLegacyFriend()`).
- `FriendType`: aggiunto valore `'generico'`.
- Rimossi `SUBJECT_WEIGHTS` deprecati da `types.ts`.
- `GameDialogs` aggiornato con memoizzazione per ottimizzazione prestazioni.
- Ruoli accessibilità aggiunti ai pannelli principali per screen reader.

## [0.1.1] - 2026-04-07

### Fixed

- Hotfix `SchoolMorningPanel`: reset eventi scolastici corretto; riconciliazione
  DOM al cambio `isComplete` usando keying/Suspense controllata.

## [0.1.0] - 2026-04-07

### Added

- Sistema scolastico avanzato — fondamenta (Fasi 1A–1F, 2D–2E, 3A–3C, 4):
  - `school-timetable.ts`: generatore orario settimanale (Fase 1B/1C).
  - `school-roster.ts`: generatore registro classe (Fase 1D).
  - `school-teachers.ts`: generatore corpo docente (Fase 1E).
  - `useSchoolSystem`: hook orchestratore del sottosistema scuola (Fase 1F).
  - `handleVaiAScuola` + `consumeAllMorningActions` (Fase 2D).
  - `SchoolMorningPanel` con gestione slot (Fase 2E).
  - `teacher-relations.ts`: relazioni prof + eventi contestuali (Fase 3A).
  - `classmate-relations.ts`: relazioni compagni + interazioni (Fase 3B).
  - `school-roster-transitions.ts`: transizioni annuali (Fase 3C).
  - `SchoolBreakPanel` + 9 azioni intervallo (Fase 4).
  - `initSchoolYear` integrato nell'onboarding `SchoolSelection`.
- `SchoolRecord.isAtSchool: boolean` persistito in KV.
- `school-day-engine.ts`, `school-day-templates.ts`, `school-structured-events.ts`:
  sistema eventi scolastici con filtri per materia e attributi insegnante.
- `school-actions.ts`, `school-break-actions.ts`, `school-event-handlers.ts`.
- `exam-system.ts`: generazione centralizzata prove programmate con builder strutturati.
- Logica guard per il comando "Avanza fase": bloccata durante la sequenza mattutina
  scolastica attiva.
- `docs/architecture.md`, `docs/api.md`: documentazione iniziale del progetto.

### Fixed

- Riconciliazione DOM durante la sequenza `SchoolMorningPanel`: aggiornamenti stato
  parent deferriti con `setTimeout(..., 0)` per evitare errori `removeChild`.

[Unreleased]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.5.2...v0.6.0
[0.5.2]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/Nemex81/tabboz-simulator-202/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Nemex81/tabboz-simulator-202/releases/tag/v0.1.0
