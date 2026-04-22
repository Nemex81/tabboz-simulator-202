# TODO — Blocco 2 UI/Accessibilità

Ordine consigliato: 2.3 e 2.4 prima, poi 2.2, infine 2.1.

## [2.3] Badge categoria adattivi al tema
- File: src/components/SchoolMorningPanel.tsx
- Stato: [x] FATTO
- Dipende da: nessuno
- Stima: 15 minuti
- Test: verifica visiva e contrasto su 3 temi; badge leggibili per 7 categorie reali; npx tsc --noEmit
- Note: mantenere Record<MorningEventCategory, string>; non convertire in switch

## [2.4] Accessibilità tab mobile con emoji
- File: src/components/MainGameTabs.tsx
- Stato: [x] FATTO
- Dipende da: 1.3
- Stima: 20 minuti
- Test: NVDA legge Personaggio e Impostazioni invece del nome Unicode emoji; verifica mobile span; npx tsc --noEmit
- Note: intervenire solo sui tab character e status; preferire aria-label su TabsTrigger
- Note sessione: completato in sessione accessibilita SR — aprile 2026

## [2.2] Shortcut e link diretto al tab Scuola
- File: src/components/AppHeader.tsx
- Stato: [x] FATTO
- Dipende da: nessuno
- Stima: 45 minuti
- Test: pulsante Vai a Scuola nel banner funzionante; Alt+S apre il tab school; KeyboardShortcutsDialog aggiornato; NVDA annuncia la navigazione
- Note: modifiche collaterali richieste in src/App.tsx, src/hooks/useKeyboardShortcuts.ts e src/components/KeyboardShortcutsDialog.tsx; usare callback onGoToSchool, non passare setActiveTab
- Note sessione: completato in sessione accessibilita SR — aprile 2026

## [2.1] Tab contestuali per fase di gioco
- File: src/components/MainGameTabs.tsx
- Stato: [x] FATTO
- Dipende da: 1.3, 2.4
- Stima: 90 minuti
- Test: tab school/city/social si abilitano o disabilitano per fase reale; redirect automatico verso social se il tab attivo diventa non disponibile; NVDA legge la motivazione via aria-label; npx tsc --noEmit e npm run test
- Note: modifica collaterale obbligatoria in src/App.tsx per aggiungere currentPhase a MainGameTabsProps; usare solo DayPhase reali in italiano
- Note sessione: completato in sessione accessibilita SR — aprile 2026
