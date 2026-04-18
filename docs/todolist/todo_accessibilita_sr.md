# Sessione accessibilità SR — aprile 2026

## [A] Label SR su pulsanti icona
- [x] Censimento pulsanti senza aria-label
- [x] SchoolBreakPanel verificato: nessun fix necessario nel perimetro auditato
- [x] SchoolMorningPanel verificato: nessun fix necessario nel perimetro auditato
- [x] EnhancedFriendsPanel verificato: nessun fix necessario nel perimetro auditato
- [x] RelationCard verificato: nessun fix necessario nel perimetro auditato
- [x] AppHeader verificato: nessun fix necessario nel perimetro auditato
- [x] CityPanel verificato: nessun fix necessario nel perimetro auditato
- [x] TeachersPanel verificato: nessun fix necessario nel perimetro auditato
- [x] Verifica manuale NVDA post-fix (test manuale)

## [B] Consumo azioni garantito
- [x] Creazione src/hooks/useActionGuard.ts
- [x] Integrazione in SchoolBreakPanel
- [x] Integrazione in SchoolMorningPanel
- [x] Verifica TeachersPanel: gia conforme, nessun guard aggiuntivo necessario
- [x] Verifica CityPanel: handler esterni gia consumano a monte
- [x] Verifica manuale: tutte le azioni scalano correttamente le azioni di fase disponibili

## [C] Navigazione SR — landmark e hidden
- [x] aria-label su TabsList in MainGameTabs.tsx
- [x] hidden corretto su TabsContent inattivi in MainGameTabs.tsx
- [x] aria-label su TabsList in SchoolTab.tsx
- [x] hidden corretto su TabsContent inattivi in SchoolTab.tsx
- [x] Verifica CityTab.tsx e SocialTab.tsx
- [x] Verifica manuale NVDA: navigazione landmark con tasto D
- [x] Verifica manuale NVDA: Tab tra i pannelli senza scorrere contenuto dei pannelli inattivi

## Metadati
Generato: aprile 2026
Stato: implementazione completata — test manuali aperti
File analizzati:
- docs/tabboz_ui_technical_plan.md
- docs/tabboz_ui_implementation_proposal.md
- docs/TODO.md
- docs/todolist/todo_blocco1.md
- docs/todolist/todo_blocco2.md
- docs/todolist/todo_blocco3.md
- src/components/ActionButton.tsx
- src/components/MainGameTabs.tsx
- src/components/AppHeader.tsx
- src/components/SchoolBreakPanel.tsx
- src/components/SchoolMorningPanel.tsx
- src/components/EnhancedFriendsPanel.tsx
- src/components/RelationCard.tsx
- src/components/CityPanel.tsx
- src/components/TeachersPanel.tsx
- src/components/tabs/SchoolTab.tsx
- src/components/tabs/CityTab.tsx
- src/components/tabs/SocialTab.tsx
- src/components/ui/tabs.tsx
- src/components/FriendshipsPanel.tsx
- src/hooks/useActionGuard.ts
- src/hooks/useGameRelations.ts
- src/hooks/useSocialActions.ts
- src/hooks/useSchoolHandlers.ts
- src/hooks/useEconomyActions.ts
- src/hooks/useLifestyleActions.ts

## Sessione audit esteso SR — aprile 2026

### Problemi aggiuntivi trovati
- MainGameTabs: mancava un landmark di navigazione esplicito attorno al menu tab principale.
- MainGameTabs: al cambio tab il focus restava sui trigger, senza trasferimento programmatico all'inizio del pannello attivo.
- SchoolTab: mancava un landmark di navigazione esplicito per i sotto-tab.
- SchoolTab: al cambio sotto-tab mancava il focus transfer verso il pannello attivo.
- SocialTab: la gerarchia heading partiva da h3 senza un h2 di pannello.
- SchoolTab: mancava un h2 di pannello per mantenere la gerarchia lineare con AppHeader h1.
- SchoolBreakPanel: i gruppi di scelta compagno/professore esponevano singoli role="radio" senza radiogroup esplicito.
- ui/dialog.tsx e ui/sheet.tsx: pulsanti close con testo SR in inglese e senza aria-label esplicito in italiano.

### Fix applicati
- [x] [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx) — close button localizzato con aria-label "Chiudi dialogo" e icona marcata aria-hidden.
- [x] [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) — close button localizzato con aria-label "Chiudi pannello" e icona marcata aria-hidden.
- [x] [src/components/SchoolBreakPanel.tsx](src/components/SchoolBreakPanel.tsx) — aggiunti radiogroup espliciti ai selettori di compagni e professori.
- [x] [src/components/tabs/SocialTab.tsx](src/components/tabs/SocialTab.tsx) — aggiunto h2 semantico di pannello.
- [x] [src/components/tabs/SchoolTab.tsx](src/components/tabs/SchoolTab.tsx) — aggiunto h2 semantico di pannello, landmark nav per i sotto-tab e focus transfer al cambio sotto-tab.
- [x] [src/components/MainGameTabs.tsx](src/components/MainGameTabs.tsx) — aggiunto landmark nav per il menu principale e focus transfer al cambio tab.

### Ancora aperti
- [x] Verifica manuale NVDA: heading con tasto H sui pannelli principali e scolastici.
- [x] Verifica manuale NVDA: landmark con tasto D su menu principale e sezioni scuola.
- [x] Verifica manuale NVDA: ordine di lettura dopo il focus transfer al cambio tab.
- [x] Verifica manuale NVDA: annunci delle azioni via live region restano coerenti durante il cambio pannello.
- [x] Verifica manuale comportamento mobile 320px e 375px dopo i wrapper nav aggiunti.