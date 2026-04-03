# Tabboz Simulator: 2026 Edition - RPG Gestionale

Un simulatore di vita da "coatto" anni '90-2000 evoluto in un **RPG gestionale complesso**, completamente accessibile e ironico, che celebra la cultura tamarra italiana con meccaniche scolastiche avanzate, sistema sociale profondo, intelligenza strategica e relazioni sentimentali.

**Experience Qualities:**
1. **Nostalgico & Strategico** - Riporta il giocatore agli anni d'oro del gaming italiano trash, ma con meccaniche RPG profonde che richiedono pianificazione e gestione delle risorse
2. **Realistico & Progressivo** - Sistema di voti decimali, verifiche programmate, amicizie che aiutano, relazioni romantiche complesse, e intelligenza che influenza lo studio
3. **Accessibile & Complesso** - Screen reader ready con ARIA live regions, shortcuts da tastiera, UI organizzata in 5 schede tematiche per gestire la complessità

**Complexity Level:** Complex Application (advanced functionality with multiple interconnected systems)
Il gioco ora ha sistemi RPG profondi: statistiche mentali (Intelligenza, Carisma), voti decimali con moltiplicatori, verifiche programmate, rubrica amici con benefici, relazioni sentimentali a più livelli, interrogazioni a sorpresa basate su formule, e social events che influenzano la rete di conoscenze.

## Essential Features

### Sistema Scolastico con Corruzione e Progressione Annuale
- **Functionality**: Gestione di 4 materie (Matematica, Italiano, Storia, Ed. Fisica) con media da 0-10. Se scende sotto 4 = bocciatura (game over). Il giocatore inizia in Prima Superiore (età 14) e deve superare 5 anni scolastici per vincere. Ogni anno scolastico va dal 15 settembre al 10 giugno, con pagella finale. Se promosso (media ≥ 6), avanza all'anno successivo con voti resettati a 6. Se supera la pagella di Quinta Superiore, vince il gioco.
- **Purpose**: Core mechanic del gioco - bilanciare studio legittimo vs metodi "alternativi" mentre si progredisce verso la vittoria finale (diploma di maturità)
- **Trigger**: Accesso alla sezione "Scuola" dal menu principale, visualizzazione pagella automatica il 10 giugno di ogni anno
- **Progression**: Visualizza voti per materia → Scelta azione (Studia/Corrompi/Minaccia) → Calcolo probabilistico esito → Aggiornamento statistiche → ARIA live announcement → Al 10 giugno: mostra pagella → Se media ≥ 6: promosso (voti reset a 6, anno +1, età +1) → Se anno 5 e promosso: VITTORIA → Se media < 6: BOCCIATO (game over)
- **Success criteria**: Media calcolata correttamente, eventi di espulsione al 30% per "Minaccia", costi applicati per corruzione, progressione tra anni funzionante, reset voti dopo promozione, gestione vittoria in Quinta Superiore, UI mostra progresso verso maturità con barra grafica

### Sistema Statistiche e Progressione Avanzato (RPG)
- **Functionality**: 8 statistiche principali divise in **Fisiche** (Coattaggine, Muscoli, Figosità), **Mentali** (Intelligenza, Carisma), **Risorse** (Soldi, Stanchezza, Media Scolastica), più una derivata (Reputazione). Intelligenza e Carisma sono le nuove stat che trasformano il gioco in RPG gestionale.
- **Purpose**: Creare scelte strategiche profonde - investire in Intelligenza per dominare la scuola con meno sforzo, o in Carisma per eccellere socialmente e evitare guai? La Reputazione ora considera anche il Carisma (20% del totale)
- **Trigger**: Sempre visibili in dashboard espansa (8 stat invece di 6), aggiornate dopo ogni azione
- **Progression**: Azione selezionata → Verifica prerequisiti → Applicazione modifiche → Calcolo automatico Reputazione (include Carisma) → Annuncio vocale cambiamenti dettagliati
- **Success criteria**: Intelligenza influenza correttamente lo studio con moltiplicatori visibili, Carisma modifica eventi sociali, UI mostra chiaramente i benefici di ogni stat mentale con tooltip informativi

