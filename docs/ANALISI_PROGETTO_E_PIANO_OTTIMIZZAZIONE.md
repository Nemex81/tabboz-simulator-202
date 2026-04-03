# Analisi del Repository e Piano di Ottimizzazione

## Panoramica Generale

Tabboz Simulator: 2026 Edition e' un RPG gestionale web ispirato alla cultura italiana "coatta" degli anni '90-2000. Il giocatore interpreta uno studente di scuola superiore che deve sopravvivere a 5 anni scolastici, ottenere il diploma con media almeno pari a 6 e costruire la propria reputazione tramite studio, relazioni sociali, eventi casuali e attivita' piu' borderline.

Il progetto combina meccaniche da life simulator, progressione RPG, gestione scolastica e sistemi sociali con un taglio volutamente ironico e molto accessibile lato interfaccia.

## Componenti Principali del Progetto

### Gameplay Core

- Sistema statistiche con Coattaggine, Muscoli, Figosita', Intelligenza, Carisma, Soldi, Stanchezza, Media e Reputazione derivata.
- Sistema scolastico con 3 indirizzi, 12 materie per indirizzo, voti decimali, promozione o bocciatura annuale.
- Sistema verifiche e interrogazioni con preparazione, difficolta' e impatto sui voti.
- Sistema amicizie con tipi di amici differenti e bonus contestuali.
- Sistema relazioni sentimentali con progressione dell'interesse, gelosia e dichiarazione finale.
- Sistema eventi casuali come polizia, metallari, bulli e gare di motorini.
- Sistema tempo con calendario scolastico, azioni giornaliere e avanzamento annuale.
- Persistenza completa dello stato della partita tramite storage locale.

### Architettura UI

- [src/App.tsx](src/App.tsx) e' il centro della logica applicativa e orchestra stato, azioni, eventi e dialog.
- [src/main.tsx](src/main.tsx) inizializza l'app React.
- I componenti in [src/components](src/components) coprono pannelli di gioco, dialog e visualizzazione statistiche.
- I componenti in [src/components/ui](src/components/ui) derivano in larga parte da shadcn/ui e Radix UI.

### Librerie di dominio

La cartella [src/lib](src/lib) contiene la logica principale del gioco:

- [src/lib/types.ts](src/lib/types.ts): tipi e interfacce del dominio.
- [src/lib/game-utils.ts](src/lib/game-utils.ts): utility di gioco e calcoli condivisi.
- [src/lib/exam-system.ts](src/lib/exam-system.ts): verifiche, esami e preparazione.
- [src/lib/enhanced-friend-system.ts](src/lib/enhanced-friend-system.ts): amici avanzati e interazioni.
- [src/lib/girlfriend-system.ts](src/lib/girlfriend-system.ts): generazione e gestione relazioni.
- [src/lib/social-system.ts](src/lib/social-system.ts): parte della logica sociale legacy.
- [src/lib/school-events.ts](src/lib/school-events.ts): eventi scolastici e scelte.
- [src/lib/bet-system.ts](src/lib/bet-system.ts): sistema scommesse nelle gare.
- [src/lib/time-utils.ts](src/lib/time-utils.ts): gestione calendario e avanzamento del tempo.
- [src/lib/sound-effects.ts](src/lib/sound-effects.ts): effetti sonori via Web Audio API.
- [src/lib/data-validation.ts](src/lib/data-validation.ts): validazione e sanitizzazione dati.

## Linguaggio e Strumenti di Sviluppo

### Linguaggio principale

- TypeScript

### Framework e runtime

- React 19
- Vite 7
- GitHub Spark come ambiente/piattaforma di esecuzione

### UI e styling

- Tailwind CSS 4
- shadcn/ui
- Radix UI
- Framer Motion
- Phosphor Icons
- Heroicons

### Stato, dati e validazione

- Hook useKV per persistenza locale
- Zod per validazione runtime
- react-hook-form
- TanStack React Query presente nelle dipendenze

### Tooling di sviluppo

- ESLint 9
- TypeScript strict mode
- SWC tramite plugin React per Vite

## Gestione dello Stato

La gestione dello stato e' principalmente locale al componente principale tramite hook React e persistenza con useKV. Non emerge uno store globale dedicato come Redux o Zustand. L'approccio attuale e' semplice ma tende a concentrare troppa logica in [src/App.tsx](src/App.tsx), con rischio di accoppiamento elevato tra UI e regole di gioco.

Punti chiave:

- Stato persistente distribuito su piu' chiavi storage.
- Validazione all'avvio per ridurre il rischio di dati corrotti.
- Calcoli di reputazione, eventi e azioni gestiti in gran parte dal componente principale.

## Criticita' Tecniche Individuate

### 1. App.tsx troppo grande e troppo centrale

