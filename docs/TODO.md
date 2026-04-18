## Sessione UI/Accessibilità — aprile 2026

**Documento di riferimento:** `docs/tabboz_ui_implementation_proposal.md`
**Piano tecnico:** `docs/tabboz_ui_technical_plan.md`

### Blocco 1 — Immediato
- [ ] Vedi `docs/todolist/todo_blocco1.md`

### Blocco 2 — consequenziale
- [ ] Vedi `docs/todolist/todo_blocco2.md`

### Blocco 3 — Pianificazione
- [ ] Vedi `docs/todolist/todo_blocco3.md`

### Stato sessione
- [x] Piano tecnico prodotto
- [x] Piano tecnico validato
- [x] File TODO creati
- [x] todo.md aggiornato
- [x] Blocco 1 implementato
- [x] Blocco 2 implementato
- [x] Blocco 3 analisi completata
- [x] B3-1 implementazione completata (test manuali aperti)
- [x] B3-2 AdvancePhaseButton verificato in SocialTab e CityTab
- [x] B3-3 --radius 0.5rem applicato (test visuale manuale aperto)

### Blocker residui Blocco 3
- [ ] Mockup approvato e diagramma stati per il refactor SchoolTab (B3-1 ancora aperto)
- [ ] Verifica manuale WCAG contrasto ActionButton uppercase sui 3 temi

### Sessione accessibilità SR — aprile 2026
- [x] Audit pulsanti senza label SR completato
- [x] Hook useActionGuard implementato
- [x] Label SR verificate sui pulsanti icona censiti
- [x] Landmark ARIA aggiunti ai TabsList principali
- [x] hidden corretto su TabsContent inattivi
- [ ] Verifica manuale NVDA post-fix (test manuale aperto)
- [ ] Verifica manuale: consumo azioni in tutti i pannelli

### Sessione audit SR esteso — aprile 2026
- [x] Audit etichette SR su tutto src completato
- [x] Struttura heading corretta
- [x] Landmark regions aggiunte
- [x] Fix immediati etichette SR applicati
- [x] Focus management al cambio tab implementato localmente
- [ ] Verifica manuale NVDA: heading con tasto H
- [ ] Verifica manuale NVDA: landmark con tasto D
- [ ] Verifica manuale NVDA: annunci azioni con aria-live
- [ ] Verifica manuale NVDA: pulsanti tutti etichettati

### Sessione sistema azioni dual-KV — aprile 2026
- [x] Rimosso blocco avanzamento fase su azioni rimaste
- [x] Introdotto phaseActionsMax come KV separato
- [x] Badge azioni convertito da bloccante a informativo
- [x] gainExtraAction invariato (solo remaining, per design)
- [x] Test aggiornati per nuovo contratto canAdvance
- [ ] Verifica manuale: avanzamento libero con azioni rimaste
- [ ] Verifica manuale: badge X/Y corretto ad ogni fase
- [ ] Verifica manuale: school morning ancora blocca corretto
- [ ] Verifica manuale: azione bonus porta remaining > max senza bug UI

### Rifinitura Riposa e maxActions — aprile 2026
- [x] maxActions = 2 per sera e notte su tutti i dayType
- [x] Riposa non consuma più azioni
- [x] showRiposa aggiornato: mattina non scol. + pomeriggio + sera
- [x] showDormi invariato: sera + notte
- [x] disabled Riposa rimosso (non dipende più da azioni)
- [x] Test aggiornati per nuovo contratto Riposa
- [ ] Verifica manuale: Riposa disponibile sera (nuovo)
- [ ] Verifica manuale: Riposa non compare di notte
- [ ] Verifica manuale: Riposa non decrementa badge azioni
- [ ] Verifica manuale: badge notte mostra 2/2 correttamente

### Fix minori log e shortcut — aprile 2026
- [x] Titolo log Riposa dinamico: mattutino/pomeridiano/serale
- [x] Shortcut avanza fase: Ctrl+N → Ctrl+Alt+N
- [ ] Verifica manuale: diario mostra 'Riposo serale' di sera
- [ ] Verifica manuale: Ctrl+Alt+N avanza fase correttamente
- [ ] Verifica manuale: Ctrl+N non fa più nulla
	(o non interferisce con funzioni browser/sistema)

### Revisione logica fasi giornaliere — aprile 2026
- [x] Avanza fase nascosto completamente durante la notte
- [x] Dormi reso pulsante primario in sera/notte
- [x] Avanza fase disabilitato prima della scelta mattutina
- [x] Menu principale sbloccato subito dopo Marina la scuola
- [x] Avanza fase bloccato fino al completamento delle lezioni mattutine
- [ ] Verifica manuale: dopo Marina, tab Città e Azioni diventano subito disponibili
- [ ] Verifica manuale: in notte resta solo Dormi e Ctrl+Alt+Invio non avanza
- [ ] Verifica manuale: durante le lezioni il bottone Avanza resta visibile ma non attivo

### Fix azioni sociali e shortcut — aprile 2026
- [x] handleChiacchiera: migrata da interazioni ad azioni
- [x] handleNavigaOnline: migrata da interazioni ad azioni
- [x] handleTelefona: migrata da interazioni ad azioni
- [x] handleFriendAction: migrata da interazioni ad azioni
- [x] Shortcut avanza fase: Ctrl+Alt+N → Ctrl+Alt+Invio
- [x] DailyControls: testi shortcut aggiornati
- [ ] Verifica manuale: chiacchiera decrementa badge azioni
- [ ] Verifica manuale: chiacchiera non decrementa interazioni
- [ ] Verifica manuale: Ctrl+Alt+Invio avanza fase
- [ ] Verifica manuale: Ctrl+Alt+N non fa più nulla

### Fix runtime scuola mattutina e UI sociale — aprile 2026
- [x] SchoolMorningPanel: rimossa esecuzione tramite useActionGuard durante ore/intervalli/eventi scuola
- [x] Ora successiva e Fine intervallo: non consumano più azioni o interazioni
- [x] SocialTab: chiacchiera, naviga online e telefona bloccate su azioni di fase, non su interazioni
- [x] SocialTab: testo informativo aggiornato per evitare ambiguità tra azioni e interazioni
- [ ] Verifica manuale: ora successiva non decrementa il badge azioni
- [ ] Verifica manuale: Fine intervallo non decrementa il badge azioni
- [ ] Verifica manuale: chiacchiera, naviga online e telefona si bloccano solo a 0 azioni fase

### Fix correttivi runtime scuola e shortcut — aprile 2026
- [x] handleVaiAScuola: rimossa chiamata consumeAllMorningActions() (bloccava il pulsante 'Ora terminata')
- [x] KeyboardShortcutsDialog: shortcut avanza fase corretto da Ctrl+N a Ctrl+Alt+Invio (allineato a useKeyboardShortcuts.ts)
- [ ] Verifica manuale: pulsante 'Ora terminata' cliccabile durante sequenza lezioni
- [ ] Verifica manuale: Ctrl+Alt+Invio mostrato correttamente nell'aiuto scorciatoie

### Fix eventi scolastici bloccati — aprile 2026
- [x] Rimosso onConsumeAction da SchoolMorningPanel
- [x] Rimosso actionsRemaining da SchoolMorningPanel
- [x] Pulito call site in App.tsx
- [x] Verificata propagazione in tutti i componenti School*
- [ ] Verifica manuale: scelte slot funzionano
- [ ] Verifica manuale: fine intervallo funziona
- [ ] Verifica manuale: phaseActionsRemaining non scende
