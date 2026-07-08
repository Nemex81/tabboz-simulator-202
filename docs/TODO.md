# TODO

- 2026-07-08: Aggiunti e bilanciati tre lavori part-time accessibili a 14 anni (minSchoolYear: 1): Dogsitter (paga 15€, mattina/pomeriggio), Volantinaggio (paga 12€, pomeriggio feriali/sabato) e Consegna Giornali (paga 18€, mattina feriali/sabato).
- 2026-07-07: Riorganizzazione completa UI/UX e introduzione della navigazione geografica (Popomundo style) con tab Home (Sommario), Luogo (Location-locked actions), Città (Mappa degli spostamenti con SFX), e integrazione delle azioni personali nella scheda Personaggio (sub-tab Azioni). Implementata scorciatoia Shift+M / M per stato rapido accessibile.
- 2026-04-23: corretti i doppi annunci A11y su `useGameNarrator` al primo mount e su `ActionButton` da tastiera; aggiunti test di non regressione mirati.
- 2026-04-23: completato il sistema `useGameNarrator` con `A11yProvider` e live region dual-channel per annunci di fase, giorno, salute, soldi, delta statistiche ed eventi automatici pomeridiani.
- 2026-04-23: aggiornati `ActionButton`, root App e suite Vitest mirata per il nuovo flusso annunci accessibili compatibile con screen reader.
- 2026-04-23: reso persistente `tabboz-game-log` tramite `useHydratedKV` e aggiunto test regressivo sul Diario per verificare che gli eventi restino visibili dopo remount.
- 2026-04-23: aggiunto fallback locale session-wide in `useHydratedKV` quando Spark KV risponde `401 Unauthorized`, con test bootstrap/non-bootstrap per eliminare il rumore `/_spark/kv/...` in locale.
- 2026-04-23: aggiunto badge dev-only in header per segnalare il fallback KV locale attivo e coperto con test d'integrazione il caso di write pending interrotta da remount/reload.
- 2026-04-22: ripristinato il focus dal CTA mattutino al pulsante Vai a Scuola nel tab Scuola.
- 2026-04-22: corretta la scorciatoia Ctrl+Alt+Invio per usare Vai a dormire durante la fase notte.
- 2026-04-22: aggiunto test di regressione per useKeyboardShortcuts sul ramo notturno.

2026-04-22: Ciclo A/B/C per miglioramenti A11Y completato.

- Dettagli: Fase A (centralizzazione announce in `src/lib/a11y-announce.ts` e rimozione di live region inline in `src/App.tsx`), Fase B (rimozione prop `announce` da `ActionButton`; SchoolTab mantiene `announce` solo dove necessario), Fase C (introduzione condizionale di `aria-keyshortcuts` su `ActionButton`; `DailyControls` espone `Control+Alt+Enter` per "Prossima fase").
- Gate di validazione superati: `npx tsc --noEmit`, `npm run test`, `npm run build`.
- Rinviato / Fuori scope: `StatsDashboard` e grandi refactor di pannelli.
