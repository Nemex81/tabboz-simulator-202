A11Y Coordinator — Dipendenze e checklist eseguibile

Dipendenze principali (diagramma minimale):
- A → B (Fase A è prerequisito per Fase B)
- C è indipendente (può essere eseguita in parallelo a B quando A è completata)

File chiave di riferimento: `src/App.tsx`, `src/lib/a11y-announce.ts`, `src/components/A11yLiveRegion.tsx`, `src/components/ActionButton.tsx`, `src/components/AdvancePhaseButton.tsx`

Checklist eseguibile (flat)
- [x] Eseguire audit per live region inline in `src/App.tsx` e registrare locazioni (Fase A).
- [x] Stabilizzare o creare `src/lib/a11y-announce.ts` come punto unico per gli annunci (Fase A).
- [x] Aggiornare `src/components/A11yLiveRegion.tsx` per usare `src/lib/a11y-announce.ts` (Fase A).
- [x] Rendere `src/components/ActionButton.tsx` auto-wired verso `src/lib/a11y-announce.ts` (Fase B).
- [x] Rimuovere il prop `announce` dai call site reali (es. `src/components/AdvancePhaseButton.tsx` e bottoni nei tab) (Fase B).
- [x] Audit per elementi che già espongono shortcut documentate e aggiungere `aria-keyshortcuts` a tali elementi (Fase C).  
	- Nota: `ActionButton` ora espone `aria-keyshortcuts` in modo condizionale; `DailyControls` espone `Control+Alt+Enter` per "Prossima fase".
- [x] Eseguire `npx tsc --noEmit` al termine di ogni fase e correggere errori di tipo.
- [x] Eseguire `npm run test` e risolvere test falliti prima di passare alla fase successiva.

Comandi rapidi di validazione
- `npx tsc --noEmit`
- `npm run test`
- `npm run build`

Note operative
- Non introdurre nuovi keyboard manager in questo ciclo. C è limitata all'aggiunta di `aria-keyshortcuts` su elementi già dotati di shortcut documentate.
- `StatsDashboard` e grandi refactor restano fuori scope.

Rinviato / Fuori scope
- `StatsDashboard` (strumenti di visualizzazione metriche).
- Refactor ampi sui pannelli (es. consolidamento Dashboard/Panel internals).

Annotazione operativa (2026-04-22): SchoolTab mantiene `announce` solo dove serve ai pannelli scolastici; `ActionButton` non espone più il prop `announce` e usa l'annunciatore centrale.
