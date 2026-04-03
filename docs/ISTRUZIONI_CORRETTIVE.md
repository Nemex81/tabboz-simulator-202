# 🔧 ISTRUZIONI CORRETTIVE - Tabboz Simulator 2026

## ANOMALIE RISCONTRATE E SOLUZIONI

---

## ❌ ANOMALIA 1: Eventi Amici Non Generati
**Priorità: ALTA**

### Problema Diagnosticato:
La funzione `checkForNewFriend()` viene chiamata SOLO in 3 azioni (Palestra, Disco, Cinema), ma NON nelle altre attività sociali. Inoltre, manca in Shopping Mall dove dovrebbe essere più probabile.

### Soluzione Richiesta:

**STEP 1:** Aggiungi `checkForNewFriend()` alle seguenti funzioni in `App.tsx`:
- `handleLampada()` → dopo il consumeAction, prima di triggerRandomEvent
- `handleShoppingMall()` → dopo il consumeAction, prima di triggerRandomEvent
- `handleMotorino()` → dopo il consumeAction, prima di triggerRandomEvent

**STEP 2:** Aumenta la probabilità base in base alla location:
```typescript
// Modifica in social-system.ts
export const checkNewFriendEvent = (carisma: number, location: string): boolean => {
  let baseChance = 15
  
  // Modificatori per location
  if (location.includes('discoteca')) baseChance = 25
  if (location.includes('palestra')) baseChance = 20
  if (location.includes('centro commerciale')) baseChance = 20
  if (location.includes('cinema')) baseChance = 15
  if (location.includes('motorino')) baseChance = 10
  
  const carismaBonus = Math.floor(carisma / 10)
  const totalChance = baseChance + carismaBonus
  
  console.log(`[FRIEND EVENT] Location: ${location}, Base: ${baseChance}, Carisma Bonus: ${carismaBonus}, Total: ${totalChance}%`)
  
  return randomChance(totalChance)
}
```

**STEP 3:** Verifica chiamata in App.tsx:
```typescript
// Esempio: handlePalestra
announce('Hai pompato FERRO! +10 Muscoli, +5 Figosità, -20 Soldi, +15 Stanchezza')
checkForNewFriend('in palestra')  // ✅ OK
checkForNewRelationship()
triggerRandomEvent()
```

**TEST RICHIESTO:**
- Esegui 10 azioni di palestra consecutive → almeno 1-2 amici dovrebbero apparire
- Controlla console log per vedere percentuali calcolate
- Verifica che `setFriends()` venga chiamato correttamente

---

## ❌ ANOMALIA 2: Pannello Selezione Materia Non Collegato
**Priorità: CRITICA**

### Problema Diagnosticato:
Il componente `SubjectSelectionDialog` ESISTE già nel codebase ma NON è mai importato o utilizzato in `App.tsx`. La funzione `handleStudia()` sceglie una materia casuale invece di aprire il pannello.

### Soluzione Richiesta:

**STEP 1:** Aggiungi stato e import in `App.tsx`:
```typescript
// In cima al file, negli import
import { SubjectSelectionDialog } from '@/components/SubjectSelectionDialog'

// Negli state (dopo gli altri useState)
const [showSubjectSelection, setShowSubjectSelection] = useState(false)
```

**STEP 2:** Sostituisci COMPLETAMENTE la funzione `handleStudia()`:
```typescript
const handleStudia = () => {
  if (gameTime.actionsRemaining === 0) {
    playSound.failure()
    announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
    return
  }
  if (!gameTime.schoolYear.isSchoolPeriod) {
    playSound.failure()
    announce('Non puoi studiare durante le VACANZE ESTIVE! Goditi l\'estate!')
    return
  }
  if (stats.stanchezza > 80) {
    playSound.failure()
    announce('Sei troppo DISTRUTTO per studiare! Riposa!')
    return
  }
  
  // Apri il pannello invece di studiare direttamente
  playSound.buttonClick()
  setShowSubjectSelection(true)
  announce('Pannello selezione materia aperto. Scegli cosa studiare.')
}
```

