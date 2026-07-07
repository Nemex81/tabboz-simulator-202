# Gemini Directive & Global Guidelines — Tabboz Simulator 2026

Questo file contiene le direttive globali, i pattern architetturali e le linee guida per l'accessibilità (A11y) da seguire in ogni interazione con la codebase di **Tabboz Simulator 2026**. Funge da memoria di riferimento per preservare l'integrità del codice e garantire la qualità dell'esperienza utente, con particolare focus sugli screen reader.

---

## 1. Panoramica del Progetto e Stack Tecnologico

- **Natura**: RPG gestionale a turni (fasi della giornata), nostalgico e ironico, ambientato negli anni '90-2000 della cultura tamarra italiana.
- **Stack**: React 19 + TypeScript 5.7 + Vite 7 (SWC) + Tailwind CSS 4 + Radix UI primitives.
- **Persistenza**: Completamente client-side via `@github/spark` KV Storage (con bootstrap snapshot e fallback locale su errore 401).
- **Audio**: Effetti sonori sintetizzati a runtime tramite Web Audio API (zero asset esterni).

---

## 2. Pattern Architetturali Principali

### A. "Hooks as Services"
Tutta la logica di business e di stato deve risiedere nei custom hooks dedicati in `src/hooks/`. Il componente principale [App.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/App.tsx) coordina questi hook e distribuisce lo stato ai componenti di presentazione.
*Non introdurre librerie di stato esterne (Zustand, Redux, ecc.) o Context complessi per la logica di gioco principale.*

### B. Separazione del Dominio
La logica di calcolo pura, le formule di probabilità, i template e i dati statici devono vivere in `src/lib/` come funzioni pure TypeScript indipendenti da React. Questo facilita i test unitari e garantisce la manutenibilità del codice.

### C. Persistenza Robustezza
Il salvataggio è gestito da [useHydratedKV.ts](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/hooks/useHydratedKV.ts). Qualsiasi nuova chiave di stato che deve sopravvivere al refresh del browser deve essere configurata al suo interno e supportare il meccanismo di fallback locale in caso di errore di autenticazione Spark.

---

## 3. Linee Guida per l'Accessibilità (A11y) & Screen Reader

Il gioco deve essere **100% accessibile e utilizzabile senza mouse**. Segui rigorosamente queste regole:

### A. Gestione degli Annunci (ARIA Live Regions)
- **Helper centrale**: Utilizzare esclusivamente l'helper in [a11y-announce.ts](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/lib/a11y-announce.ts) o il context `useA11y()` in [A11yLiveRegion.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/components/A11yLiveRegion.tsx). Non scrivere live region personalizzate o inline nei componenti.
- **Annunci dual-channel**:
  - `polite` (default): Per notifiche di routine, cambi di statistiche, soldi bassi, o descrizioni di eventi.
  - `assertive`: Per cambi di fase/giorno, salute critica, note disciplinari, sospensioni o messaggi urgenti che interrompono l'azione corrente.
- **Evitare i doppi annunci**: Assicurarsi che le azioni da tastiera (es. premere un tasto rapido) non annuncino due volte la stessa azione (una volta per la scorciatoia e una per il click del pulsante).
- **Aggregazione / Coalescing**: Quando avvengono più variazioni contemporanee (es. cambio turno che modifica giorno, fase, stanchezza e soldi), prediligere un unico annuncio descrittivo e cumulativo per evitare che gli screen reader perdano messaggi sovrapposti in coda.

### B. Navigazione da Tastiera e Gestione del Focus
- **Scorciatoie globali**: Mantenere allineato [useKeyboardShortcuts.ts](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/hooks/useKeyboardShortcuts.ts) con le indicazioni in [KeyboardShortcutsDialog.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/components/KeyboardShortcutsDialog.tsx).
- **Focus programmatico**:
  - Al cambio di tab tramite tastiera o redirect di stato, trasferire il focus sul pannello attivo usando `requestAnimationFrame`.
  - Alla chiusura di qualsiasi dialog o menu modale, ripristinare sempre il focus sul pulsante/trigger di provenienza per evitare la perdita di focus dello screen reader.
