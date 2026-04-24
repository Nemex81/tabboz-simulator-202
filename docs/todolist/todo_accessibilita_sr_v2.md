# TODO A11y — Ciclo correttivo aprile 2026 (v2)

> Scaletta operativa derivata da [`docs/A11Y_AUDIT_2026-04.md`](../A11Y_AUDIT_2026-04.md). Ogni voce è implementabile in modo indipendente e verificabile con `npx tsc --noEmit` + `npm run test`.

## Meta

- **Execute mode:** autonomous
- **Agente esecutore suggerito:** `Agent-CodeUI` (fallback `Agent-Code`)
- **Modello richiesto:** opus 4.7
- **Validazione:** `npx tsc --noEmit` + `npm run test`
- **Definition of Done per item:** codice aggiornato, type-check verde, test verde, voce spuntata qui.

---

## Fase P0 — Bloccanti SR

### P0.1 — Lingua HTML
- [x] Cambiare `index.html` `<html lang="en" ...>` → `<html lang="it" ...>`.

### P0.2 — CSS globali (focus-visible + reduced-motion)
- [x] Aggiungere a `src/index.css` la regola `:focus-visible` globale con `outline` basato su `--ring`/`--primary`.
- [x] Aggiungere media query `@media (prefers-reduced-motion: reduce)` che azzeri `animation-duration` e `transition-duration`.
- [x] Aggiungere regole dedicate per `button`, `input`, `select`, `textarea`, `a[href]`, `[role="tab"]`, `[role="button"]`.

### P0.3 — Live region globale + Toaster
- [x] Creare `src/components/A11yLiveRegion.tsx` con `role="status"`, `aria-live="polite"`, `aria-atomic="true"`, class `sr-only`.
- [x] Creare helper `src/lib/a11y-announce.ts` con funzione `announce(message: string, priority?: 'polite' | 'assertive')` che scrive su `#a11y-live-region` (duplicando un secondo nodo `assertive` se necessario).
- [x] Montare `<A11yLiveRegion />` in `src/main.tsx` subito dopo `<App />`.
- [x] Aggiornare `<Toaster />` in `src/main.tsx` con `toastOptions` coerenti (`duration: 4500`, `closeButton`, `richColors`).
- [ ] Refactor `announce()` callback di `useKeyboardShortcuts`, `MainGameTabs`, `SocialTab`, ecc. per delegare al nuovo helper centrale.

### P0.4 — Grafici recharts accessibili
- [x] In `src/components/StatsDashboard.tsx`: wrappare il `RadarChart` in un contenitore `role="img"` con `aria-label` sintetico (statistiche principali) e aggiungere `<p className="sr-only">` con descrizione estesa.
- [x] Stesso pattern per il `BarChart` voti (titolo + media + elenco voto per materia).
- [x] Verificare nessun altro grafico recharts in altri componenti; in caso, applicare lo stesso pattern.

### P0.5 — Mitigazione colore-only
- [x] `src/components/GradeProgressPanel.tsx`: aggiungere `role="progressbar"` sulla barra voto con `aria-valuenow/min/max` e `aria-label` testuale (`"Eccellente"`, `"Sufficiente"`, `"Insufficiente"`).
- [x] `src/components/ExamsPanel.tsx`: al badge "DOMANI!" aggiungere span `sr-only` "Scadenza imminente" e/o `aria-label` esplicito sull'elemento contenitore.
- [ ] Verificare eventuali altri indicatori solo cromatici in `HealthRecordPanel`, `StatsDashboard`, `RelationCard` e mitigare con testo aggiuntivo.

---

## Fase P1 — Importanti

### P1.1 — Skip-to-content + landmark main
- [x] In `src/App.tsx`, aggiungere come primo figlio del fragment superiore un `<a href="#main-content" className="sr-only focus:not-sr-only ...">Salta al contenuto principale</a>`.
- [x] Avvolgere il contenuto principale in `<main id="main-content" role="main">`.
- [x] Aggiungere se necessario `tabIndex={-1}` sul main per ricevere focus programmatico.

### P1.2 — ErrorFallback accessibile
- [x] In `src/ErrorFallback.tsx` avvolgere il fallback in `role="alert"` + `aria-live="assertive"`.
- [x] Introdurre `<h1>` semantico.
- [x] Assegnare `autoFocus` al bottone di ripristino.
- [x] Uniformare testo fallback in italiano.

### P1.3 — Annuncio cambio tab in MainGameTabs
- [x] In `src/components/MainGameTabs.tsx`, invocare `announce()` (helper P0.3) al cambio tab con label leggibile (es. "Scheda scuola aperta").
- [x] Mantenere il focus transfer esistente.

### P1.4 — TimeDisplay live region completa
- [x] In `src/components/TimeDisplay.tsx` promuovere l'intero `role="region"` a `aria-live="polite"` + `aria-atomic="true"`.
- [x] Rimuovere live region duplicata interna se ridondante.

### P1.5 — CharacterSheet TabsTrigger
- [x] Aggiungere `aria-label` esplicito a ogni `TabsTrigger` di `src/components/CharacterSheet.tsx` (Profilo, Scuola, Relazioni, Diario, Salute, Obiettivi).

### P1.6 — Progressbar HP / energia
- [x] Applicare `role="progressbar"` + `aria-valuenow/min/max` + `aria-label` a eventuali barre HP/energia in `HealthRecordPanel` e `StatDisplay`.

### P1.7 — Heading sr-only per CityTab / StatusTab
- [x] Verificare presenza `h2 sr-only` in `src/components/tabs/CityTab.tsx` e `src/components/tabs/StatusTab.tsx`; aggiungere se assente.

### P1.8 — ActionButton + helpText
- [x] In `src/components/ActionButton.tsx`, se `helpText` è presente, renderizzarlo con `id` stabile e collegarlo via `aria-describedby` al bottone.

---

## Fase P2 — Nice-to-have

### P2.1 — Focus ring CSS fisso
- [ ] Rimuovere `focus:ring-primary/50` da `ActionButton.tsx` e affidarsi allo stile globale di `:focus-visible` definito in P0.2.

### P2.2 — Figcaption descrittivo grafici
- [ ] Completare `StatsDashboard` con `<figure>` + `<figcaption className="sr-only">` con narrazione dati.

### P2.3 — Simboli genere/età
- [ ] In `AppHeader.tsx`, sostituire `♂`/`♀` con testo o aggiungere `aria-label` sul wrapper (es. "Genere maschile").

### P2.4 — Contrasto temi secondari
- [ ] Misurare contrasto per "Black Violet" e "Ganja Style" (tool esterno), documentare in `docs/THEME_SYSTEM.md` se serve aggiornamento.

### P2.5 — Test responsive SR
- [ ] Checklist manuale 320/375/400 px + zoom 200%: verifica focus visibile e label non tagliate. Annotare esito nel report.

### P2.6 — Regressione automatica a11y
- [ ] Valutare integrazione `@axe-core/react` o `vitest-axe` in `src/test-setup.ts` per smoke test dei pannelli principali.

---

## Validazione finale del ciclo

- [ ] `npx tsc --noEmit` senza errori.
- [ ] `npm run test` senza regressioni.
- [ ] Rileggere [`docs/A11Y_AUDIT_2026-04.md`](../A11Y_AUDIT_2026-04.md) per verifica coerenza.
- [ ] Aggiornare [`docs/TODO.md`](../TODO.md) con riferimento al ciclo completato.
- [ ] Eseguire almeno uno screen-reader smoke test manuale (NVDA o VoiceOver) sui flussi principali: avvio, cambio tab, dialog, toast, game over.
