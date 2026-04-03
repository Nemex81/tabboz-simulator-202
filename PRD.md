# Tabboz Simulator: 2026 Edition

Un simulatore di vita da "coatto" anni '90-2000, completamente accessibile e ironico, che celebra la cultura tamarra italiana con meccaniche scolastiche rischiose e scelte moralmente discutibili.

**Experience Qualities:**
1. **Nostalgico** - Riporta il giocatore agli anni d'oro del gaming italiano trash, con linguaggio gergale e riferimenti culturali del periodo
2. **Rischioso** - Ogni scelta importante ha conseguenze reali: corrompere un prof può salvarti o farti espellere
3. **Accessibile** - Screen reader ready con ARIA live regions, shortcuts da tastiera, e contrasto estremo per ipovedenti

**Complexity Level:** Light Application (multiple features with basic state)
Il gioco ha diverse meccaniche interconnesse (scuola, palestra, lavoro, eventi) ma mantiene un'interfaccia semplice basata su scelte e statistiche. Perfetto per sessioni brevi con progressione salvata.

## Essential Features

### Sistema Scolastico con Corruzione
- **Functionality**: Gestione di 4 materie (Matematica, Italiano, Storia, Ed. Fisica) con media da 0-10. Se scende sotto 4 = bocciatura (game over)
- **Purpose**: Core mechanic del gioco - bilanciare studio legittimo vs metodi "alternativi"
- **Trigger**: Accesso alla sezione "Scuola" dal menu principale
- **Progression**: Visualizza voti per materia → Scelta azione (Studia/Corrompi/Minaccia) → Calcolo probabilistico esito → Aggiornamento statistiche → ARIA live announcement
- **Success criteria**: Media calcolata correttamente, eventi di espulsione al 30% per "Minaccia", costi applicati per corruzione

### Sistema Statistiche e Progressione
- **Functionality**: 5 statistiche principali (Coattaggine, Muscoli, Soldi, Media Scolastica, Stanchezza) che si influenzano a vicenda
- **Purpose**: Creare scelte strategiche - spendere soldi in palestra o corrompere? Studiare o lavorare?
- **Trigger**: Sempre visibili in dashboard, aggiornate dopo ogni azione
- **Progression**: Azione selezionata → Verifica prerequisiti (es. abbastanza soldi?) → Applicazione modifiche → Annuncio vocale cambiamenti
- **Success criteria**: Tutte le stat reagiscono correttamente, limiti rispettati (es. Stanchezza max 100)

### Azioni Vita Sociale
- **Functionality**: Palestra (+Muscoli, -Soldi), Lampada (+Coattaggine, -Soldi), Lavora come Buttadifuori (+Soldi se Muscoli alti), Trucca Motorino (+Coattaggine, -Soldi)
- **Purpose**: Modi alternativi per crescere le stat necessarie a sopravvivere
- **Trigger**: Menu "Azioni" con shortcuts da tastiera (P/L/B/M)
- **Progression**: Selezione azione → Check condizioni → Esito con flavor text → Update stat
- **Success criteria**: Ogni azione ha effetti distinti, alcuni richiedono stat minime

### Eventi Casuali (Metallari)
- **Functionality**: Apparizioni random di "metallari" ostili - puoi scappare (codardo ma sicuro) o combattere (basato su Muscoli)
- **Purpose**: Elemento di imprevedibilità che premia investimento in Muscoli
- **Trigger**: Random dopo azioni comuni (20% chance)
- **Progression**: Notifica evento → Scelta Scappa/Combatti → Calcolo esito (se combatti: check Muscoli) → Conseguenze (perdita Soldi se perdi)
- **Success criteria**: Probabilità corrette, esiti coerenti con stat

### Sistema di Salvataggio Persistente
- **Functionality**: Auto-save di tutte le stat e stato gioco ogni cambiamento
- **Purpose**: Permette sessioni multiple senza perdere progressione
- **Trigger**: Automatico via useKV hook
- **Progression**: Ogni modifica stat → useKV setter → Persistenza immediata
- **Success criteria**: Refresh mantiene stato, reset button funziona