**STEP 3:** Crea nuova funzione per lo studio effettivo:
```typescript
const handleConfirmStudy = (selectedSubject: string) => {
  playSound.buttonClick()
  
  const hasFriendBonus = getFriendStudyBonus(friends) > 0
  let gradeIncrease = calculateStudyGradeIncrease(stats.intelligenza, hasFriendBonus)
  
  // Se troppo stanco, dimezza il bonus
  if (stats.stanchezza > 80) {
    gradeIncrease = gradeIncrease / 2
    announce('Sei troppo stanco! Il bonus studio è DIMEZZATO!')
  }
  
  const intelligenzaGain = Math.floor(Math.random() * 3) + 1
  
  setGrades((current) => ({
    ...current,
    [selectedSubject]: clampStat(current[selectedSubject] + gradeIncrease, 0, 10)
  }))
  setStats((current) => ({
    ...current,
    stanchezza: clampStat(current.stanchezza + 20),
    coattaggine: clampStat(current.coattaggine - 5),
    intelligenza: clampStat(current.intelligenza + intelligenzaGain)
  }))
  
  consumeAction()
  playSound.statIncrease()
  
  const bonusText = hasFriendBonus ? ' (BONUS AMICO INTELLIGENTE!)' : ''
  const tiredPenalty = stats.stanchezza > 80 ? ' [BONUS DIMEZZATO - TROPPO STANCO]' : ''
  announce(`Hai studiato ${getSubjectDisplayName(selectedSubject)}! +${gradeIncrease.toFixed(1)} al voto, +${intelligenzaGain} Intelligenza${bonusText}${tiredPenalty}, +20 Stanchezza, -5 Coattaggine`)
  
  setShowSubjectSelection(false)
  
  // Interrogazione a sorpresa
  if (shouldTriggerSurpriseQuiz() && gameTime.schoolYear.isSchoolPeriod) {
    const subjects = Object.keys(grades)
    const surpriseSubject = subjects[Math.floor(Math.random() * subjects.length)]
    const quizResult = calculateSurpriseQuizGrade(grades[surpriseSubject], stats)
    setGrades((current) => ({
      ...current,
      [surpriseSubject]: quizResult.newGrade
    }))
    playSound.eventTrigger()
    announce(`${quizResult.message} in ${getSubjectDisplayName(surpriseSubject)}!`)
  }
}
```

**STEP 4:** Aggiungi il componente nel JSX, PRIMA della chiusura di `</main>`:
```typescript
<SubjectSelectionDialog
  open={showSubjectSelection}
  onClose={() => setShowSubjectSelection(false)}
  grades={grades}
  onSelectSubject={handleConfirmStudy}
  stanchezza={stats.stanchezza}
/>
```

**STEP 5:** Aggiorna useEffect keyboard per Ctrl+5:
```typescript
// Nel useEffect keyboard, sostituisci la riga:
case '5': handleStudia(); break  // Questo ora apre il pannello, non studia direttamente
```

**TEST RICHIESTO:**
- Premi "Studia" o Ctrl+5 → deve aprire il pannello
- Seleziona una materia → deve evidenziarsi in azzurro
- Premi Enter o "Conferma Studio" → deve studiare quella materia specifica
- Premi Escape → deve chiudere SENZA consumare azione
- Verifica che il voto della materia scelta aumenti correttamente

---

## ❌ ANOMALIA 3: Gestione Soldi Inconsistente
**Priorità: ALTA**

### Problema Diagnosticato:
Alcune azioni controllano `stats.soldi < costo` PRIMA dell'azione, ma altre no. Inoltre, `clampStat(current.soldi - costo, 0, 1000)` impedisce valori negativi MA permette di spendere più del disponibile senza feedback corretto.

### Soluzione Richiesta:

**STEP 1:** Crea funzione helper in `game-utils.ts`:
```typescript
export const canAfford = (currentMoney: number, cost: number): boolean => {
  return currentMoney >= cost
}

export const spendMoney = (currentMoney: number, cost: number): number => {
  if (currentMoney < cost) {
    console.warn(`[MONEY] Tentativo di spendere ${cost}€ con solo ${currentMoney}€ disponibili!`)
    return currentMoney  // Non spendere nulla
  }
  return Math.max(0, currentMoney - cost)
}
```

**STEP 2:** Audita TUTTE le funzioni che spendono soldi in `App.tsx`:

**Lista completa funzioni da controllare:**
- `handlePalestra()` → 20€
- `handleLampada()` → 30€
- `handleMotorino()` → 50€
- `handleCorrompi()` → 100€
- `handleDisco()` → 60€
- `handleCinema()` → 40€ (o 80€ se incontra ragazza)
- `handleShoppingMall()` → 100€
- `handleProvarciConAtipa()` → 80€
- `handleTryRelationship()` → 80€
- Eventi casuali (Metallari, Polizia, etc.)

**STEP 3:** Pattern standard da applicare:
```typescript
// PRIMA (ERRATO):
setStats((current) => ({
  ...current,
  soldi: clampStat(current.soldi - 100, 0, 1000)
}))

// DOPO (CORRETTO):
setStats((current) => ({
  ...current,
  soldi: spendMoney(current.soldi, 100)
}))
```

**STEP 4:** Esempio completo di refactoring:
```typescript
// handlePalestra - PRIMA
const handlePalestra = () => {
  if (gameTime.actionsRemaining === 0) {
    playSound.failure()
    announce('Nessuna azione rimasta!')
    return
  }
  if (stats.soldi < 20) {  // ✅ Controllo presente
    playSound.failure()
    announce('Non hai abbastanza GRANA per la palestra! Servono 20€')
    return
  }
  setStats((current) => ({
    ...current,
    muscoli: clampStat(current.muscoli + 10),
    soldi: clampStat(current.soldi - 20, 0, 1000)  // ❌ Potenziale bug
  }))
}

// handlePalestra - DOPO
const handlePalestra = () => {
  const PALESTRA_COST = 20
  
  if (gameTime.actionsRemaining === 0) {
    playSound.failure()
    announce('Nessuna azione rimasta!')
    return
  }
  if (!canAfford(stats.soldi, PALESTRA_COST)) {  // ✅ Usa helper
    playSound.failure()
    announce(`Non hai abbastanza GRANA per la palestra! Servono ${PALESTRA_COST}€`)
    return
  }
  setStats((current) => ({
    ...current,
    muscoli: clampStat(current.muscoli + 10),
    figosita: clampStat(current.figosita + 5),
    soldi: spendMoney(current.soldi, PALESTRA_COST),  // ✅ Spesa sicura
    stanchezza: clampStat(current.stanchezza + 15)
  }))
  consumeAction()
  announce(`Hai pompato FERRO! +10 Muscoli, +5 Figosità, -${PALESTRA_COST}€, +15 Stanchezza`)
  checkForNewFriend('in palestra')
  checkForNewRelationship()
  triggerRandomEvent()
}
```

**STEP 5:** Crea costanti per tutti i costi in cima ad App.tsx:
```typescript
// Costanti costi azioni
const COSTS = {
  PALESTRA: 20,
  LAMPADA: 30,
  MOTORINO: 50,
  LAVORO_MIN_MUSCOLI: 40,
  STUDIO_CORROMPI: 100,
  DISCO: 60,
  CINEMA: 40,
  CINEMA_CON_RAGAZZA: 80,
  SHOPPING: 100,
  RIMORCHIO: 80,
  MAZZETTA_POLIZIA: 50
} as const
```

**TEST RICHIESTO:**
- Imposta soldi a 25€
- Prova Palestra (20€) → deve funzionare, rimangono 5€
- Prova Lampada (30€) → deve fallire con messaggio
- Prova Palestra ancora → deve fallire (servono 20€, ne hai 5€)
- Controlla console per warning se tentativo di spendere troppo

---

## ❌ ANOMALIA 4: Difficoltà Verifiche Non Implementata
**Priorità: MEDIA

### Problema Diagnosticato:
Il tipo `ScheduledExam` NON ha campo `difficulty`. Le verifiche non hanno livelli di difficoltà che influenzano il guadagno di voto.

### Soluzione Richiesta:

**STEP 1:** Aggiorna il tipo in `types.ts`:
```typescript
export type ExamDifficulty = 'facile' | 'media' | 'difficile' | 'impossibile'

export interface ScheduledExam {
  subject: string
  daysUntil: number
  isPrepared: boolean
  difficulty: ExamDifficulty  // ← NUOVO CAMPO
}
```

