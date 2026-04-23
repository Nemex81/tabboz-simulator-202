# Piano tecnico implementativo - Fix doppi annunci A11y

Data: 2026-04-23

## Verdetto
PASS con fix locale a basso rischio.

## Problema
- `useGameNarrator` annunciava la fase iniziale due volte al mount per overlap tra debounce phase watcher e effect dedicato al bootstrap.
- `ActionButton` annunciava `helpText` due volte da tastiera per sovrapposizione tra `keydown` e `click` sintetico del bottone nativo.

## Strategia correttiva
- Mantenere un'unica sorgente di annuncio per ciascun evento osservato.
- Ridurre la modifica al minimo, senza introdurre nuovi state machine o debounce aggiuntivi.
- Blindare i due comportamenti con test di non regressione espliciti sui conteggi delle chiamate.

## File coinvolti
- `src/hooks/useGameNarrator.ts`
- `src/components/ActionButton.tsx`
- `src/hooks/useGameNarrator.test.ts`
- `src/components/ActionButton.test.tsx`
- `CHANGELOG.md`
- `docs/TODO.md`

## Piano operativo
1. Rimuovere da `useGameNarrator` l'effect dedicato all'annuncio iniziale e lasciare il solo watcher debounced della fase.
2. Rimuovere da `ActionButton` l'annuncio in `keydown`, mantenendo l'annuncio nel solo `click` del bottone nativo.
3. Aggiornare i test per verificare che il mount iniziale del narrator e l'attivazione tastiera del bottone producano una sola chiamata `announce`.
4. Validare con typecheck e test mirati, poi riallineare changelog e TODO.

## Validazione
- `npx vitest run src/hooks/useGameNarrator.test.ts src/components/ActionButton.test.tsx --reporter=verbose`
- `npx tsc --noEmit`

## Impatto
- Nessuna modifica API pubblica.
- Nessuna dipendenza nuova.
- Migliora l'esperienza screen reader evitando annunci duplicati.