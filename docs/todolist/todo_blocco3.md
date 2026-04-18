# Analisi preventiva — Blocco 3 UI/Accessibilità

Questa checklist va completata prima di qualsiasi implementazione o refactor del Blocco 3.

## [3.1] SchoolTab — Riduzione tab annidati
- [x] Confermare i sotto-tab reali: home, voti, verifiche, amici, dashboard
- [x] Mappare per ogni combinazione di dayType, currentPhase, isSchoolPeriod, morningChoicePending, marinatoOggi, hasActiveSchoolSequence quali pannelli sono visibili o attivi
- [x] Verificare se SchoolMorningPanel e SchoolBreakPanel sostituiscono i sotto-tab o convivono con essi
- [x] Valutare se home e voti possono diventare sezioni verticali o accordion senza regressioni NVDA
- [x] Definire criterio di uscita: diagramma stati approvato + mockup del layout alternativo + test SR

Esito analisi:
- I sotto-tab reali sono confermati: home, voti, verifiche, amici, dashboard.
- SchoolMorningPanel e SchoolBreakPanel vivono dentro TabsContent value="home" come rami condizionali, non come sotto-tab separati.
- hasActiveSchoolSequence e una const locale in SchoolTab con 5 condizioni in AND: dayType feriale, currentPhase mattina, isSchoolPeriod, wentToSchoolToday, schoolDayState con slot e non completo.
- Il layout mobile usa grid-cols-3 per 5 tab: prima di qualsiasi refactor accordion serve test su viewport 320px e mockup approvato.
- Implementazione B3-1-T5 completata. Restano aperti i test manuali su viewport 320px e NVDA navigazione sotto-tab.

## [3.2] DailyControls — Replica contestuale
- [x] Leggere il codice completo di DailyControls.tsx e mappare tutta la logica di guard
- [x] Verificare se conviene estrarre useDailyControlsState() prima di replicare il footer nei tab
- [x] Stabilire se il footer contestuale deve replicare tutti i pulsanti o una versione ridotta
- [x] Definire comportamento in caso di transizione fase o click ripetuti durante animazioni
- [x] Stimare il costo di coupling aggiuntivo verso AppHeader, SchoolTab, SocialTab e CityTab

Esito analisi:
- La guard reale e centralizzata in App.tsx dentro handleAdvancePhaseGuarded; DailyControls duplica solo il calcolo canAdvance per disabled, label e aria-label.
- DailyControls oggi e usato solo in AppHeader; nessun tab lo importa direttamente.
- Estrarre useDailyControlsState() ora non conviene: farlo solo se il footer verra davvero replicato nei tab.
- Il click ripetuto e gia mitigato dal disabled UI e dalla guard centralizzata; resta solo da decidere se il footer contestuale debba mostrare tutti i pulsanti o solo Prossima fase.

Decisione: opzione B — footer ridotto. Implementato AdvancePhaseButton.tsx standalone. Aggiunto a SchoolTab, SocialTab, CityTab.

## [3.3] UI globale — Border-radius e uppercase
- [x] Verificare se basta cambiare --radius in src/index.css o serve allineamento anche in tailwind.config.js
- [x] Misurare quante occorrenze di uppercase tracking-wider esistono nel codebase e classificarle per uso corretto o da ridurre
- [x] Verificare l'impatto globale su componenti Shadcn/ui che derivano il radius da CSS variables o classi rounded-*
- [x] Definire piano di test visuale sui 3 temi per card, dialog, badge, popover e pulsanti
- [x] Stabilire i criteri WCAG per testo grande o normale prima di rivedere i titoli

Esito analisi:
- Per cambiare il radius globale basta intervenire su --radius nei tre blocchi tema di src/index.css; tailwind.config.js non richiede modifiche.
- Le occorrenze di uppercase tracking-wider censite sono 6: 5 label UI text-xs coerenti, 1 label ActionButton text-sm bold da misurare sul contrasto prima di cambiare stile.
- I componenti Shadcn/ui seguono gia le CSS variables del radius e verranno aggiornati automaticamente.
- Restano due punti separati dal Blocco 3 ma rilevanti per la coerenza grafica: SchoolHomePanel e SchoolBreakPanel usano ancora colori hardcoded fuori sistema tema.

Note implementazione (B3-3):
- --radius aggiornato a 0.5rem nei tre blocchi tema (default, dark, green) in src/index.css.
- ActionButton contiene `uppercase tracking-wider` sul label (text-sm font-bold). Non è possibile misurare oggettivamente il contrasto con tool di analisi statica del codice. Il codice ActionButton è rimasto invariato. Verifica manuale WCAG su tutti e 3 i temi rimane necessaria prima di qualsiasi modifica allo stile uppercase.