**STEP 2:** Aggiorna `generateScheduledExam` in `exam-system.ts`:
```typescript
export const generateScheduledExam = (subjects: string[]): ScheduledExam => {
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
  const daysUntil = Math.floor(Math.random() * 4) + 2
  
  // Genera difficoltà casuale con distribuzione realistica
  const roll = Math.random() * 100
  let difficulty: ExamDifficulty
  
  if (roll < 40) difficulty = 'facile'       // 40% facile
  else if (roll < 75) difficulty = 'media'   // 35% media
  else if (roll < 95) difficulty = 'difficile' // 20% difficile
  else difficulty = 'impossibile'            // 5% impossibile
  
  return {
    subject: randomSubject,
    daysUntil,
    isPrepared: false,
    difficulty
  }
}
```

**STEP 3:** Aggiorna `calculateExamGrade` per usare difficulty:
```typescript
export const calculateExamGrade = (
  currentGrade: number,
  intelligenza: number,
  isPrepared: boolean,
  media: number,
  difficulty: ExamDifficulty  // ← NUOVO PARAMETRO
): number => {
  // Moltiplicatori basati su difficoltà
  const difficultyMultipliers = {
    facile: 1.5,      // +50% guadagno
    media: 1.0,       // guadagno normale
    difficile: 0.7,   // -30% guadagno
    impossibile: 0.4  // -60% guadagno
  }
  
  const difficultyMult = difficultyMultipliers[difficulty]
  
  let gradeChange = 0
  
  if (isPrepared) {
    const intelligenceMultiplier = 1 + (intelligenza / 100)
    const baseGain = 2 * intelligenceMultiplier
    gradeChange = Number((baseGain * difficultyMult).toFixed(1))
  } else {
    // Senza preparazione, difficoltà influisce MOLTO di più
    const surpriseChance = ((media + intelligenza) / 2) * difficultyMult
    
    if (surpriseChance > 60) {
      gradeChange = 0.5 * difficultyMult
    } else if (surpriseChance > 40) {
      gradeChange = 0
    } else {
      gradeChange = -0.5 / difficultyMult  // Perde DI PIÙ se difficile
    }
  }
  
  const newGrade = clampStat(currentGrade + gradeChange, 0, 10)
  return Number(newGrade.toFixed(1))
}
```

**STEP 4:** Aggiorna chiamata in `App.tsx` (avanzamento giorno):
```typescript
// Nella funzione advanceToNextDay, quando si gestisce l'esame
if (newDaysUntil <= 0) {
  const examGrade = calculateExamGrade(
    grades[exam.subject] || 6,
    stats.intelligenza,
    exam.isPrepared,
    currentMedia,
    exam.difficulty  // ← PASSA LA DIFFICOLTÀ
  )
  setGrades((g) => ({
    ...g,
    [exam.subject]: examGrade
  }))
  
  const difficultyText = getDifficultyText(exam.difficulty)
  const resultText = exam.isPrepared 
    ? `VERIFICA ${difficultyText} di ${getSubjectDisplayName(exam.subject)}! Eri PREPARATO! Voto: ${examGrade.toFixed(1)}`
    : `VERIFICA ${difficultyText} di ${getSubjectDisplayName(exam.subject)}! Non eri preparato... Voto: ${examGrade.toFixed(1)}`
  announce(resultText)
  return null
}
```

**STEP 5:** Aggiorna UI in `ExamsPanel.tsx` per mostrare difficoltà:
```typescript
// Aggiungi helper per emoji difficoltà
const getDifficultyEmoji = (difficulty: ExamDifficulty): string => {
  switch (difficulty) {
    case 'facile': return '😊'
    case 'media': return '😐'
    case 'difficile': return '😰'
    case 'impossibile': return '💀'
    default: return '❓'
  }
}

const getDifficultyColor = (difficulty: ExamDifficulty): string => {
  switch (difficulty) {
    case 'facile': return 'text-primary'
    case 'media': return 'text-accent'
    case 'difficile': return 'text-destructive'
    case 'impossibile': return 'text-destructive font-black'
    default: return 'text-muted-foreground'
  }
}

// Nel render dell'esame:
<div className="flex items-center justify-between mb-2">
  <span className="text-sm font-semibold uppercase">
    {getSubjectDisplayName(exam.subject)}
  </span>
  <span className={`text-xs font-bold ${getDifficultyColor(exam.difficulty)}`}>
    {getDifficultyEmoji(exam.difficulty)} {exam.difficulty.toUpperCase()}
  </span>
</div>
```

