 - [x] Audit: trovare e annotare tutte le live region inline (es. in `src/App.tsx`) e i punti che eseguono announce direttamente.
 - [x] Stabilizzare/implementare `src/lib/a11y-announce.ts` come single source of truth per gli annunci (API minimal: `announce(text, options?)`).
 - [x] Aggiornare `src/components/A11yLiveRegion.tsx` per consumare `src/lib/a11y-announce.ts` e rimuovere duplicazioni di live region.
 - [x] Rimuovere live region inline e le chiamate dirette a announce da `src/App.tsx`, sostituendole con l'uso di `src/lib/a11y-announce.ts`.
 - [x] Verificare comportamento in sviluppo: eseguire `npx tsc --noEmit`, `npm run test` e `npm run build`.
 - [x] Verifica manuale: con NVDA/VoiceOver, controllare che gli annunci risultino leggibili e non causino layout shift. (confermata durante validazione)
 - [x] Documentare brevemente l'uso in `docs/` con esempi di chiamata a `src/lib/a11y-announce.ts` e il riferimento a `src/components/A11yLiveRegion.tsx`.

Nota (2026-04-22): Fase A completata e validate le build/test. Live region inline centralizzate in `src/lib/a11y-announce.ts`.
