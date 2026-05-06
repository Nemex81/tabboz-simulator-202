Piano tecnico: Unificazione Live Region e annotazione delle scorciatoie

Data: 2026-04-22

## Verdetto
PASS con riserve.

## Obiettivo sintetico
Allineare gli annunci accessibili (live region) e le annotazioni di shortcut al design validato, limitando il perimetro iniziale alle fasi A/B/C indicate sotto.

## Perimetro vincolante
- IN (solo Fase A/B/C):
  - A) Unificare le live region esistenti: convergere gli announce verso `src/lib/a11y-announce.ts` e rimuovere le live region inline in `src/App.tsx`.
  - B) Rendere `src/components/ActionButton.tsx` "auto-wired" verso l'annunciatore globale (`src/lib/a11y-announce.ts`) e rimuovere il prop `announce` dai call site reali.
  - C) Aggiungere `aria-keyshortcuts` agli elementi interattivi che già espongono shortcut documentate; non introdurre un nuovo keyboard manager.
- OUT (fuori scope in questo ciclo): `StatsDashboard`, refactor di pannelli grandi, nuove infrastrutture per shortcuts, cambi di framework.

## File di riferimento (da usare nei documenti e nelle implementazioni)
- `src/App.tsx`
- `src/lib/a11y-announce.ts`
- `src/components/A11yLiveRegion.tsx`
- `src/components/ActionButton.tsx`
- `src/components/AdvancePhaseButton.tsx`
- call site reali nei tab (es. file sotto `src/components/tabs/` che attivano azioni)

## Fasi (sequenza minima)
- Fase A — Unificazione Live Region (1-3 giorni)
  - Audit: individuare tutte le live region inline (particolarmente in `src/App.tsx`) e i punti che chiamano announce direttamente.
  - Implementare o stabilizzare `src/lib/a11y-announce.ts` come single source of truth per gli annunci.
  - Aggiornare `src/components/A11yLiveRegion.tsx` per consumare l'annunciatore centrale.

- Fase B — ActionButton auto-wired (1-2 giorni)
  - Modificare `src/components/ActionButton.tsx` per usare `src/lib/a11y-announce.ts` internamente.
  - Rimuovere il prop `announce` dai call site reali (es. `src/components/AdvancePhaseButton.tsx` e altri bottoni nei tab).

- Fase C — Annotazioni `aria-keyshortcuts` (0.5-1 giorno)
  - Audit: individuare elementi che già espongono shortcut documentate nei componenti/tab.
  - Aggiungere `aria-keyshortcuts` a quegli elementi (nessun nuovo keyboard manager o overlay).

## Gate di validazione
- `npx tsc --noEmit` — nessun errore di tipo.
- `npm run test` — tutti i test esistenti devono passare.
- `npm run build` — build senza errori; review warning se impattano il cambiamento.

## Rischi mitigati
- Regressioni locali su componenti che usavano `announce` inline: mitigare con test unitari locali e check dei call site aggiornati.

## Note operative
- I documenti TODO correlati (in `docs/todolist/`) sono checklist eseguibili e referenziano i file reali sopra. Non introdurre nuovi manager o infrastrutture in questo ciclo.