**STEP 6:** Crea helper in `exam-system.ts`:
```typescript
export const getDifficultyText = (difficulty: ExamDifficulty): string => {
  switch (difficulty) {
    case 'facile': return 'FACILE'
    case 'media': return 'MEDIA'
    case 'difficile': return 'DIFFICILE'
    case 'impossibile': return 'IMPOSSIBILE'
    default: return 'NORMALE'
  }
}

export const getDifficultyDescription = (difficulty: ExamDifficulty): string => {
  switch (difficulty) {
    case 'facile': 
      return 'Verifica semplice! Se preparato, guadagni +50% voto!'
    case 'media': 
      return 'Verifica standard. Guadagno normale.'
    case 'difficile': 
      return 'Verifica tosta! Guadagno -30%, ma se sbagli perdi poco.'
    case 'impossibile': 
      return 'VERIFICA DA INCUBO! Guadagno -60%, ma se non sei preparato sei FINITO!'
    default: 
      return ''
  }
}
```

**TEST RICHIESTO:**
- Genera 10 verifiche → almeno 1 facile, 1 difficile, 1 impossibile
- Studia per verifica FACILE → voto finale deve salire MOLTO
- NON studiare per verifica IMPOSSIBILE → voto deve calare DRASTICAMENTE
- Verifica che UI mostri emoji e colore corretto
- Controlla che tooltip/descrizione mostri moltiplicatore

---

## 📋 CHECKLIST FINALE

Dopo aver implementato tutte le correzioni, eseguire:

### Test Funzionali:
- [ ] Fare 5 azioni sociali diverse → almeno 1 amico appare
- [ ] Premere Studia → si apre pannello materie
- [ ] Selezionare materia → voto di QUELLA materia aumenta
- [ ] Tentare azione con 10€ che costa 50€ → DEVE fallire con messaggio
- [ ] Verificare che una verifica FACILE dia +3 voto se preparato
- [ ] Verificare che una verifica IMPOSSIBILE dia -2 voto se NON preparato

### Test Accessibilità:
- [ ] Escape chiude pannello materie SENZA consumare azione
- [ ] Tab naviga dentro il pannello materie
- [ ] Enter conferma materia selezionata
- [ ] aria-live annuncia nuovo amico
- [ ] aria-live annuncia difficoltà verifica

### Test Edge Cases:
- [ ] Soldi = 19€, tentare Palestra (20€) → DEVE fallire
- [ ] Stanchezza = 85, studiare materia → bonus DIMEZZATO (messaggio chiaro)
- [ ] 0 azioni rimaste, tentare qualsiasi cosa → DEVE bloccare
- [ ] Chiudere pannello materie con X → azioni rimangono invariate

### Console Log da Verificare:
- [ ] Nessun warning `[MONEY] Tentativo di spendere...`
- [ ] Log `[FRIEND EVENT]` mostra percentuali corrette
- [ ] Nessun errore TypeScript su `difficulty`

---

## 🚀 ORDINE DI IMPLEMENTAZIONE CONSIGLIATO

1. **Anomalia 3** (Soldi) - Crea le funzioni helper prima di tutto
2. **Anomalia 2** (Pannello Materie) - Richiede modifiche strutturali
3. **Anomalia 4** (Difficoltà) - Espande sistema esistente
4. **Anomalia 1** (Amici) - Semplice aggiunta chiamate funzione

---

## 📝 NOTE AGGIUNTIVE

- Tutte le modifiche devono mantenere il tono tamarro anni '90
- Ogni messaggio deve essere chiaro e MAIUSCOLO per enfasi
- Usare emoji con parsimonia ma efficacia (💀 per impossibile, 😊 per facile)
- Aggiungere console.log TEMPORANEI durante debug, poi rimuoverli
- Mantenere aria-live per accessibilità

---

**Data creazione:** ${new Date().toLocaleDateString('it-IT')}
**Versione:** 1.0
**Stato:** PRONTO PER IMPLEMENTAZIONE
