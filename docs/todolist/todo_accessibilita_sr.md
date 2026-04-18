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
- [ ] Verifica manuale NVDA post-fix (test manuale)

## [B] Consumo azioni garantito
- [x] Creazione src/hooks/useActionGuard.ts
- [x] Integrazione in SchoolBreakPanel
- [x] Integrazione in SchoolMorningPanel
- [x] Verifica TeachersPanel: gia conforme, nessun guard aggiuntivo necessario
- [x] Verifica CityPanel: handler esterni gia consumano a monte
- [ ] Verifica manuale: tutte le azioni scalano correttamente le azioni di fase disponibili

## [C] Navigazione SR — landmark e hidden
- [x] aria-label su TabsList in MainGameTabs.tsx
- [x] hidden corretto su TabsContent inattivi in MainGameTabs.tsx
- [x] aria-label su TabsList in SchoolTab.tsx
- [x] hidden corretto su TabsContent inattivi in SchoolTab.tsx
- [x] Verifica CityTab.tsx e SocialTab.tsx
- [ ] Verifica manuale NVDA: navigazione landmark con tasto D
- [ ] Verifica manuale NVDA: Tab tra i pannelli senza scorrere contenuto dei pannelli inattivi

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