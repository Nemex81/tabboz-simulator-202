# Walkthrough — Tabboz Simulator 2026

Questo documento riassume le modifiche e le migliorie apportate alla codebase per arricchire il gameplay (Tuning, Concessionaria & Gare, Controlli di Polizia) e modernizzare l'interfaccia utente (UI/UX) rendendola responsiva ed estremamente accessibile (A11y).

---

## 1. Concessionaria Ciclomotori & Garage Multimodello

Abbiamo implementato una nuova complessa progressione del motorino incentrata sull'officina, il commercio e l'acquisto multilivello.

### A. Scelta del Catorcio Iniziale (Nuovo Flusso Creazione Profilo)
* **[SchoolSelection.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/components/SchoolSelection.tsx)**: Inserito uno step intermedio `'motorino'` durante la creazione del personaggio. Il giocatore sceglie il suo mezzo ereditato di partenza tra:
  1. **Piaggio Ciao**: Costo miscela ridotto a 3€ (invece di 5€) per sgasare. Max tuning 20%.
  2. **Garelli Califfone**: Più grezzo. Applica un bonus di **+10 Coattaggine** iniziale. Max tuning 20%.
  3. **Vespa 50 Special (Catorcio)**: Mitica quattro marce. Applica un bonus di **+15 Figosità** iniziale. Max tuning 30%.
* **[useSchoolHandlers.ts](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/hooks/useSchoolHandlers.ts)**: Gestisce l'inizializzazione delle statistiche e assegna il motorino nello stato iniziale del gioco.

### B. Listino Prezzi & Calibrazione (Tuning vs Upgrade)
* I ciclomotori e le moto sono definiti in un file di configurazione puro in **[motorino-catalog.ts](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/lib/motorino-catalog.ts)**.
* **Categoria 50cc**: *Piaggio Sì* (180€), *Booster MBK* (380€), *Phantom F12* (480€), *Zip SP* (550€), *Aprilia RX 50* (650€), *Gilera Runner 50* (780€) e il cross clandestino *Honda CR 50* (950€).
* **Categoria 125cc (Età >= 16)**: *Vespa PX 125* (900€), *Gilera Runner 125* (1200€), *Aprilia RX 125* (1400€), *Aprilia RS 125* (1800€), *Cagiva Mito 125* (1900€) e *Honda CR 125* (2200€).
* **Categoria Moto Grandi (Età >= 18)**: *Yamaha Majesty 250* (1800€), *Honda Transalp 650* (2200€), *KTM 640 LC4 SM* (2800€), *Yamaha TMAX 500* (3200€) e *Yamaha R6* (3800€).

---

## 2. Ribilanciamento & Nuovo Sistema Polizia

Abbiamo rivisto completamente i controlli stradali per eliminare lo spam ripetitivo e aumentare lo spessore strategico delle scelte del giocatore.

### A. Calcolo Probabilità Dinamico (Anti-Spam)
* **Protezione sul Lavoro**: Quando il giocatore esegue l'azione Lavoro, la probabilità di controllo della polizia viene **ridotta del 70%** (fino a circa il 2.5% per turno), eliminando il fastidioso ripetersi dei fermi durante i turni lavorativi.
* **Profilo Sospetto**: Più la **Coattaggine** del giocatore è alta, più aumenta la chance che gli agenti lo fermino (fino a +6% a 100 Coattaggine). Se la Coattaggine è bassa (<40), la probabilità si riduce.
* **Tuning e Cross Illegali**: Possedere e viaggiare con una moto da cross non omologata (*Honda CR*) aggiunge un **+10%** flat di probabilità di fermo, mentre un motorino con elaborazioni attive aumenta la probabilità proporzionalmente al livello di tuning.
* **Mitigazione Reputazione**: La reputazione scala la probabilità finale (0.5x per una *Leggenda del Quartiere*, 1.5x per uno *Sfigato Totale*).

### B. Il Nuovo Dialogo a 4 Scelte
Il componente **[PoliceDialog.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/components/dialogs/PoliceDialog.tsx)** e il gestore **[useEventEngine.ts](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/hooks/useEventEngine.ts)** offrono ora le seguenti opzioni:
1. **Scappa in impennata / a piedi**:
   - Tenta la fuga. Il successo dipende dal Tuning, Coattaggine e dal mezzo guidato (+30% fisso se guidi il *KTM LC4 Supermotard*).
   - Se fallisci: multa pecuniaria e **sequestro definitivo** se il mezzo è una Honda CR illegale, oppure sequestro dei pezzi truccati se il mezzo è elaborato.
2. **Paga Mazzetta**:
   - Corrompi gli agenti per lasciarti andare subito.
   - Costa **50€** (a piedi o serie), **100€** (mezzo truccato) o **150€** (Honda CR clandestina).
   - Il bottone è abilitato solo se hai i fondi necessari.
3. **Usa Parlantina (Carisma)**:
   - Tenta di persuaderli. Successo legato a **Carisma** e **Reputazione**.
   - Se riesci: vai via indenne e guadagni **+5 Carisma**.
   - Se fallisci: multa base da 100€ e perdi **-15 Coattaggine** per la brutta figura.
