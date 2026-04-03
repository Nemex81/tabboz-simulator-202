# 🎯 PROMPT RAPIDO PER COPILOT - Bug Fix Tabboz Simulator

Copia e incolla questo prompt in GitHub Copilot per implementare tutte le correzioni in modo efficiente.

---

## PROMPT DA COPIARE:

```
Analizza e implementa queste 4 correzioni critiche per Tabboz Simulator 2026:

## 1. FIX EVENTI AMICI
Gli eventi che generano nuovi amici non funzionano correttamente.

SOLUZIONE:
- Aggiungi `checkForNewFriend('in centro commerciale')` in handleShoppingMall dopo consumeAction
- Aggiungi `checkForNewFriend('con il motorino')` in handleMotorino dopo consumeAction  
- Aggiungi `checkForNewFriend('alla lampada')` in handleLampada dopo consumeAction
- Modifica checkNewFriendEvent in social-system.ts per avere probabilità diverse per location:
  * discoteca: 25%, palestra: 20%, centro commerciale: 20%, cinema: 15%, motorino: 10%
- Aggiungi console.log per debug: "Location: X, Probabilità: Y%"

## 2. FIX PANNELLO SELEZIONE MATERIA
Il pulsante Studia non apre il pannello per scegliere la materia.

SOLUZIONE:
- Import SubjectSelectionDialog (già esiste in components/)
- Aggiungi stato: const [showSubjectSelection, setShowSubjectSelection] = useState(false)
- Modifica handleStudia per aprire il pannello invece di studiare direttamente:
  setShowSubjectSelection(true)
- Crea handleConfirmStudy(selectedSubject: string) che:
  * Applica bonus studio SOLO alla materia selezionata
  * Se stanchezza > 80, dimezza il bonus e mostra warning
  * Consuma azione SOLO dopo conferma
  * Chiude il pannello
- Aggiungi componente prima di </main>:
  <SubjectSelectionDialog open={showSubjectSelection} onClose={() => setShowSubjectSelection(false)} grades={grades} onSelectSubject={handleConfirmStudy} stanchezza={stats.stanchezza} />
- Escape deve chiudere SENZA consumare azione

## 3. FIX GESTIONE SOLDI
Alcune azioni permettono di spendere più soldi di quelli disponibili.

SOLUZIONE:
- Crea in game-utils.ts:
  export const canAfford = (money: number, cost: number) => money >= cost
  export const spendMoney = (money: number, cost: number) => money >= cost ? money - cost : money
- Crea costanti in App.tsx:
  const COSTS = { PALESTRA: 20, LAMPADA: 30, MOTORINO: 50, CORROMPI: 100, DISCO: 60, CINEMA: 40, SHOPPING: 100, RIMORCHIO: 80 }
- Sostituisci in TUTTE le funzioni che spendono soldi:
  * PRIMA: if (stats.soldi < 20) return
  * DOPO: if (!canAfford(stats.soldi, COSTS.PALESTRA)) return
  * PRIMA: soldi: clampStat(current.soldi - 20, 0, 1000)
  * DOPO: soldi: spendMoney(current.soldi, COSTS.PALESTRA)
- Applica a: handlePalestra, handleLampada, handleMotorino, handleCorrompi, handleDisco, handleCinema, handleShoppingMall, handleProvarciConAtipa, handleTryRelationship

## 4. AGGIUNGI DIFFICOLTÀ VERIFICHE
Le verifiche non hanno livelli di difficoltà.

SOLUZIONE:
- Aggiungi in types.ts:
  export type ExamDifficulty = 'facile' | 'media' | 'difficile' | 'impossibile'
  interface ScheduledExam { ..., difficulty: ExamDifficulty }
- Modifica generateScheduledExam in exam-system.ts:
  * Genera difficulty random: 40% facile, 35% media, 20% difficile, 5% impossibile
- Modifica calculateExamGrade per accettare difficulty e applicare moltiplicatori:
  * facile: 1.5x, media: 1.0x, difficile: 0.7x, impossibile: 0.4x
- Aggiungi in exam-system.ts:
  export const getDifficultyText = (d: ExamDifficulty) => d.toUpperCase()
- Aggiorna chiamata in App.tsx advanceToNextDay passando exam.difficulty
- In ExamsPanel.tsx mostra emoji: facile 😊, media 😐, difficile 😰, impossibile 💀
- Mostra colore: facile=primary, media=accent, difficile/impossibile=destructive

## TESTING OBBLIGATORIO:
1. Fai 5 azioni sociali → deve apparire almeno 1 amico
2. Premi Studia → deve aprire pannello materie
3. Seleziona materia e conferma → voto di QUELLA materia deve salire
4. Con 10€, prova Palestra (20€) → DEVE bloccare con messaggio
5. Genera verifiche → devono avere difficoltà variabili con emoji
6. Verifica FACILE preparata → voto deve salire MOLTO
7. Verifica IMPOSSIBILE non preparata → voto deve scendere MOLTO

Implementa nell'ordine: 3, 2, 4, 1.
Mantieni tono tamarro anni '90 in tutti i messaggi.
Usa aria-live per annunci accessibilità.
```

---

## NOTE PER L'UTENTE:

1. **Copia il testo nel box** sopra (tutto quello dentro i ``` ```)
2. **Incolla in GitHub Copilot Chat** o nella finestra di Copilot
3. Copilot implementerà le modifiche nell'ordine corretto
4. Dopo l'implementazione, **testa ogni fix** usando la sezione TESTING OBBLIGATORIO

Se Copilot chiede dettagli su un punto specifico, consulta il file `ISTRUZIONI_CORRETTIVE.md` per la versione estesa.

---

## ALTERNATIVE - PROMPT SUPER COMPATTO (se Copilot ha limiti di lunghezza):

```
Fix 4 bug Tabboz Simulator:
1. Amici: aggiungi checkForNewFriend() in handleShoppingMall, handleMotorino, handleLampada
2. Studio: handleStudia deve aprire SubjectSelectionDialog (già esiste), non studiare random. Import e usa.
3. Soldi: crea canAfford/spendMoney in game-utils, sostituisci clampStat(soldi-X) con spendMoney() ovunque
4. Verifiche: aggiungi campo difficulty: 'facile'|'media'|'difficile'|'impossibile' a ScheduledExam, genera random, applica moltiplicatori 1.5x/1.0x/0.7x/0.4x in calculateExamGrade

Test: amici appaiono, pannello materie funziona, non puoi spendere più del disponibile, verifiche hanno difficoltà.
```
