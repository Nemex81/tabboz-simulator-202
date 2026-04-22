- 2026-04-22: ripristinato il focus dal CTA mattutino al pulsante Vai a Scuola nel tab Scuola.
- 2026-04-22: corretta la scorciatoia Ctrl+Alt+Invio per usare Vai a dormire durante la fase notte.
- 2026-04-22: aggiunto test di regressione per useKeyboardShortcuts sul ramo notturno.

2026-04-22: Ciclo A/B/C per miglioramenti A11Y completato.
- Dettagli: Fase A (centralizzazione announce in `src/lib/a11y-announce.ts` e rimozione di live region inline in `src/App.tsx`), Fase B (rimozione prop `announce` da `ActionButton`; SchoolTab mantiene `announce` solo dove necessario), Fase C (introduzione condizionale di `aria-keyshortcuts` su `ActionButton`; `DailyControls` espone `Control+Alt+Enter` per "Prossima fase").
- Gate di validazione superati: `npx tsc --noEmit`, `npm run test`, `npm run build`.
- Rinviato / Fuori scope: `StatsDashboard` e grandi refactor di pannelli.