4. **Collabora (Fai la spia / Dai i nomi)**:
   - Rivelando informazioni sul giro di scommesse o modifiche clandestine, gli sbirri chiudono un occhio.
   - Te la cavi con **0€ spesi** e nessun sequestro.
   - Tuttavia, l'intero quartiere saprà che sei un infame, infliggendoti una penalità pazzesca di **-30 Reputazione** e **-20 Coattaggine**!

---

## 3. Tuning & Sgasate Clandestine

* **Modello di Stato**: Integrazione persistente in local storage tramite `@github/spark` con validazione di `motorinoModello`, `motorinoTuning` e `motorinoPezzi` in [data-validation.ts](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/lib/data-validation.ts).
* **Web Audio FX**: Effetto sonoro `motorinoRev` in [sound-effects.ts](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/lib/sound-effects.ts) che riproduce la sgasata di un motore a 2 tempi.
* **Officina Clandestina**: Il dialog [MotorinoGarageDialog.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/components/dialogs/MotorinoGarageDialog.tsx) gestisce l'installazione di LeoVince, 19 Dell'Orto, Neon, Polini e 70cc Malossi, sgasate nel piazzale e acquisti in permuta con sconti basati sul valore residuo del vecchio mezzo.

---

## 4. Riorganizzazione UI/UX & A11y (Responsiva)

* **Navigazione Geografica (Popomundo style)**:
  - Riorganizzati i pannelli principali in:
    1. **🏠 Home (Sommario)**: Dashboard con riepilogo dati fisici, relazioni, motorino e diario.
    2. **📍 Luogo (Location)**: Tab dinamico che mostra le opzioni specifiche del luogo corrente (lavoro, palestra, scuola, riposo, ecc.) e vieta l'uso di opzioni fuori posizione.
    3. **🌆 Città (City)**: Mappa di viaggio con pulsante **🚶 Spostati** (Spostati qui). Cliccandolo si sposta fisicamente il personaggio, si riproduce l'effetto sonoro della sgasata (o click a piedi) e si reindirizza al tab Luogo.
    4. **👤 Personaggio (Character)**: Assorbe il vecchio tab delle azioni socializzazione, inserite nella nuova scheda secondaria **💬 Azioni**.
* **Layout Desktop a 3 Colonne**: Griglia con Profilo e Statistiche a sinistra, tab principale al centro e Diario/Log degli eventi a destra. Breakpoint flessibile ridotto da `lg` a `md` (768px) in [App.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/App.tsx) per adattarsi anche a schermi di portatili piccoli o finestre ridotte.
* **Tab Scrollabili**: Menu principale in [MainGameTabs.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/components/MainGameTabs.tsx), sotto-schede del personaggio in [CharacterSheet.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/components/CharacterSheet.tsx) e della scuola in [SchoolTab.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/components/tabs/SchoolTab.tsx) convertiti in flex orizzontali scrollabili con scrollbar nascoste per evitare disallineamenti e andate a capo su mobile.
* **Scorciatoia di Stato Rapido Shift + M / M**: Consente allo screen reader di ricevere immediatamente informazioni su soldi, posizione geografica e azioni rimanenti, eliminando la necessità di navigare l'intera pagina per controllarli.
* **Rimozione Pipe Separators**: Sostituiti in [TimeDisplay.tsx](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/components/TimeDisplay.tsx) con la classe responsiva Tailwind `divide-x`.
* **Coalescenza degli Annunci A11y**: Notifiche aggregate degli screen reader in [useGameNarrator.ts](file:///c:/Users/nemex/OneDrive/Documenti/GitHub/tabboz-simulator-202/src/hooks/useGameNarrator.ts) in un unico periodo verbale cumulativo per evitare code di sintesi vocale sovrapposte.

---

* **Scelta Mattutina Scolastica (Vai a scuola / Marina)**: Quando `morningChoicePending` è attivo, viene mostrato un pannello di scelta animato ed evidente sia in cima al tab **Sommario (Home)** che del tab **Luogo (Luogo)**. Scegliendo "Vai a Scuola" il personaggio viene spostato a scuola, mentre scegliendo "Marina la Scuola" viene spostato in Piazza nel Quartiere.

## 5. Nuovi Lavori Part-Time a 14 Anni

Abbiamo inserito e bilanciato tre lavori accessibili fin dal 1° anno di liceo (14 anni), differenziati per paga, orario e impatto sulle statistiche:
1. **Dogsitter** (Paga: 15€/turno): Disponibile mattina e pomeriggio (feriali, sabati e domeniche). Aumenta il morale (+5) e la stanchezza (+5).
2. **Volantinaggio** (Paga: 12€/turno): Disponibile solo il pomeriggio (feriali e sabati). Aumenta la stanchezza (+8), lo stress (+2) e cala leggermente il morale (-1).
3. **Consegna Giornali** (Paga: 18€/turno): Disponibile solo la mattina feriale e il sabato (richiede sveglia all'alba). Essendo faticoso, aumenta significativamente la stanchezza (+12) e lo stress (+3).

## 6. Risultati e Validazione

* **TypeScript Compilation**: `npx tsc --noEmit` completato con **0 errori**.
* **Vitest Suite**: `npm run test` completato con successo (56 test su 56 **verdi**).
* **Production Build**: `npm run build` completato correttamente (bundle generato in `dist/`).