- **Focus ring visibile**: Non rimuovere le classi `:focus-visible` globali definite in `src/index.css`. Preferire l'outline standard coerente con il tema corrente anziché `focus:outline-none`.

### C. Struttura Semantica HTML5
- **Landmark**: La struttura principale deve sempre essere racchiusa in `<main id="main-content" role="main">`.
- **Heading hierarchy**: Usare un unico `<h1>` per pagina (nell'header). Ogni scheda o tab principale deve includere un `<h2>` (anche `sr-only` se visivamente nascosto) per consentire una navigazione rapida per titoli agli utenti non vedenti.
- **Tabelle e liste**: I dati strutturati (voti, diario, compagni di classe) devono usare elementi semantici corretti (`<table>`, `<ul>`, `<ol>`, `<figcaption>`).

### D. Elementi Grafici e Indicatori
- **Grafici Recharts**: Wrap dei grafici (RadarChart, BarChart) in contenitori con `role="img"` e `aria-label` descrittivo dei dati correnti, accompagnati da un testo `sr-only` dettagliato.
- **Barre di progressione**: Utilizzare sempre `role="progressbar"`, con attributi `aria-valuenow`, `aria-valuemin`, `aria-valuemax` e `aria-label` descrittivo in italiano.
- **Simboli e Emoji**: Evitare l'uso di simboli visivi non etichettati (es. `♂`, `♀`, emoji o icone Phosphor). Utilizzare `aria-label` testuale o nascondere l'icona con `aria-hidden="true"` fornendo testo alternativo `sr-only`.
- **Dipendenza cromatica**: Non indicare la severità o lo stato esclusivamente tramite i colori (es. badge rosso/verde). Fornire sempre un'indicazione testuale esplicita (es. aggiungere "In calo", "Critico", "Scadenza imminente" nel testo letto da screen reader).

---

## 4. Margini di Ottimizzazione e Aree di Miglioramento

Durante lo sviluppo futuro, dare priorità alle seguenti aree per l'efficienza e l'accessibilità:

1. **Coalescenza degli annunci di fine turno**: Sostituire le chiamate di annuncio singole in `useGameNarrator` con un dispatcher centralizzato che aggrega gli aggiornamenti di stato in un unico periodo verbale (es. *"Giorno 16. Fase Pomeriggio. Stanchezza in aumento a 60, soldi rimanenti 80 lire."*).
2. **Accessibilità dei Generi nell'Header**: Evitare che simboli come `♂` o `♀` vengano letti letteralmente. Utilizzare formati come:
   `<span aria-label="Genere: Maschio"><span aria-hidden="true">♂</span> Maschio</span>`.
3. **Consolidamento del Focus Ring**: Rimuovere gli stili di ring localizzati ad-hoc (`focus:ring-4 focus:ring-primary/50`) a favore dell'outline centralizzato e ad alto contrasto implementato in `:focus-visible` in `src/index.css`.
4. **Smoke test di accessibilità automatici**: Valutare l'aggiunta di `vitest-axe` per convalidare automaticamente l'accessibilità dei principali componenti della dashboard a livello di test automatici.

---

## 5. Istruzioni per lo Sviluppatore AI (Antigravity)

Quando lavori su questa codebase:
1. **Preserva la retrocompatibilità**: Non rompere la logica di salvataggio/caricamento KV o le meccaniche di gioco a turni.
2. **Rispetta i test**: Ogni modifica deve essere seguita dall'esecuzione di `npm run test` e `npx tsc --noEmit`. I test devono rimanere tutti verdi.
3. **Mantieni pulita la documentazione**: Aggiorna [docs/TODO.md](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/docs/TODO.md) e compila il walkthrough finale al termine di modifiche sostanziali.
4. **Riferimenti ai file**: Crea sempre link cliccabili per tutti i file e i simboli modificati usando il formato markdown di GitHub con schema `file://` e percorsi assoluti con forward slash (es. `[App.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/App.tsx)`).