### Sistema Intelligenza e Studio Decimale con Selezione Materia
- **Functionality**: L'Intelligenza (0-100, partenza a 10) agisce come **moltiplicatore dello studio**. Formula: `incremento_voto = 0.2 * (Intelligenza / 50)`. **Pannello selezione materia modale** appare quando si preme Studia (Ctrl+5): mostra tutte materie dell'indirizzo con voto attuale, indicatore visivo (🔴 <6, 🟡 6-7, 🟢 >7), selezione singola, pulsante Conferma. **Warning se Stanchezza >80**: "Sei troppo stanco, bonus dimezzato". Studiare aumenta anche l'Intelligenza di 1-3 punti. I voti sono ora **decimali** (es. 6.4, 7.2) visualizzati con `.toFixed(1)`. Amici con Intelligenza > 60 danno bonus 50% allo studio ("studiamo insieme"). **Accessibility completa**: Escape chiude senza consumare azione, Enter conferma, focus trap, aria-modal, aria-label su ogni materia.
- **Purpose**: Rendere la progressione scolastica più fluida e realistica, premiare l'investimento in Intelligenza con benefici esponenziali, dare scelta strategica sulla materia da migliorare
- **Trigger**: Ctrl+5 apre SubjectSelectionDialog, selezione materia + conferma esegue studio
- **Progression**: Ctrl+5 → Dialog aperto → Tab naviga materie → Selezione materia → Enter conferma → Calcola boost Intelligenza → Applica formula decimale (dimezzata se stanch>80) → Aggiorna voto materia selezionata → Aumenta Intelligenza di 1-3 → Consuma azione e aumenta stanchezza → Annuncia incremento preciso con ARIA live
- **Success criteria**: Dialog SubjectSelectionDialog mostra tutte materie con voti decimali, indicatori colorati corretti, warning stanchezza visibile, Escape funziona, Enter conferma, voti aggiornati con decimale, Intelligenza visibilmente influenza quanto si impara (UI mostra "+X.X per studio"), amici intelligenti danno bonus chiaro visibile in badge, progressione smooth senza "salti" da voto intero

### Sistema Verifiche e Interrogazioni Programmate
- **Functionality**: Sistema di **esami programmati** che appaiono casualmente (30% chance al cambio giorno, max 3 contemporanei). Ogni verifica ha subject, giorni rimanenti, e stato preparazione. Il giocatore può "Preparare" usando un'azione (consuma stanchezza, aumenta Intelligenza). Al giorno della verifica: se preparato, voto = `voto_attuale + (2 * (1 + Intelligenza/100))`. **Interrogazioni a sorpresa** hanno 10% chance durante "Studia": esito basato su `(Media + Intelligenza) / 2`.
- **Purpose**: Aggiungere tensione strategica e pianificazione a lungo termine, premiare preparazione anticipata e investimento in Intelligenza
- **Trigger**: Verifiche generate casualmente ogni giorno scolare, interrogazioni sorpresa durante azione Studia
- **Progression**: Nuovo giorno → 30% chance verifica programmata → Appare nel tab "Verifiche" → Giocatore può prepararsi (1 azione, +Intelligenza) → Al giorno X: calcola voto con moltiplicatore Intelligenza se preparato → Annuncio risultato → Rimuove verifica dalla lista
- **Success criteria**: UI mostra countdown giorni rimanenti, stato preparazione visibile (badge), verifiche preparate danno voti significativamente più alti, interrogazioni sorpresa premiano alta Intelligenza, annunci ARIA live per nuove verifiche e risultati

### Sistema Carisma e Parlantina
- **Functionality**: Il Carisma (0-100, partenza a 10) influenza **tutte le interazioni sociali**: Disco (+25% successo), Rimorchio (bonus variabile), chance nuovi amici (+Carisma/10 alla probabilità base 15%). **Parlantina speciale**: Con Carisma > 70, hai 20% di evitare completamente eventi negativi (Metallari, Polizia, Bulli) con flavor text tipo "Li hai convinti con la PARLANTINA! +5 Carisma" invece di combattere/scappare/pagare.
- **Purpose**: Creare un percorso alternativo "social" al muscoli/coattaggine, permettere build "diplomat" che risolve tutto col dialogo
- **Trigger**: Check Carisma all'inizio di ogni interazione sociale ed evento negativo
- **Progression**: Evento negativo → Se Carisma > 70: 20% roll → Se successo: auto-risolvi con Parlantina (nessuna perdita, +5 Carisma, flavor text) → Altrimenti: evento normale con bonus Carisma applicato
- **Success criteria**: Carisma > 70 mostra chiaramente badge "Parlantina Attiva" in UI, eventi risolti con dialogo hanno messaggi distintivi, successo sociale visibilmente più alto con Carisma alto, UI mostra modificatori Carisma nelle probabilità

