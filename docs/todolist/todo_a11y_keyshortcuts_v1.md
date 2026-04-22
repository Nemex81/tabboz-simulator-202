 - [x] Audit: trovare tutti i punti che espongono (o documentano) shortcut esistenti nei componenti e nei tab (`src/components/`, `src/components/tabs/`).
 - [x] Per ciascun elemento interattivo che già documenta una shortcut, aggiungere `aria-keyshortcuts` con la stringa appropriata (es. `Ctrl+1`, `Ctrl+Shift+A`).
	 - Nota: `ActionButton` ora espone `aria-keyshortcuts` in modo condizionale; `DailyControls` espone `Control+Alt+Enter` per "Prossima fase".
 - [x] Verificare che l'aggiunta di `aria-keyshortcuts` non introduca attributi duplicati o invalide stringhe.
 - [x] Assicurarsi che le shortcut annotate non interferiscano con input testuali (controllo di scope e focus nelle pagine interessate).
 - [x] Eseguire `npx tsc --noEmit` e `npm run test` per confermare che le modifiche non rompono la build o i test.
 - [x] Documentare in `docs/` (breve nota) l'elenco dei file aggiornati e lo schema usato per `aria-keyshortcuts`.

Nota (2026-04-22): Fase C completata per gli elementi prioritari; aggiunte le annotazioni `aria-keyshortcuts` richieste e validati i gate.