### Navigazione da Tastiera e Screen Reader
- **Functionality**: Tutti i controlli accessibili via Tab, shortcuts alfanumerici (1-9 per azioni rapide), ARIA live per feedback immediato
- **Purpose**: Garantire piena giocabilità per utenti ipovedenti o con screen reader
- **Trigger**: Sempre attivo
- **Progression**: Keydown event → Identifica comando → Esegui azione → Annuncio vocale
- **Success criteria**: Nessun elemento richiede mouse, tutti i cambiamenti annunciati, focus visibile

## Edge Case Handling

- **Media sotto 4** - Game Over con schermata bocciatura, opzione reset
- **Soldi insufficienti** - Azione bloccata con messaggio ARIA live "Non hai abbastanza grana!"
- **Espulsione da minaccia prof** - 30% random, game over immediato con messaggio ironico
- **Stanchezza > 100** - Bloccate azioni faticose, richiede riposo
- **Muscoli bassi vs Metallari** - Alta probabilità perdita combattimento = perdita soldi
- **Corruzione senza soldi** - Impedita, richiede almeno 50€
- **Reset gioco** - Conferma via dialog accessibile prima di cancellare salvataggio

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

Le animazioni servono **feedback immediato** senza distrarre. Pulse sottile sui bottoni hover (100ms), slide-in veloce per notifiche eventi (200ms), flash neon su cambiamenti statistiche importanti (150ms uno-shot). Nessuna animazione automatica continua che disturbi screen reader. Focus ring animato (scale + glow) per evidenziare navigazione tastiera.

## Component Selection

- **Components**:
  - Card (shadcn) - Containers per sezioni Statistiche/Scuola/Azioni, con bordi neon via Tailwind `border-primary`
  - Button (shadcn) - Tutte le azioni, customizzati con varianti `neon` (bg-primary text-background) e `danger` (bg-destructive)
  - Alert Dialog (shadcn) - Per conferme reset e game over screen
  - Progress (shadcn) - Barre visive per Stanchezza e Media, con colori dinamici
  - Badge (shadcn) - Indicatori stato (es. "Bocciato!", "Espulso!")
  
- **Customizations**:
  - Componente custom `StatDisplay` - Mostra singola statistica con icona Phosphor, valore, e barra progress
  - Componente custom `ActionButton` - Button con shortcut key visualizzato e handler keyboard integrato
  - ARIA Live Region - `<div role="status" aria-live="assertive">` per annunci immediati

- **States**:
  - Buttons: Default (border-2 neon), Hover (bg-primary + scale-105), Focus (ring-4 ring-primary/50 + outline-offset-4), Disabled (opacity-40 + cursor-not-allowed)
  - Inputs: Stesso pattern, focus ring molto evidente
  - Cards: Subtle glow on hover via `shadow-[0_0_15px_rgba(100,255,100,0.3)]`

- **Icon Selection** (Phosphor):
  - GraduationCap - Scuola
  - Barbell - Palestra  
  - Sun - Lampada
  - CurrencyDollar - Soldi
  - Lightning - Coattaggine
  - Brain - Studiare
  - HandCoins - Corrompere
  - Fist - Minacciare/Combattere
  - Running - Scappare
  - Briefcase - Lavoro
  - Motorcycle - Motorino

- **Spacing**: 
  - Container padding: `p-6`
  - Card gaps: `gap-4`
  - Button spacing: `px-6 py-3`
  - Section margins: `mb-8`
  - Tutto basato su scale Tailwind (4px increments) per consistenza

- **Mobile**:
  - Stack verticale completo sotto 768px
  - Statistiche da grid 5-col a 2-col poi a 1-col
  - Bottoni azioni da grid 4-col a 2-col
  - Font sizes scalano via `text-base` responsive
  - Touch targets min 44x44px (già garantito da `px-6 py-3` sui Button)
  - Shortcuts tastiera disabilitati su mobile, sostituiti da tap