### Sistema Amicizie Avanzato con Interazioni
- **Functionality**: **Rubrica Amici** persistente con nome (20 nomi italiani anni '90), tipo (coatto/secchione/sportivo/ribelle), affinità (0-100), e Intelligenza propria. Probabilità di conoscere amico: `15% base + (Carisma / 10)` durante Palestra/Disco/Cinema/Shopping. Max 4 amici contemporaneamente. **6 tipi di interazioni disponibili:** Esci insieme (+10 Coat, +5 Aff, -10€, req: Aff>30), Palestra insieme (+8 Musc, +5 Aff, -20€, solo sportivi), Studia insieme (+0.3 Media, +5 Aff, -8 Stanch, solo secchioni), Fai casino (+15 Coat, +5 Aff, -20€, req: Aff>50), Litiga (-20 Aff, +5 Coat), Chiedi soldi (+20-50€, -15 Aff, req: Aff>60). Amici con INT > 60 danno **bonus 50% allo studio**. **Affinità 0 = amico perso**. **Affinità 100 = Migliore Amico** con badge Crown e abilità speciale "Copertura Genitori".
- **Purpose**: Costruire rete sociale profonda con scelte strategiche, gestire relazioni con conseguenze reali, incentivare investimento in Carisma
- **Trigger**: Check probabilità post ogni attività sociale per nuovi amici, azioni manuali dal pannello amici
- **Progression**: Azione sociale → Roll 15%+Carisma/10 → Se successo e slot libero: genera amico random → Tab Amici mostra card dettagliata → Giocatore sceglie interazione → Applica effetti → Aggiorna affinità → Se 0: rimuovi amico con evento narrativo → Se 100: badge Migliore Amico
- **Success criteria**: Panel EnhancedFriendsPanel mostra tutti dettagli, ogni tipo amico ha icona distintiva, affinità visibile con progress bar, azioni disponibili filtrate per tipo e requisiti, amici secchioni con badge "BONUS STUDIO +50%", evento narrativo quando amicizia finisce, badge Crown per migliori amici

### Sistema Relazioni Sentimentali Dettagliato
- **Functionality**: Lista **ragazze disponibili** con scheda completa: nome+cognome (18 nomi femminili italiani '90 + 12 cognomi), età (14-19), classe (es. "2B"), scuola (6 opzioni), aspetto (carina/bellissima/normale/alternativa), personalità (timida/estroversa/secchiona/ribelle/vanitosa), capelli (8 colori), 2-3 hobby da lista 10, stat preferita (figosità/muscoli/intelligenza/carisma), interessePerTe (0-100), figositaRichiesta, statusSociale, flag gelosa. Generate casualmente (20% ogni attività sociale, max 1 alla volta). **Scheda visiva dettagliata** mostra: tutti dati anagrafici, descrizione ironico-tamarra aspetto e personalità, progress bar Interesse (rosso<30, giallo 30-60, verde>60), lista "Cosa le piace" basata su personalità, hobby con icone, indicatore soglia con stat mancanti. **5 interazioni disponibili:** Messaggio (+5 Interesse, gratis, sempre), Cinema (+15 Int, -40€, +5 Fig, req: Int>30), Motorino (+20 Int, -20€, req: Int>40 + Coat>50), Falle compiti (+10 Int, +0.3 Media, -10 Coat, req: tipo secchiona + INT>40), Dichiarati (diventa fidanzata, req: Int>70). Se gelosa, eventi negativi random. Cooldown 30 giorni tra relazioni.
- **Purpose**: Aggiungere obiettivi emotivi a lungo termine, incentivare build bilanciate, ricompensare investimento sociale, creare tensione narrativa
- **Trigger**: Generazione casuale ragazze durante attività sociali, azioni manuali dal pannello girlfriend (Ctrl+T)
- **Progression**: Attività sociale → 20% genera ragazza → Appare in tab con scheda completa → Giocatore sceglie quando interagire → Ogni azione modifica Interesse → Progress bar visibile → Al 70% Interesse: pulsante Dichiarati sbloccato → Se dichiarazione: diventa fidanzata ufficiale → Nuovi eventi narrativi (gelosia, genitori contrari)
- **Success criteria**: Panel GirlfriendPanel mostra scheda completa e dettagliata, personalità influenza preferenze chiaramente, progress bar interesse con colori dinamici, azioni disponibili filtrate per requisiti, tooltip mostrano stat mancanti, descrizioni ironico-tamarrecon tono anni '90, eventi gelosia se flag attivo, bottone "Lascia" per terminare relazione

### Sistema di Reputazione Dinamico
- **Functionality**: La Reputazione (0-100) è calcolata automaticamente da: Coattaggine (30%), Muscoli (20%), Figosità (25%), Soldi (15%), Media Scolastica (10%). Ha 5 livelli: "Sfigato Totale" (<20), "Nessuno" (20-39), "Coatto Base" (40-59), "Rispettato" (60-79), "Leggenda del Quartiere" (80+)
- **Purpose**: Creare un senso di progressione e prestigio che riflette il successo complessivo del giocatore, con conseguenze tangibili sugli eventi
- **Trigger**: Si aggiorna automaticamente ogni volta che cambia una delle stat che contribuiscono
- **Progression**: Stat modificata → Calcolo formula pesata → Se cambio significativo (>2 punti): aggiorna Reputazione → Se cambio livello: annuncio ARIA live drammatico
- **Success criteria**: Formula bilanciata che premia equilibrio tra stat, livelli progressivi chiari, UI mostra livello testuale + barra grafica + valore numerico

### Influenza Reputazione su Eventi Casuali
- **Functionality**: La Reputazione modifica tre aspetti degli eventi:
  1. **Frequenza** - Reputazione alta riduce chance eventi negativi (moltiplicatore da 1.5x a 0.5x)
  2. **Probabilità Successo** - Bonus/malus da -20% a +30% su tutti i check probabilistici
  3. **Rispetto** - Con Reputazione "Rispettato" o superiore, alcuni eventi si risolvono automaticamente a tuo favore (Metallari ti salutano, Polizia ti lascia andare, Bulli scappano)
- **Purpose**: Premiare investimento a lungo termine e creare senso di evoluzione narrativa - da sfigato a leggenda
- **Trigger**: Check reputazione all'inizio di ogni evento casuale
- **Progression**: Evento triggerato → Calcola modificatori reputazione → Se rispetto alto: auto-risolvi positivo con flavor text → Altrimenti: applica bonus/malus → Presenta scelte → Calcola esito modificato
- **Success criteria**: Eventi mostrano chiaramente bonus reputazione nelle descrizioni, alta reputazione fa sentire giocatore potente, bassa reputazione aumenta difficoltà visibilmente

### Azioni Vita Sociale
- **Functionality**: Palestra (+Muscoli, -Soldi), Lampada (+Coattaggine, -Soldi), Lavora come Buttadifuori (+Soldi se Muscoli alti), Trucca Motorino (+Coattaggine, -Soldi)
- **Purpose**: Modi alternativi per crescere le stat necessarie a sopravvivere
- **Trigger**: Menu "Azioni" con shortcuts da tastiera (P/L/B/M)
- **Progression**: Selezione azione → Check condizioni → Esito con flavor text → Update stat
- **Success criteria**: Ogni azione ha effetti distinti, alcuni richiedono stat minime

### Sistema Eventi Casuali Multipli con Modificatori Reputazione e Scommesse Dinamiche
- **Functionality**: Quattro tipi di eventi random che possono accadere dopo azioni comuni, con probabilità e esiti modificati dalla Reputazione:
  1. **Metallari** - Gang ostile che vuole la tua grana (12% base chance, ridotta da alta reputazione): Scappa (-10 Coattaggine) o Combatti (richiede Muscoli > 60, +15 Coattaggine +30 Soldi se vinci, altrimenti -50 Soldi -5 Muscoli). Con Reputazione "Leggenda" si auto-risolve positivamente.
  2. **Polizia** - Controllo documenti (10% base chance): Scappa (richiede Coattaggine > 70, +10 Coattaggine se riesci, altrimenti -100 Soldi -15 Coattaggine) o Dai Mazzetta (50€ per cavartela, altrimenti sequestro tutto e -20 Coattaggine). Con Reputazione "Leggenda" ti lasciano andare.
  3. **Gara Motorini** - Sfida street racing (8% base chance) con **sistema scommesse dinamico**: importo calcolato con formula `baseBet(10) + (floor(rep/20)*5) + (difficoltà*5)`, cap max 60€. Difficoltà (1-4) basata su reputazione. **Dialog mostra PRIMA**: "Scommessa: X€ — Vincita potenziale: X*2€", nome avversario casuale, descrizione difficoltà. **aria-live="polite" annuncia importo**. Accetta (probabilità basata su Coattaggine 50% + Figosità 30% + Muscoli 20% + Bonus Reputazione, se vinci +25 Coattaggine +20 Figosità +vincita, se perdi -20 Figosità -15 Coattaggine -scommessa) o Rifiuta (-15 Coattaggine -10 Figosità).
  4. **Bulli** - Gang scolastica vuole la merenda (6% base chance): Resisti (richiede Muscoli > 50, +20 Coattaggine +5 Muscoli se vinci, altrimenti -30 Soldi -10 Coattaggine -5 Muscoli) o Cedi (-20 Soldi -15 Coattaggine). Con Reputazione "Rispettato" o superiore scappano automaticamente.
- **Purpose**: Aggiungere varietà, suspense e ricompense rischiose che premiano investimento strategico nelle diverse statistiche E nella reputazione complessiva. Sistema scommesse dinamico rende street racing scalabile e bilanciato.
- **Trigger**: Random roll (36% base totale di evento, modificato da reputazione) dopo ogni azione sociale (Palestra, Lampada, Lavoro, Motorino, Disco, Cinema, Shopping). Gara motorini genera BetInfo con importo/vincita calcolati.
- **Progression**: Azione completata → Roll probabilistico modificato da reputazione → Se auto-risolto da alta reputazione: mostra flavor text positivo e annuncio → Altrimenti se evento Gara: genera BetInfo, calcola importo da formula, mostra dialog con importo/vincita/avversario/difficoltà, aria-live annuncia importo → Scelta A o B → Calcolo esito con modificatori reputazione → Applicazione conseguenze (usa importo da BetInfo) → ARIA announcement risultato
- **Success criteria**: Eventi distribuiti correttamente con modificatori, probabilità di successo calcolate accuratamente con bonus reputazione, UI mostra chiaramente bonus/malus da reputazione, auto-risoluzioni positive con alta reputazione funzionano e hanno flavor text distintivo. **Per Gara**: formula calcolo importo corretta (esempi: Rep0/diff1=15€, Rep20/diff1=20€, Rep50/diff2=30€, Rep80/diff3=45€, Rep100/diff4=55€ max), importo mostrato PRIMA accettazione, testo "Scommessa: X€ — Vincita: X*2€", aria-live annuncia importo, difficoltà visualizzata con nome avversario, 4 livelli difficoltà (Facile/Media/Difficile/Boss), colori difficoltà dinamici

### Sistema di Salvataggio Persistente
- **Functionality**: Auto-save di tutte le stat e stato gioco ogni cambiamento
- **Purpose**: Permette sessioni multiple senza perdere progressione
- **Trigger**: Automatico via useKV hook
- **Progression**: Ogni modifica stat → useKV setter → Persistenza immediata
- **Success criteria**: Refresh mantiene stato, reset button funziona

### Sistema Audio con Effetti Sonori
- **Functionality**: Feedback audio sintetizzato per tutte le azioni ed eventi del gioco usando Web Audio API. Include suoni per: stat increase/decrease, big win/loss, money spent/earned, event trigger, danger alert, success/failure, reputation up, game over, button click, reset
- **Purpose**: Fornire feedback immediato non-visivo per migliorare l'esperienza di gioco e supportare giocatori ipovedenti con cue audio distintivi
- **Trigger**: Automatico su ogni azione, evento, e cambio di stato significativo
- **Progression**: Azione utente → Suono appropriato viene sintetizzato e riprodotto → Feedback visivo/testuale → Aggiornamento stato
- **Success criteria**: Ogni azione ha un suono distintivo, suoni non si sovrappongono fastidiosamente, volume appropriato (0.1-0.3 gain), durata breve (50-400ms), nessun lag percepibile

### Navigazione da Tastiera e Screen Reader
- **Functionality**: Tutti i controlli accessibili via Tab, shortcuts alfanumerici (1-9 per azioni rapide), ARIA live per feedback immediato. L'interfaccia è organizzata in tre schede principali per ridurre il sovraccarico cognitivo: "Profilo & Status" (statistiche dettagliate e reputazione), "Scuola & Studio" (voti e azioni scolastiche), "Vita Sociale" (tutte le attività sociali organizzate per categoria)
- **Purpose**: Garantire piena giocabilità per utenti ipovedenti o con screen reader, e migliorare l'usabilità per tutti riducendo la complessità visiva
- **Trigger**: Sempre attivo
- **Progression**: Keydown event → Identifica comando → Esegui azione → Annuncio vocale. Navigazione tra tabs via Tab + Arrow keys
- **Success criteria**: Nessun elemento richiede mouse, tutti i cambiamenti annunciati, focus visibile, ogni scheda è logicamente organizzata e non sovraffollata

## Edge Case Handling

- **Media sotto 4** - Game Over con schermata bocciatura, opzione reset
- **Soldi insufficienti** - Azione bloccata con messaggio ARIA live "Non hai abbastanza grana!"
- **Espulsione da minaccia prof** - 30% random, game over immediato con messaggio ironico
- **Stanchezza > 100** - Bloccate azioni faticose, richiede riposo
- **Muscoli bassi vs Metallari/Bulli** - Alta probabilità perdita combattimento = perdita soldi e stat
- **Corruzione senza soldi** - Impedita, richiede almeno 100€
- **Mazzetta polizia senza soldi** - Conseguenze peggiori (confisca tutto + penalità extra)
- **Fuga dalla polizia con Coattaggine bassa** - Beccato con multa maggiorata
- **Reset gioco** - Conferma via dialog accessibile prima di cancellare salvataggio
- **Eventi multipli sovrapposti** - Sistema previene trigger di eventi durante dialog aperti

## Design Direction

Il design deve evocare **nostalgia digitale trash** degli anni '90-2000: monitor CRT, colori neon acidi, font pixelati, e un'estetica volutamente "cheap" ma funzionale. L'atmosfera è ironica, auto-consapevole, e celebra l'estetica tamarra italiana con orgoglio kitsch. Massima leggibilità per screen reader.

## Color Selection

**Palette Neon-Truzzo ad Alto Contrasto:**

- **Primary Color** (Neon Green): `oklch(0.85 0.25 145)` - Verde fosforescente da monitor CRT, comunica energia tamarra e visibilità estrema. Usato per testo principale e highlight.
- **Secondary Colors**: 
  - Background Profondo: `oklch(0.1 0 0)` - Nero quasi totale per contrasto massimo
  - Cyan Elettrico: `oklch(0.8 0.2 195)` - Per statistiche positive e successi
  - Magenta Shock: `oklch(0.75 0.28 330)` - Per pericoli e warning
- **Accent Color** (Gold Tamarro): `oklch(0.8 0.15 85)` - Oro volgare per bottoni primari e CTA, evoca catene d'oro e bling
- **Foreground/Background Pairings**:
  - Primary su Background (`oklch(0.85 0.25 145)` su `oklch(0.1 0 0)`) - Ratio 12.5:1 ✓
  - Cyan su Background (`oklch(0.8 0.2 195)` su `oklch(0.1 0 0)`) - Ratio 11.2:1 ✓
  - Magenta su Background (`oklch(0.75 0.28 330)` su `oklch(0.1 0 0)`) - Ratio 9.1:1 ✓
  - Gold su Background (`oklch(0.8 0.15 85)` su `oklch(0.1 0 0)`) - Ratio 11.8:1 ✓

## Font Selection

**Tipografia che mescola nostalgia digitale e leggibilità estrema:**

- **Typographic Hierarchy**:
  - H1 (Titolo Gioco): "Orbitron" ExtraBold / 42px / tracking-wide - Font geometrico futuristico che ricorda LCD anni '90
  - H2 (Sezioni): "Orbitron" Bold / 28px / tracking-normal - Mantiene coerenza stilistica
  - Body (Statistiche/Azioni): "JetBrains Mono" Medium / 18px / leading-relaxed - Monospazio per dati tabellari, ottimo per screen reader
  - Feedback/Eventi: "JetBrains Mono" Regular / 16px / leading-loose - Stesso font per coerenza ma peso minore
  - Buttons: "Orbitron" SemiBold / 16px / uppercase / tracking-wider - Leggibile e tamarro

## Animations

Le animazioni servono **feedback immediato** senza distrarre e celebrare i successi del giocatore. Pulse sottile sui bottoni hover (100ms), slide-in veloce per notifiche eventi (200ms), flash neon su cambiamenti statistiche importanti (150ms uno-shot). **Animazioni drammatiche per stat changes**: quando una statistica cambia di +/-5 o più, appare un numero animato che mostra il delta (verde per positivo, rosso per negativo) con effetto fade-up. Per cambiamenti +/-10 o più, l'intera card della statistica pulsa e scala leggermente con rotazione, mentre l'icona ruota 360°. Per cambiamenti +/-15 o più, si aggiunge un glow intenso. Bottoni hanno spring physics su click con scale e rotazione dell'icona. Nessuna animazione automatica continua che disturbi screen reader. Focus ring animato (scale + glow) per evidenziare navigazione tastiera.

## Component Selection

- **Components**:
  - Tabs (shadcn) - Navigazione principale tra tre sezioni: "Profilo & Status", "Scuola & Studio", "Vita Sociale"
  - Card (shadcn) - Containers per sezioni Statistiche/Scuola/Azioni, con bordi neon via Tailwind `border-primary`
  - Button (shadcn) - Tutte le azioni, customizzati con varianti `neon` (bg-primary text-background) e `danger` (bg-destructive)
  - Alert Dialog (shadcn) - Per conferme reset e game over screen
  - Progress (shadcn) - Barre visive per Stanchezza e Media, con colori dinamici
  - Badge (shadcn) - Indicatori stato (es. "Bocciato!", "Espulso!")
  
- **Customizations**:
  - Componente custom `StatDisplay` - Mostra singola statistica con icona Phosphor, valore, e barra progress
  - Componente custom `ActionButton` - Button con shortcut key visualizzato e handler keyboard integrato
  - ARIA Live Region - `<div role="status" aria-live="assertive">` per annunci immediati
  - Layout a Schede - Interfaccia organizzata in 3 schede principali per ridurre il sovraccarico cognitivo

- **States**:
  - Buttons: Default (border-2 neon), Hover (bg-primary + scale-105), Focus (ring-4 ring-primary/50 + outline-offset-4), Disabled (opacity-40 + cursor-not-allowed)
  - Tabs: Active (bg-primary), Inactive (bg-muted), con transizioni fluide e indicatori visivi chiari
  - Inputs: Stesso pattern, focus ring molto evidente
  - Cards: Subtle glow on hover via `shadow-[0_0_15px_rgba(100,255,100,0.3)]`

- **Icon Selection** (Phosphor):
  - GraduationCap - Scuola
  - Barbell - Palestra  
  - Sun - Lampada
  - CurrencyDollar - Soldi
  - Lightning - Coattaggine
  - Brain - Studiare
  - HandCoins - Corrompere/Mazzette
  - Fist - Minacciare/Combattere
  - Running - Scappare
  - Briefcase - Lavoro
  - Motorcycle - Motorino
  - Heart - Atipa/Rimorchio
  - Sparkle - Figosità
  - SirenLight - Polizia (animated pulse)
  - Flag - Gara/Street Race
  - ShieldWarning - Bulli/Pericolo
  - Crown - Reputazione/Status
  - ChartBar - Tab "Profilo & Status"
  - User - Sezione Caratteristiche
  - Buildings - Tab "Vita Sociale"

- **Spacing**: 
  - Container padding: `p-6`
  - Card gaps: `gap-4` nelle grid, `gap-6` tra sezioni principali
  - Button spacing: `px-6 py-3`
  - Section margins: `mb-8` ridotto a `mb-6` nelle tabs per compattezza
  - Tutto basato su scale Tailwind (4px increments) per consistenza

- **Mobile**:
  - Stack verticale completo sotto 768px
  - Statistiche quick-view da grid 6-col a 2-col
  - Tab labels cambiano da lunghi ("Profilo & Status") a corti ("Status") su schermi piccoli usando classi responsive
  - Bottoni azioni restano leggibili con icone grandi
  - Font sizes scalano via `text-base` responsive
  - Touch targets min 44x44px (già garantito da `px-6 py-3` sui Button)
  - Shortcuts tastiera rimangono attivi anche su mobile per utenti con tastiera Bluetooth
