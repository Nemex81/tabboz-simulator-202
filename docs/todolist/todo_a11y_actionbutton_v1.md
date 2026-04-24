 - [x] Audit `src/components/ActionButton.tsx` e verificare che supporti `aria-label` e, se rilevante, `aria-pressed`.
 - [x] Modificare `src/components/ActionButton.tsx` per usare internamente `src/lib/a11y-announce.ts` (auto-wired). Rimuovere prop `announce` dall'API pubblica del componente.
 - [x] Aggiornare call site reali (es. `src/components/AdvancePhaseButton.tsx` e bottoni nei tab) per non passare più `announce` e verificare comportamento keyboard.
 - [x] Assicurare che i bottoni rispondano a `Enter` e `Space` in modo coerente e che il focus ring sia visibile secondo il tema.
 - [x] Eseguire `npx tsc --noEmit`, `npm run test` e verificare che non ci siano regressioni.
 - [x] Documentare nel componente (README o commento) l'uso dell'annunciatore centrale e mostrare un esempio con `AdvancePhaseButton`.

Nota (2026-04-22): Fase B completata. `ActionButton` non espone più il prop `announce`; le chiamate di announce sono centralizzate.
