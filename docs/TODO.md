<<<<<<< HEAD
- 2026-04-23: corretti i doppi annunci A11y su `useGameNarrator` al primo mount e su `ActionButton` da tastiera; aggiunti test di non regressione mirati.
- 2026-04-23: completato il sistema `useGameNarrator` con `A11yProvider` e live region dual-channel per annunci di fase, giorno, salute, soldi, delta statistiche ed eventi automatici pomeridiani.
- 2026-04-23: aggiornati `ActionButton`, root App e suite Vitest mirata per il nuovo flusso annunci accessibili compatibile con screen reader.
=======
>>>>>>> 36b249777e886e265f6b221cc3f6c42204cebb17
- 2026-04-22: ripristinato il focus dal CTA mattutino al pulsante Vai a Scuola nel tab Scuola.
- 2026-04-22: corretta la scorciatoia Ctrl+Alt+Invio per usare Vai a dormire durante la fase notte.
- 2026-04-22: aggiunto test di regressione per useKeyboardShortcuts sul ramo notturno.

2026-04-22: Ciclo A/B/C per miglioramenti A11Y completato.
- Dettagli: Fase A (centralizzazione announce in `src/lib/a11y-announce.ts` e rimozione di live region inline in `src/App.tsx`), Fase B (rimozione prop `announce` da `ActionButton`; SchoolTab mantiene `announce` solo dove necessario), Fase C (introduzione condizionale di `aria-keyshortcuts` su `ActionButton`; `DailyControls` espone `Control+Alt+Enter` per "Prossima fase").
- Gate di validazione superati: `npx tsc --noEmit`, `npm run test`, `npm run build`.
- Rinviato / Fuori scope: `StatsDashboard` e grandi refactor di pannelli.