La logica di gioco, la gestione degli eventi, il wiring della UI e parte della persistenza sembrano fortemente concentrate in [src/App.tsx](src/App.tsx). Questo riduce manutenibilita', testabilita' e facilita' di estensione.

### 2. Coesistenza di modelli legacy e modelli nuovi

Nel dominio sociale convivono strutture legacy e strutture piu' evolute, in particolare tra friend system e relationship system. Questo aumenta il rischio di incoerenze logiche e duplicazioni.

### 3. Bilanciamento gameplay non ancora uniforme

Alcune azioni risultano sbilanciate:

- Corruzione con costo elevato e beneficio moderato.
- Minaccia con rischio estremo rispetto al reward.
- Economia generale non sempre proporzionata all'avanzamento del giocatore.

### 4. Randomizzazione non deterministica

L'uso diretto di Math.random rende difficile riprodurre partite, debuggare eventi e costruire test affidabili sulle meccaniche.

### 5. Ottimizzazioni React non evidenti

Molti componenti di visualizzazione possono re-renderizzare piu' del necessario, specialmente nei pannelli statistiche e nei dialog.

## Piano di Ottimizzazione per Migliorare il Sistema di Gioco

## Fase 1 - Stabilizzazione architetturale

### Obiettivo

Separare la logica di dominio dalla UI e rendere il progetto piu' semplice da evolvere.

### Interventi

1. Estrarre custom hook dedicati:
   - useGameStats
   - useSchoolProgression
   - useRandomEvents
   - useSocialSystems
2. Ridurre le responsabilita' di [src/App.tsx](src/App.tsx), lasciandogli un ruolo di orchestrazione.
3. Consolidare i modelli legacy in favore di un singolo modello amici e di un singolo modello relazioni.
4. Introdurre union types discriminati per eventi e azioni complesse.

### Benefici attesi

- Meno regressioni.
- Maggiore leggibilita'.
- Migliore copertura test futura.

## Fase 2 - Ribilanciamento del gameplay

### Obiettivo

Rendere la progressione piu' coerente, leggibile e appagante.

### Interventi

1. Ritarare il rapporto costo/beneficio di studio, corruzione, minaccia e attivita' sociali.
2. Introdurre una curva di difficolta' progressiva sui 5 anni scolastici.
3. Migliorare l'economia di gioco con guadagni e costi piu' scalabili.
4. Rendere piu' visibili in UI probabilita', requisiti e conseguenze delle azioni.
5. Ricalibrare eventi casuali in funzione dello stato del giocatore e dell'anno scolastico.

### Benefici attesi

- Migliore sensazione di progresso.
- Riduzione di situazioni punitive troppo casuali.
- Maggiore rigiocabilita'.

## Fase 3 - Robustezza e testabilita'

### Obiettivo

Rendere il comportamento del gioco piu' affidabile e verificabile.

### Interventi

1. Introdurre un generatore random con seed opzionale.
2. Rafforzare la validazione dati nei loader di storage.
3. Aggiungere test unitari alle formule principali:
   - reputazione
   - esami
   - eventi casuali
   - relazioni e amicizie
4. Aggiungere test di regressione per promozione, bocciatura e vittoria finale.

### Benefici attesi

- Debug piu' semplice.
- Partite riproducibili.
- Minore rischio di rotture invisibili.

## Fase 4 - Performance e UX

### Obiettivo

Ridurre il carico di rendering e migliorare la chiarezza delle interazioni.

### Interventi

1. Memoizzare i componenti puramente presentazionali come statistiche e pannelli stabili.
2. Caricare i dialog meno frequenti in lazy loading.
3. Aggiungere feedback piu' chiari per azioni bloccate o con requisiti non soddisfatti.
4. Introdurre una dashboard riassuntiva dell'andamento partita con grafici, sfruttando librerie gia' presenti.

### Benefici attesi

- UI piu' fluida.
- Migliore comprensione del sistema da parte del giocatore.
- Migliore sfruttamento delle dipendenze gia' installate.

## Priorita' Operativa Consigliata

Ordine suggerito:

1. Rifattorizzare [src/App.tsx](src/App.tsx)
2. Consolidare i modelli dominio legacy
3. Ribilanciare economia e azioni scolastiche
4. Introdurre seed random e test delle formule
5. Ottimizzare rendering e dialog
6. Aggiungere dashboard e miglioramenti UX avanzati

## Conclusione

Il progetto ha una base ludica interessante, una direzione estetica chiara e una buona quantita' di sistemi gia' implementati. Il principale limite attuale non sembra essere la mancanza di funzionalita', ma la concentrazione della logica nel layer UI e alcuni squilibri nel game design. Intervenendo prima sulla struttura del codice e poi sul bilanciamento, il simulatore puo' diventare molto piu' solido, estendibile e divertente.