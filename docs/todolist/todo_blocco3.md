# Analisi preventiva — Blocco 3 UI/Accessibilità

Questa checklist va completata prima di qualsiasi implementazione o refactor del Blocco 3.

## [3.1] SchoolTab — Riduzione tab annidati
- [ ] Confermare i sotto-tab reali: home, voti, verifiche, amici, dashboard
- [ ] Mappare per ogni combinazione di dayType, currentPhase, isSchoolPeriod, morningChoicePending, marinatoOggi, hasActiveSchoolSequence quali pannelli sono visibili o attivi
- [ ] Verificare se SchoolMorningPanel e SchoolBreakPanel sostituiscono i sotto-tab o convivono con essi
- [ ] Valutare se home e voti possono diventare sezioni verticali o accordion senza regressioni NVDA
- [ ] Definire criterio di uscita: diagramma stati approvato + mockup del layout alternativo + test SR

## [3.2] DailyControls — Replica contestuale
- [ ] Leggere il codice completo di DailyControls.tsx e mappare tutta la logica di guard
- [ ] Verificare se conviene estrarre useDailyControlsState() prima di replicare il footer nei tab
- [ ] Stabilire se il footer contestuale deve replicare tutti i pulsanti o una versione ridotta
- [ ] Definire comportamento in caso di transizione fase o click ripetuti durante animazioni
- [ ] Stimare il costo di coupling aggiuntivo verso AppHeader, SchoolTab, SocialTab e CityTab

## [3.3] UI globale — Border-radius e uppercase
- [ ] Verificare se basta cambiare --radius in src/index.css o serve allineamento anche in tailwind.config.js
- [ ] Misurare quante occorrenze di uppercase tracking-wider esistono nel codebase e classificarle per uso corretto o da ridurre
- [ ] Verificare l'impatto globale su componenti Shadcn/ui che derivano il radius da CSS variables o classi rounded-*
- [ ] Definire piano di test visuale sui 3 temi per card, dialog, badge, popover e pulsanti
- [ ] Stabilire i criteri WCAG per testo grande o normale prima di rivedere i titoli
