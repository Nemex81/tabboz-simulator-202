# TODO — Sistema Eventi Mattutini Contestuali (Street Morning Events)
<!-- linked-plan: docs/PLAN_StreetMorningEvents_V1.md -->
<!-- branch: main -->
<!-- created: 2026-04-07 -->

## Legenda stati
- `[ ]` Non iniziato
- `[~]` In corso
- `[x]` Completato

---

## Fase 1 — Base tipologica e dati

- [ ] **A** — `src/lib/types.ts`: aggiunge tipo condiviso `MorningEventCategory = 'didattica' | 'sociale' | 'istituto' | 'strada' | 'casa' | 'citta' | 'amici'`
- [ ] **A** — `src/lib/types.ts`: aggiunge `isAtSchool: boolean` a `SchoolRecord`
- [ ] **A** — `src/lib/types.ts`: aggiunge `isAtSchool: false` a `DEFAULT_SCHOOL_RECORD`
- [ ] **B** — `src/lib/school-morning-events.ts`: rimuove tipo locale categoria, importa `MorningEventCategory` da `@/lib/types` e aggiorna `SchoolMorningEvent.category`
- [ ] **B** — `src/lib/street-morning-events.ts`: crea file e importa `MorningEventCategory` da `@/lib/types` (nessun tipo locale categoria)
- [ ] **B** — `src/lib/street-morning-events.ts`: aggiunge funzione `drawStreetMorningEvents(maxEvents?: number)`

## Fase 2 — Plumbing React

- [ ] **C** — `src/hooks/useAppDialogs.ts`: aggiunge `streetMorningEvents`, `setStreetMorningEvents`, `showStreetMorning`, `setShowStreetMorning`
- [ ] **D** — `src/App.tsx`: destructuring aggiornato con i 4 nuovi valori da `useAppDialogs()`
- [ ] **E** — `src/App.tsx`: aggiunge import `drawStreetMorningEvents` da `@/lib/street-morning-events`

## Fase 3 — Logica flussi (App.tsx)

- [ ] **F** — `src/App.tsx` `handleVaiAScuola`: aggiunge `isAtSchool: true` allo spread `setSchoolRecord`
- [ ] **G** — `src/App.tsx` `handleMarina`: aggiunge `setSchoolRecord isAtSchool=false`, `drawStreetMorningEvents(6)`, `setStreetMorningEvents`, `setShowStreetMorning(true)`
- [ ] **H-bis** — `src/hooks/useGameTime.ts`: nel reset cambio giorno consolida `wentToSchoolToday=false` + `isAtSchool=false` nello stesso `setSchoolRecord`
- [ ] **H** — `src/App.tsx` useEffect cambio giorno: reset solo locale `showStreetMorning=false`, `streetMorningEvents=[]` (senza write KV su `isAtSchool`)
- [ ] **I** — `src/App.tsx` useEffect cambio fase: aggiunge `setShowStreetMorning(false)` quando `currentPhase !== 'mattina'`

## Fase 4 — UI Component

- [ ] **L** — `src/components/SchoolMorningPanel.tsx`: aggiunge prop `context: 'school' | 'street'`
- [ ] **L** — `src/components/SchoolMorningPanel.tsx`: aggiorna `categoryLabel` e `categoryColor` come `Record<MorningEventCategory, string>`
- [ ] **L** — `src/components/SchoolMorningPanel.tsx`: banner contestuale condizionale (amber per scuola, slate per strada)

## Fase 5 — Render e wiring finale

- [ ] **M** — `src/App.tsx`: passa `context="school"` al `<SchoolMorningPanel>` esistente
- [ ] **M** — `src/App.tsx`: aggiunge render del pannello strada con guard `marinatoOggi` e `context="street"`

## Fase 6 — Validazione

- [ ] `npx tsc --noEmit` — zero errori TypeScript
- [ ] Verifica manuale: scuola apre panel scolastico, marina apre panel strada, cambio giorno azzera entrambi
- [ ] Verifica: pannelli non appaiono contemporaneamente
- [ ] Verifica accessibilità: banner leggibile da NVDA
- [ ] Verifica: tutti i `category` in `STREET_MORNING_EVENTS` coperti da label/color

## Fase 7 (opzionale, dopo merge) — EventEngine

- [ ] **N** — `src/hooks/useEventEngine.ts`: aggiunge `isAtSchool?: boolean` a `UseEventEngineParams` per filtrare eventi pomeridiani contestuali
- [ ] **N** — `src/App.tsx`: passa `isAtSchool: schoolRecord.isAtSchool` a `useEventEngine`
