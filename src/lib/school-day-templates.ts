// ─── ORDINARY_TEMPLATES ───────────────────────────────────────────────────────
//
// Pool di testi narrativi per gli eventi ordinari di ogni ora scolastica.
// Placeholder: {ora}, {teacher}, {materia}
// La chiave _fallback viene usata quando non esiste un pool specifico.
//
// Conteggio: 7 materie comuni × 8 template + ~44 materie specifiche × 5-6 template
// + 5 template _fallback = circa 330 template totali

export const ORDINARY_TEMPLATES: Record<string, string[]> = {

  // ─── Materie Comuni ──────────────────────────────────────────────────────────

  italiano: [
    '{ora}ª ora — {materia}. {teacher} legge ad alta voce un brano di narrativa. Qualcuno segue davvero.',
    '{ora}ª ora — {materia}. {teacher} spiega la struttura del periodo ipotetico. Ti sforzi di capire.',
    '{ora}ª ora — {materia}. {teacher} commenta l\'ultimo tema. I voti non sono stati brillanti.',
    '{ora}ª ora — {materia}. Analisi del testo. {teacher} interroga a voce i paragrafi uno per uno.',
    '{ora}ª ora — {materia}. {teacher} detta appunti sul Decameron. Scrivi più veloce che puoi.',
    '{ora}ª ora — {materia}. Ripasso grammaticale: congiuntivo vs condizionale. {teacher} spiega con pazienza.',
    '{ora}ª ora — {materia}. {teacher} assegna un tema per casa sullo stesso giorno della verifica di matematica.',
    '{ora}ª ora — {materia}. Lettura e commento di una poesia di Leopardi. Qualcuno sbadiglia rumorosamente.',
  ],

  storia: [
    '{ora}ª ora — {materia}. {teacher} ripercorre la Prima Guerra Mondiale con una cartina scolorita.',
    '{ora}ª ora — {materia}. Lezione sulla Rivoluzione Francese. {teacher} spiega il Terrore con soddisfazione.',
    '{ora}ª ora — {materia}. {teacher} interroga sulla caduta dell\'Impero Romano. Silenzio pesante in classe.',
    '{ora}ª ora — {materia}. Ripasso sul Risorgimento. {teacher} chiede chi era Cavour. Pochi alzano la mano.',
    '{ora}ª ora — {materia}. {teacher} mostra documentari in bianco e nero. Metà classe sonnecchia.',
    '{ora}ª ora — {materia}. Guerra Fredda e blocchi contrapposti. {teacher} spiega la crisi dei missili.',
    '{ora}ª ora — {materia}. {teacher} fa domande a sorpresa sull\'ultimo capitolo assegnato la settimana scorsa.',
    '{ora}ª ora — {materia}. Excursus sul dopoguerra. {teacher} collega la storia agli eventi di oggi.',
  ],

  inglese: [
    '{ora}ª ora — {materia}. {teacher} fa ripetere la pronuncia dei phrasal verbs. Qualcuno ci ride su.',
    '{ora}ª ora — {materia}. Reading comprehension dal libro. {teacher} chiama a leggere ad alta voce.',
    '{ora}ª ora — {materia}. {teacher} spiega il past perfect continuous. La tua testa scoppia.',
    '{ora}ª ora — {materia}. Dialogo a coppie su situazioni quotidiane. {teacher} gira tra i banchi.',
    '{ora}ª ora — {materia}. {teacher} proietta un video in inglese senza sottotitoli. Sopravvivi a metà.',
    '{ora}ª ora — {materia}. Correzione del compito scritto. {teacher} indica gli errori più frequenti.',
    '{ora}ª ora — {materia}. Grammar: reported speech. {teacher} usa esempi dalla vita reale.',
    '{ora}ª ora — {materia}. {teacher} assegna un brano di letteratura moderna. Temi e simbolismi.',
  ],

  matematica: [
    '{ora}ª ora — {materia}. {teacher} spiega le derivate alla lavagna. Ti perdi intorno al terzo passaggio.',
    '{ora}ª ora — {materia}. Esercizi su equazioni di secondo grado. {teacher} controlla banco per banco.',
    '{ora}ª ora — {materia}. {teacher} dimostra un teorema. La lavagna è piena di lettere greche.',
    '{ora}ª ora — {materia}. Trigonometria: seno, coseno e tangente. {teacher} disegna cerchi sul quaderno.',
    '{ora}ª ora — {materia}. Ripasso per la verifica di domani. {teacher} consiglia di ripassare almeno i limiti.',
    '{ora}ª ora — {materia}. {teacher} corregge i compiti. Poca gente li ha fatti. Clima teso.',
    '{ora}ª ora — {materia}. Studio di funzione: dominio e segno. {teacher} chiede volontari alla lavagna.',
    '{ora}ª ora — {materia}. Probabilità e statistica. {teacher} usa esempi con i dadi per spiegare.',
  ],

  edFisica: [
    '{ora}ª ora — {materia}. {teacher} divide la classe in squadre. Si gioca a pallavolo.',
    '{ora}ª ora — {materia}. Riscaldamento muscolare. {teacher} controlla la postura durante gli esercizi.',
    '{ora}ª ora — {materia}. Corsa in pista. {teacher} cronometra e annota i risultati sul registro.',
    '{ora}ª ora — {materia}. Teoria dell\'allenamento. {teacher} spiega la differenza tra aerobico e anaerobico.',
    '{ora}ª ora — {materia}. Partita di calcetto in palestra. {teacher} fa da arbitro.',
    '{ora}ª ora — {materia}. {teacher} insegna tecniche di primo soccorso in forma teorica.',
    '{ora}ª ora — {materia}. Atletica leggera: salto in lungo. {teacher} misura le distanze con il metro.',
    '{ora}ª ora — {materia}. {teacher} fa fare esercizi di stretching e coordinazione a coppie.',
  ],

  religione: [
    '{ora}ª ora — {materia}. {teacher} parla di etica contemporanea. Discussione animata in classe.',
    '{ora}ª ora — {materia}. {teacher} proietta un documentario sulle grandi religioni mondiali.',
    '{ora}ª ora — {materia}. Dibattito su valori e diritti umani. {teacher} moderata le voci.',
    '{ora}ª ora — {materia}. {teacher} commenta fatti di cronaca con un approccio etico.',
    '{ora}ª ora — {materia}. Lettura di brani filosofici e religiosi. {teacher} chiede riflessioni personali.',
    '{ora}ª ora — {materia}. {teacher} introduce il tema della coscienza individuale e collettiva.',
    '{ora}ª ora — {materia}. Ora libera di confronto: {teacher} pone domande aperte. Tutti parlano.',
    '{ora}ª ora — {materia}. {teacher} racconta episodi storici legati alle origini del Cristianesimo.',
  ],

  fisica: [
    '{ora}ª ora — {materia}. {teacher} spiega le Leggi di Newton con esempi pratici.',
    '{ora}ª ora — {materia}. Laboratorio: misura dell\'accelerazione di gravità con il pendolo.',
    '{ora}ª ora — {materia}. {teacher} disegna diagrammi di forze alla lavagna. Segui con difficoltà.',
    '{ora}ª ora — {materia}. Termodinamica: primo e secondo principio. {teacher} usa analogie concrete.',
    '{ora}ª ora — {materia}. Problemi di cinematica. {teacher} chiede a metà classe di andare alla lavagna.',
    '{ora}ª ora — {materia}. {teacher} spiega l\'elettromagnetismo con schemi e animazioni.',
    '{ora}ª ora — {materia}. Ripasso per la verifica. {teacher} consiglia di ripassare le unità di misura.',
    '{ora}ª ora — {materia}. Ottica geometrica: riflessione e rifrazione. {teacher} usa una torcia come demo.',
  ],

  // ─── Materie Specifiche — Tecnico Informatico ────────────────────────────────

  diritto: [
    '{ora}ª ora — {materia}. {teacher} spiega le fonti del diritto. Costituzione e leggi ordinarie.',
    '{ora}ª ora — {materia}. Economia di mercato: domanda e offerta. {teacher} usa grafici alla lavagna.',
    '{ora}ª ora — {materia}. {teacher} illustra i principi fondamentali del contratto di lavoro.',
    '{ora}ª ora — {materia}. Ripasso su diritti e doveri del cittadino. {teacher} fa domande ad alta voce.',
    '{ora}ª ora — {materia}. {teacher} parla di tutela dei consumatori. Qualcuno fa domande personali.',
  ],

  scienzeInt: [
    '{ora}ª ora — {materia}. {teacher} spiega la struttura della cellula e le sue funzioni principali.',
    '{ora}ª ora — {materia}. Scienze della Terra: il ciclo delle rocce. {teacher} mostra campioni.',
    '{ora}ª ora — {materia}. {teacher} introduce la genetica mendeliana con i classici quadrati di Punnett.',
    '{ora}ª ora — {materia}. Ecosistemi e biodiversità. {teacher} mostra immagini di habitat diversi.',
    '{ora}ª ora — {materia}. {teacher} riepiloga l\'evoluzione Darwiniana. Si discute vivacemente.',
  ],

  chimicaInt: [
    '{ora}ª ora — {materia}. {teacher} spiega le reazioni di ossido-riduzione con esempi quotidiani.',
    '{ora}ª ora — {materia}. Tavola periodica: andamenti periodici. {teacher} interroga i metalli alcalini.',
    '{ora}ª ora — {materia}. {teacher} mostra un esperimento in laboratorio sulle soluzioni tampone.',
    '{ora}ª ora — {materia}. Stechiometria: calcolo delle moli. {teacher} svolge esercizi passo per passo.',
    '{ora}ª ora — {materia}. {teacher} spiega i legami chimici: ionico, covalente e metallico.',
  ],

  tecnInfo: [
    '{ora}ª ora — {materia}. {teacher} spiega la codifica binaria e i sistemi di numerazione.',
    '{ora}ª ora — {materia}. Laboratorio PC: esercitazione su foglio di calcolo. {teacher} gira tra i banchi.',
    '{ora}ª ora — {materia}. {teacher} introduce i sistemi operativi e i file system.',
    '{ora}ª ora — {materia}. Reti locali: topologie e protocolli base. {teacher} disegna schemi LAN.',
    '{ora}ª ora — {materia}. {teacher} fa installare un semplice programma e commenta le fasi.',
  ],

  informatica: [
    '{ora}ª ora — {materia}. {teacher} spiega la ricorsione con l\'esempio del fattoriale.',
    '{ora}ª ora — {materia}. Laboratorio: debug di un programma con errori a cascata. {teacher} aiuta a metà.',
    '{ora}ª ora — {materia}. {teacher} introduce i design pattern. Observer e Singleton in mezz\'ora.',
    '{ora}ª ora — {materia}. Algoritmi di sorting: BubbleSort vs MergeSort. {teacher} confronta le complessità.',
    '{ora}ª ora — {materia}. {teacher} assegna un progetto da consegnare venerdì. Silenzio generale.',
    '{ora}ª ora — {materia}. SQL: query con JOIN multipli. {teacher} proietta codice sul monitor.',
  ],

  sistemi: [
    '{ora}ª ora — {materia}. {teacher} spiega il modello OSI strato per strato.',
    '{ora}ª ora — {materia}. Configurazione di un router virtuale in laboratorio. {teacher} supervisiona.',
    '{ora}ª ora — {materia}. {teacher} parla di protocolli di routing: RIP e OSPF a confronto.',
    '{ora}ª ora — {materia}. Sicurezza di rete: firewall e VPN. {teacher} usa casi reali.',
    '{ora}ª ora — {materia}. {teacher} spiega il DNS con un\'analogia della rubrica telefonica.',
  ],

  tpsit: [
    '{ora}ª ora — {materia}. {teacher} introduce la progettazione di sistemi embedded.',
    '{ora}ª ora — {materia}. Laboratorio: interfacciamento sensori su scheda di sviluppo.',
    '{ora}ª ora — {materia}. {teacher} spiega i bus di comunicazione I2C e SPI.',
    '{ora}ª ora — {materia}. Sistemi real-time: schedulazione e priorità. {teacher} fa esempi industriali.',
    '{ora}ª ora — {materia}. {teacher} assegna la documentazione del progetto. Molte lamentele.',
  ],

  linguaggio: [
    '{ora}ª ora — {materia}. {teacher} spiega la differenza tra linguaggi compilati e interpretati.',
    '{ora}ª ora — {materia}. Laboratorio: prime funzioni in Python. {teacher} risolve gli errori in tempo reale.',
    '{ora}ª ora — {materia}. {teacher} introduce i puntatori in C. Confusione collettiva.',
    '{ora}ª ora — {materia}. Esercitazione su Java: classi e ereditarietà. {teacher} mostra schemi UML.',
    '{ora}ª ora — {materia}. {teacher} corregge i listati consegnati la settimana scorsa.',
  ],

  basiDati: [
    '{ora}ª ora — {materia}. {teacher} spiega la normalizzazione fino alla terza forma normale.',
    '{ora}ª ora — {materia}. Laboratorio: creazione di tabelle e relazioni su DBMS. {teacher} gira a controllare.',
    '{ora}ª ora — {materia}. {teacher} spiega le transazioni ACID e il concetto di lock.',
    '{ora}ª ora — {materia}. Query complesse: SELECT con aggregazioni e subquery. {teacher} propone sfide.',
    '{ora}ª ora — {materia}. {teacher} fa vedere NoSQL come alternativa. MongoDB in demo.',
  ],

  webDev: [
    '{ora}ª ora — {materia}. {teacher} mostra come strutturare una pagina con HTML semantico.',
    '{ora}ª ora — {materia}. CSS: flexbox e grid. {teacher} proietta esempi dal vivo nel browser.',
    '{ora}ª ora — {materia}. {teacher} introduce la sicurezza web: XSS e SQL injection. Attenzione alta.',
    '{ora}ª ora — {materia}. Laboratorio: primo progetto web personale. {teacher} valuta il layout.',
    '{ora}ª ora — {materia}. {teacher} spiega le API REST con Postman. La classe prova.',
  ],

  // ─── Agraria ─────────────────────────────────────────────────────────────────

  pedologia: [
    '{ora}ª ora — {materia}. {teacher} spiega la composizione del suolo e il pH dei terreni.',
    '{ora}ª ora — {materia}. Analisi di campioni di terra in laboratorio. {teacher} spiega l\'interpretazione.',
    '{ora}ª ora — {materia}. {teacher} illustra la fertilità del suolo e le pratiche di ammendamento.',
    '{ora}ª ora — {materia}. Studio dei profili pedologici. {teacher} mostra strati fotografati sul campo.',
    '{ora}ª ora — {materia}. {teacher} parla dell\'erosione e della difesa idrogeologica.',
  ],

  agronomia: [
    '{ora}ª ora — {materia}. {teacher} spiega la rotazione colturale e i suoi benefici.',
    '{ora}ª ora — {materia}. Tecniche di irrigazione: goccia vs aspersione. {teacher} confronta le efficienze.',
    '{ora}ª ora — {materia}. {teacher} parla di agricoltura di precisione e sensori IoT in campo.',
    '{ora}ª ora — {materia}. Visita virtuale a un\'azienda agricola. {teacher} commenta le scelte gestionali.',
    '{ora}ª ora — {materia}. {teacher} spiega la difesa fitosanitaria integrata.',
  ],

  zootecnia: [
    '{ora}ª ora — {materia}. {teacher} descrive le razze bovine da latte e da carne.',
    '{ora}ª ora — {materia}. Nutrizione animale: composizione dei mangimi. {teacher} mostra le etichette.',
    '{ora}ª ora — {materia}. {teacher} spiega il benessere animale nelle stalle moderne.',
    '{ora}ª ora — {materia}. Riproduzione e selezione genetica. {teacher} usa esempi di allevamenti locali.',
    '{ora}ª ora — {materia}. {teacher} parla di produzioni avicole. Curiosità tra i banchi.',
  ],

  chimicaAgraria: [
    '{ora}ª ora — {materia}. {teacher} analizza la composizione dei fertilizzanti chimici.',
    '{ora}ª ora — {materia}. Chimica dei fitofarmaci: principi attivi e meccanismi. {teacher} spiega con cura.',
    '{ora}ª ora — {materia}. {teacher} spiega il ciclo dell\'azoto nel suolo agricolo.',
    '{ora}ª ora — {materia}. Laboratorio: saggio chimico su campioni di terreno.',
    '{ora}ª ora — {materia}. {teacher} illustra la legislazione sull\'uso dei pesticidi.',
  ],

  economiaAgraria: [
    '{ora}ª ora — {materia}. {teacher} spiega la redditività di un\'azienda agricola con bilancio semplificato.',
    '{ora}ª ora — {materia}. Politiche europee per l\'agricoltura: PAC e sussidi. {teacher} fa esempi pratici.',
    '{ora}ª ora — {materia}. {teacher} analizza il mercato dei cereali e le dinamiche dei prezzi.',
    '{ora}ª ora — {materia}. Business plan per una startup agricola. {teacher} guida la stesura.',
    '{ora}ª ora — {materia}. {teacher} parla di filiere corte e mercati locali.',
  ],

  biologia: [
    '{ora}ª ora — {materia}. {teacher} spiega la fotosintesi clorofilliana passo per passo.',
    '{ora}ª ora — {materia}. Mitosi e meiosi: differenze e fasi. {teacher} usa animazioni.',
    '{ora}ª ora — {materia}. {teacher} parla di biotecnologie e OGM. Discussione accesa.',
    '{ora}ª ora — {materia}. Sistema immunitario: anticorpi e vaccini. {teacher} risponde alle domande.',
    '{ora}ª ora — {materia}. {teacher} spiega la struttura del DNA e la doppia elica.',
  ],

  ambienteRurale: [
    '{ora}ª ora — {materia}. {teacher} spiega il paesaggio agrario italiano e le sue trasformazioni.',
    '{ora}ª ora — {materia}. {teacher} parla di biodiversità rurale e tutela della flora autoctona.',
    '{ora}ª ora — {materia}. Legislazione ambientale: aree protette e vincoli paesaggistici.',
    '{ora}ª ora — {materia}. {teacher} introduce lo sviluppo sostenibile in ambito rurale.',
    '{ora}ª ora — {materia}. {teacher} mostra mappe del territorio e spiega le ZSC.',
  ],

  // ─── Liceo Artistico ─────────────────────────────────────────────────────────

  storiaArte: [
    '{ora}ª ora — {materia}. {teacher} analizza le proporzioni del Rinascimento con slide di Botticelli.',
    '{ora}ª ora — {materia}. Arte contemporanea: {teacher} spiega il perché un quadrato bianco vale milioni.',
    '{ora}ª ora — {materia}. {teacher} guida un\'analisi formale di una scultura greca classica.',
    '{ora}ª ora — {materia}. Impressionismo: luce e colore. {teacher} mostra Monet e Renoir.',
    '{ora}ª ora — {materia}. {teacher} prepara alla visita al museo con schede sulle opere da vedere.',
    '{ora}ª ora — {materia}. Architettura gotica: cattedrali e strutture portanti. {teacher} disegna gli archi.',
  ],

  disegnoGeo: [
    '{ora}ª ora — {materia}. {teacher} insegna le proiezioni ortogonali: vista frontale e laterale.',
    '{ora}ª ora — {materia}. Esercitazione: sezione di solido geometrico. {teacher} controlla le misure.',
    '{ora}ª ora — {materia}. {teacher} spiega la prospettiva centrale con punto di fuga.',
    '{ora}ª ora — {materia}. Assonometria isometrica. {teacher} disegna un cubo alla lavagna.',
    '{ora}ª ora — {materia}. {teacher} corregge le tavole grafiche. Qualcuno ha dimenticato il tecnigrafo.',
  ],

  disegnoArtist: [
    '{ora}ª ora — {materia}. {teacher} propone uno studio dal vero: composizione con oggetti sul tavolo.',
    '{ora}ª ora — {materia}. Tecniche di chiaroscuro. {teacher} mostra come usare il tratto incrociato.',
    '{ora}ª ora — {materia}. {teacher} insegna la teoria del colore: colori complementari a confronto.',
    '{ora}ª ora — {materia}. Schizzo dal vivo: modello in maschera in posa. {teacher} gira a correggere.',
    '{ora}ª ora — {materia}. {teacher} analizza i disegni preparatori di Leonardo e Michelangelo.',
  ],

  laboratorioPit: [
    '{ora}ª ora — {materia}. {teacher} spiega come preparare la tela e i colori ad olio.',
    '{ora}ª ora — {materia}. Esercitazione: acrilici su cartoncino. {teacher} insegna la velatura.',
    '{ora}ª ora — {materia}. {teacher} mostra le tecniche dell\'acquarello: bagnato su bagnato.',
    '{ora}ª ora — {materia}. {teacher} corregge i lavori della settimana con critiche costruttive.',
    '{ora}ª ora — {materia}. {teacher} introduce la pittura gestuale. Libertà totale. Qualcuno esagera.',
  ],

  chimicaMat: [
    '{ora}ª ora — {materia}. {teacher} spiega la composizione dei pigmenti naturali e sintetici.',
    '{ora}ª ora — {materia}. Proprietà fisiche dei materiali: elasticità, durezza, conducibilità.',
    '{ora}ª ora — {materia}. {teacher} parla dei leganti usati nelle pitture storiche: cera, olio, tempera.',
    '{ora}ª ora — {materia}. {teacher} mostra come il pH deteriora i supporti cartacei nel tempo.',
    '{ora}ª ora — {materia}. Laboratorio: test di resistenza su campioni di materiale.',
  ],

  filosofia: [
    '{ora}ª ora — {materia}. {teacher} introduce Kant e la Critica della Ragion Pura. Classe scettica.',
    '{ora}ª ora — {materia}. Hegel: dialettica tesi-antitesi-sintesi. {teacher} usa esempi storici.',
    '{ora}ª ora — {materia}. {teacher} guida una discussione su libertà e determinismo.',
    '{ora}ª ora — {materia}. Filosofia del \u2019900: Nietzsche e il Superuomo. Molte interpretazioni in classe.',
    '{ora}ª ora — {materia}. {teacher} spiega il pensiero di Platone: mito della caverna sul proiettore.',
    '{ora}ª ora — {materia}. {teacher} assegna un saggio breve da consegnare entro la fine della settimana.',
  ],

  progettazioneArt: [
    '{ora}ª ora — {materia}. {teacher} spiega le fasi di un brief creativo professionale.',
    '{ora}ª ora — {materia}. Laboratorio: bozzetti per un manifesto pubblicitario. {teacher} dà feedback.',
    '{ora}ª ora — {materia}. {teacher} mostra portfolio di designer affermati a confronto.',
    '{ora}ª ora — {materia}. Critica del progetto: la classe commenta i lavori esposti.',
    '{ora}ª ora — {materia}. {teacher} introduce software di grafica vettoriale per la prossima fase.',
  ],

  laboratorioProg: [
    '{ora}ª ora — {materia}. {teacher} guida lo sviluppo di un\'installazione con materiali di recupero.',
    '{ora}ª ora — {materia}. Tecniche di modellatura: argilla e creta sintetica. {teacher} corregge le proporzioni.',
    '{ora}ª ora — {materia}. {teacher} spiega l\'uso del laser cutting per la prototipazione.',
    '{ora}ª ora — {materia}. Prova pratica: realizzazione di un\'opera su commissione fittizia.',
    '{ora}ª ora — {materia}. {teacher} mostra esempi di design industriale e artigianato d\'eccellenza.',
  ],

  discipline: [
    '{ora}ª ora — {materia}. {teacher} spiega le tecniche di scultura in marmo: sbozzatura e rifinitura.',
    '{ora}ª ora — {materia}. Modellazione in scala di un busto. {teacher} corregge le proporzioni del viso.',
    '{ora}ª ora — {materia}. {teacher} analizza opere di Rodin e Brancusi. Confronto di stili.',
    '{ora}ª ora — {materia}. {teacher} introduce la ceramica: cenni storici e tecniche base.',
    '{ora}ª ora — {materia}. Esercitazione libera: scultura astratta con materiali a scelta.',
  ],

  // ─── Conservatorio ───────────────────────────────────────────────────────────

  strumento: [
    '{ora}ª ora — {materia}. {teacher} ascolta la tua esecuzione e suggerisce correzioni di postura.',
    '{ora}ª ora — {materia}. Lezione individuale: {teacher} lavora sul fraseggio di un brano classico.',
    '{ora}ª ora — {materia}. {teacher} insegna a gestire le dinamiche: piano, forte, crescendo.',
    '{ora}ª ora — {materia}. Esecuzione a memoria di fronte alla classe. {teacher} prende appunti.',
    '{ora}ª ora — {materia}. {teacher} introduce un nuovo brano del repertorio del periodo romantico.',
    '{ora}ª ora — {materia}. Preparazione al saggio di fine quadrimestre. {teacher} è esigente sul tempo.',
  ],

  teoriaMusicale: [
    '{ora}ª ora — {materia}. {teacher} spiega gli intervalli: seconda, terza, quarta, quinta.',
    '{ora}ª ora — {materia}. Dettato armonico alla lavagna. {teacher} suona e la classe trascrive.',
    '{ora}ª ora — {materia}. {teacher} introduce la forma sonata: esposizione, sviluppo, ripresa.',
    '{ora}ª ora — {materia}. Analisi armonica di un corale di Bach. {teacher} gioca a nominare gli accordi.',
    '{ora}ª ora — {materia}. {teacher} spiega la modulazione verso la dominante con esempi al pianoforte.',
  ],

  storiaMusica: [
    '{ora}ª ora — {materia}. {teacher} racconta Beethoven e la sua sordità con commento all\'ascolto.',
    '{ora}ª ora — {materia}. Il Barocco musicale: Vivaldi e il Concerto per le stagioni. {teacher} fa ascoltare.',
    '{ora}ª ora — {materia}. {teacher} parla del jazz e delle sue radici afroamericane.',
    '{ora}ª ora — {materia}. Musica del \u2019900: atonalismo e dodecafonia. Classe disorientata.',
    '{ora}ª ora — {materia}. {teacher} confronta opera lirica e musical a confronto su proiettore.',
  ],

  musicaInsieme: [
    '{ora}ª ora — {materia}. Prova d\'insieme: {teacher} ferma la sezione fiati e la corregge.',
    '{ora}ª ora — {materia}. {teacher} insegna come seguire il direttore durante una pausa generale.',
    '{ora}ª ora — {materia}. Lettura a prima vista di un brano nuovo. Qualcuno va fuori tempo.',
    '{ora}ª ora — {materia}. {teacher} divide per sezioni e lavora sull\'intonazione.',
    '{ora}ª ora — {materia}. Prova generale del saggio. {teacher} insiste sul pianissimo finale.',
  ],

  tecnologieMusic: [
    '{ora}ª ora — {materia}. {teacher} introduce il DAW: proietta la schermata e spiega le tracce.',
    '{ora}ª ora — {materia}. Laboratorio: registrazione di una linea melodica e mixaggio base.',
    '{ora}ª ora — {materia}. {teacher} spiega la sintesi sonora: FM e sottrattiva a confronto.',
    '{ora}ª ora — {materia}. {teacher} mostra come usare i plug-in per riverb e compressione.',
    '{ora}ª ora — {materia}. Progetto finale: arrangiamento di un tema originale. {teacher} dà indicazioni.',
  ],

  solfeggio: [
    '{ora}ª ora — {materia}. {teacher} fa battere un ritmo in 3/4 con le mani. Molti si perdono.',
    '{ora}ª ora — {materia}. Lettura intonata: {teacher} percorre scale in diversi modi.',
    '{ora}ª ora — {materia}. Dettato ritmico. {teacher} batte e la classe trascrive sul pentagramma.',
    '{ora}ª ora — {materia}. {teacher} spiega le legature di valore e di portamento.',
    '{ora}ª ora — {materia}. Correzione dei dettati della settimana scorsa. Errori comuni discussi.',
  ],

  armonia: [
    '{ora}ª ora — {materia}. {teacher} spiega la risoluzione della settima di dominante.',
    '{ora}ª ora — {materia}. Realizzazione di un basso cifrato. {teacher} corregge le voci in parallelo.',
    '{ora}ª ora — {materia}. {teacher} introduce le modulazioni enharmoniche: complessità alta.',
    '{ora}ª ora — {materia}. Analisi armonica di un brano romantico. {teacher} identifica le progressioni.',
    '{ora}ª ora — {materia}. {teacher} assegna la realizzazione di una melodia con accompagnamento.',
  ],

  scienze: [
    '{ora}ª ora — {materia}. {teacher} spiega la tettonica a placche con una cartina globale.',
    '{ora}ª ora — {materia}. Chimica organica: idrocarburi alifatici. {teacher} disegna le strutture.',
    '{ora}ª ora — {materia}. {teacher} parla di ecologia: catene alimentari e piramidi energetiche.',
    '{ora}ª ora — {materia}. Corpo umano: apparato cardiovascolare. {teacher} usa un modello in plastica.',
    '{ora}ª ora — {materia}. {teacher} introduce i cambiamenti climatici con dati IPCC.',
  ],

  // ─── Alberghiero ─────────────────────────────────────────────────────────────

  secondaLingua: [
    '{ora}ª ora — {materia}. {teacher} insegna i vocaboli del menu in francese. Pronuncia difficile.',
    '{ora}ª ora — {materia}. Role-play: prenotazione di un tavolo in lingua straniera. {teacher} valuta.',
    '{ora}ª ora — {materia}. {teacher} spiega le formule di cortesia e i registri formali.',
    '{ora}ª ora — {materia}. Grammatica: uso degli articoli partitivi in contesto alberghiero.',
    '{ora}ª ora — {materia}. {teacher} propone un dialogo tra cameriere e cliente difficile.',
  ],

  scienzeAlim: [
    '{ora}ª ora — {materia}. {teacher} analizza le etichette nutrizionali di prodotti industriali.',
    '{ora}ª ora — {materia}. Biologia degli alimenti: batteri utili e patogeni in cucina.',
    '{ora}ª ora — {materia}. {teacher} spiega HACCP: punti critici di controllo nella ristorazione.',
    '{ora}ª ora — {materia}. {teacher} parla delle diete speciali: celiachia e allergie alimentari.',
    '{ora}ª ora — {materia}. Conservazione degli alimenti: freddo, caldo, atmosfera modificata.',
  ],

  laboratorioCucina: [
    '{ora}ª ora — {materia}. {teacher} insegna la mise en place del piano di lavoro.',
    '{ora}ª ora — {materia}. Laboratorio pratico: preparazione di un fondo di cottura classico.',
    '{ora}ª ora — {materia}. {teacher} spiega le tecniche di taglio delle verdure. Julienne e brunoise.',
    '{ora}ª ora — {materia}. Prova pratica: realizzare un piatto in 30 minuti. {teacher} cronometra.',
    '{ora}ª ora — {materia}. {teacher} corregge l\'impiattamento: estetica e equilibrio visivo.',
    '{ora}ª ora — {materia}. Preparazione di un dessert classico. {teacher} valuta la consistenza.',
  ],

  laboratorioSala: [
    '{ora}ª ora — {materia}. {teacher} spiega la disposizione delle posate nel coperto classico.',
    '{ora}ª ora — {materia}. Role-play: {teacher} fa il cliente difficile e valuta il servizio.',
    '{ora}ª ora — {materia}. {teacher} insegna il servizio al guéridon: filettatura del pesce.',
    '{ora}ª ora — {materia}. Abbinamento cibo-vino: {teacher} presenta le denominazioni principali.',
    '{ora}ª ora — {materia}. {teacher} spiega come gestire un complaint al tavolo con eleganza.',
  ],

  chimicaAlb: [
    '{ora}ª ora — {materia}. {teacher} spiega le reazioni di Maillard nei cibi cotti.',
    '{ora}ª ora — {materia}. Chimica dei lieviti: fermentazione alcolica e lattica a confronto.',
    '{ora}ª ora — {materia}. {teacher} mostra come misurare il pH di alimenti e bevande.',
    '{ora}ª ora — {materia}. Emulsioni e colloidi: {teacher} spiega maionese e beurre blanc con esempi.',
    '{ora}ª ora — {materia}. {teacher} parla di additivi alimentari e loro funzioni.',
  ],

  alimentazione: [
    '{ora}ª ora — {materia}. {teacher} spiega i macro e micronutrienti con la piramide alimentare.',
    '{ora}ª ora — {materia}. Dieta mediterranea: storia e principi scientifici. {teacher} cita gli studi.',
    '{ora}ª ora — {materia}. {teacher} parla di intolleranze e disturbi alimentari in ottica professionale.',
    '{ora}ª ora — {materia}. Confezionamento dei menu per diete speciali. {teacher} dà esempi pratici.',
    '{ora}ª ora — {materia}. {teacher} discute la sostenibilità alimentare: riduzione dello spreco.',
  ],

  enologia: [
    '{ora}ª ora — {materia}. {teacher} spiega le fasi della vinificazione in rosso.',
    '{ora}ª ora — {materia}. Degustazione sensoriale: colore, profumo, gusto. {teacher} guida l\'analisi.',
    '{ora}ª ora — {materia}. {teacher} introduce le denominazioni DOC e DOCG del territorio.',
    '{ora}ª ora — {materia}. Abbinamento regionale: vini italiani e piatti tipici per zona.',
    '{ora}ª ora — {materia}. {teacher} spiega la conservazione del vino: temperatura e umidità.',
  ],

  // ─── Liceo Scientifico ────────────────────────────────────────────────────────

  latino: [
    '{ora}ª ora — {materia}. {teacher} interroga la declinazione dei nomi in -us. Qualcuno non sa.',
    '{ora}ª ora — {materia}. Traduzione di un brano di Cesare. {teacher} suggerisce il contesto storico.',
    '{ora}ª ora — {materia}. {teacher} spiega il congiuntivo latino nei diversi tempi.',
    '{ora}ª ora — {materia}. Virgilio: l\'Eneide, libro IV. {teacher} legge l\'originale e traduce.',
    '{ora}ª ora — {materia}. {teacher} corregge le versioni assegnate. Molti errori nel cum narrativo.',
    '{ora}ª ora — {materia}. {teacher} spiega i verbi deponenti. La classe protesta unanime.',
  ],

  geostoria: [
    '{ora}ª ora — {materia}. {teacher} parla della formazione degli Stati Nazionali europei.',
    '{ora}ª ora — {materia}. Cartografia: {teacher} spiega le proiezioni e i meridiani.',
    '{ora}ª ora — {materia}. {teacher} collega evento storico e territorio fisico con mappe storiche.',
    '{ora}ª ora — {materia}. Roma antica: {teacher} mostra il percorso della Via Appia su cartina.',
    '{ora}ª ora — {materia}. {teacher} introduce la globalizzazione e le sue conseguenze geografiche.',
  ],

  disegnoST: [
    '{ora}ª ora — {materia}. {teacher} spiega l\'Arte Razionalista italiana degli anni \'30.',
    '{ora}ª ora — {materia}. Disegno tecnico: scala di riduzione e rappresentazione in pianta.',
    '{ora}ª ora — {materia}. {teacher} analizza l\'architettura di una villa di Palladio.',
    '{ora}ª ora — {materia}. Esercitazione: rilievo di un ambiente con misure reali.',
    '{ora}ª ora — {materia}. {teacher} spiega l\'evoluzione dell\'architettura moderna dal Bauhaus.',
  ],

  informaticaLiceo: [
    '{ora}ª ora — {materia}. {teacher} introduce gli algoritmi con pseudocodice e diagrammi di flusso.',
    '{ora}ª ora — {materia}. Laboratorio: prime istruzioni in Python. {teacher} guida passo per passo.',
    '{ora}ª ora — {materia}. {teacher} spiega la codifica ASCII e come il testo diventa bit.',
    '{ora}ª ora — {materia}. Esercitazione: problema di sorting con dati reali.',
    '{ora}ª ora — {materia}. {teacher} parla di sicurezza informatica e privacy online.',
  ],

  fisicaAvanzata: [
    '{ora}ª ora — {materia}. {teacher} spiega il campo elettrico con la legge di Coulomb.',
    '{ora}ª ora — {materia}. Laboratorio: misura della resistenza con il multimetro. {teacher} controlla.',
    '{ora}ª ora — {materia}. {teacher} introduce la relativita ristretta: dilatazione del tempo.',
    '{ora}ª ora — {materia}. Meccanica quantistica: il principio di indeterminazione di Heisenberg.',
    '{ora}ª ora — {materia}. {teacher} risolve problemi di circuiti RC alla lavagna.',
    '{ora}ª ora — {materia}. {teacher} spiega l\'induzione elettromagnetica con la legge di Faraday.',
  ],

  chimicaOrg: [
    '{ora}ª ora — {materia}. {teacher} spiega i gruppi funzionali: alcoli, chetoni, aldeidi.',
    '{ora}ª ora — {materia}. Sintesi organica: {teacher} mostra una reazione di Fischer passo per passo.',
    '{ora}ª ora — {materia}. Biochimica: struttura delle proteine e legami peptidici.',
    '{ora}ª ora — {materia}. {teacher} spiega la stereochimica: enantiomeri e diastereomeri.',
    '{ora}ª ora — {materia}. Laboratorio: saggi di riconoscimento dei gruppi funzionali.',
  ],

  laboratorioSci: [
    '{ora}ª ora — {materia}. {teacher} spiega le norme di sicurezza prima di ogni esperimento.',
    '{ora}ª ora — {materia}. Esperimento: titolazione acido-base con indicatore. {teacher} supervisiona.',
    '{ora}ª ora — {materia}. {teacher} mostra come usare microscopio ottico e preparare i vetrini.',
    '{ora}ª ora — {materia}. Analisi di dati sperimentali: calcolo dell\'errore assoluto e relativo.',
    '{ora}ª ora — {materia}. {teacher} guida la stesura della relazione di laboratorio.',
  ],

  // ─── Fallback generico ───────────────────────────────────────────────────────

  _fallback: [
    '{ora}ª ora — {materia}. {teacher} spiega con calma. La lezione procede senza intoppi.',
    '{ora}ª ora — {materia}. {teacher} assegna esercizi dal libro. Ti concentri come puoi.',
    '{ora}ª ora — {materia}. Lezione tranquilla. {teacher} risponde alle domande dei più curiosi.',
    '{ora}ª ora — {materia}. {teacher} ripassa il programma dell\'ultima settimana. Alcuni prendono appunti.',
    '{ora}ª ora — {materia}. Sessione di ripasso. {teacher} parla lentamente. La lezione finisce in orario.',
  ],
}

// ─── resolveTemplate ──────────────────────────────────────────────────────────

/**
 * Sostituisce i placeholder {ora}, {teacher}, {materia} in un template.
 * Se il template è undefined, restituisce una stringa di fallback sicura.
 */
export function resolveTemplate(
  template: string,
  ora: number,
  teacherName: string,
  materia: string
): string {
  return template
    .replace('{ora}', String(ora))
    .replace('{teacher}', teacherName)
    .replace('{materia}', materia)
}

/**
 * Seleziona casualmente un template per la materia indicata.
 * Usa _fallback se la materia non ha template specifici.
 */
export function pickTemplate(subjectKey: string): string {
  const pool = ORDINARY_TEMPLATES[subjectKey] ?? ORDINARY_TEMPLATES['_fallback']
  return pool[Math.floor(Math.random() * pool.length)]
}
