# INTEGRATION GUIDE — Come completare l'integrazione
## Guida passo-passo per integrare tutti i nuovi sistemi in App.tsx

Questa guida spiega come completare l'integrazione di tutti i componenti creati durante il refactoring.

---

## STEP 1: Importare i nuovi componenti

Aggiungi questi import all'inizio di App.tsx (dopo gli import esistenti):

```typescript
import { SubjectSelectionDialog } from '@/components/SubjectSelectionDialog'
import { GirlfriendPanel } from '@/components/GirlfriendPanel'
import { EnhancedFriendsPanel } from '@/components/EnhancedFriendsPanel'
import { 
  EnhancedFriend, 
  generateRandomEnhancedFriend,
  applyFriendActionEffects,
  checkFriendshipLost,
  checkBestFriend
} from '@/lib/enhanced-friend-system'
import { 
  Ragazza,
  generateRandomGirlfriend,
  calculateInteresseGain
} from '@/lib/girlfriend-system'
import { 
  BetInfo,
  generateStreetRace,
  calculateBetAmount
} from '@/lib/bet-system'
```

---

## STEP 2: Aggiungere nuovi stati

Dopo gli stati esistenti (circa linea 100-125), aggiungi:

```typescript
// Enhanced Friends System
const [rawEnhancedFriends, setRawEnhancedFriends] = useKV<EnhancedFriend[]>('tabboz-enhanced-friends', [])
const enhancedFriends = validateEnhancedFriends(rawEnhancedFriends) // Devi creare questa funzione in data-validation.ts
const setEnhancedFriends = setRawEnhancedFriends

// Girlfriend System
const [rawGirlfriend, setRawGirlfriend] = useKV<Ragazza | null>('tabboz-girlfriend', null)
const girlfriend = rawGirlfriend // Aggiungi validazione se necessario
const setGirlfriend = setRawGirlfriend

// UI State
const [showSubjectSelection, setShowSubjectSelection] = useState(false)
const [showFriendsDialog, setShowFriendsDialog] = useState(false)
const [showGirlfriendDialog, setShowGirlfriendDialog] = useState(false)
const [currentBetInfo, setCurrentBetInfo] = useState<BetInfo | null>(null)
```

---

## STEP 3: Creare handler per il pannello materie

Aggiungi questa funzione (circa linea 700, vicino a handleStudia):

```typescript
const handleSubjectStudy = (subject: string) => {
  setShowSubjectSelection(false)
  
  if (gameTime.actionsRemaining === 0) {
    playSound.failure()
    announce('Nessuna azione rimasta!')
    return
  }
  if (!gameTime.schoolYear.isSchoolPeriod) {
    playSound.failure()
    announce('Non puoi studiare durante le VACANZE ESTIVE!')
    return
  }
  if (stats.stanchezza > 80) {
    playSound.failure()
    announce('Sei troppo DISTRUTTO per studiare! Riposa!')
    return
  }

  playSound.buttonClick()
  
  // Calcola bonus da amici secchioni
  const hasFriendBonus = enhancedFriends.some(f => 
    f.type === 'secchione' && (f.intelligenza || 0) > 60
  )
  
  // Calcola incremento base
  let gradeIncrease = calculateStudyGradeIncrease(stats.intelligenza, hasFriendBonus)
  
  // Dimezza se troppo stanco
  if (stats.stanchezza > 80) {
    gradeIncrease = gradeIncrease / 2
    announce('⚠️ SEI TROPPO STANCO! Bonus studio DIMEZZATO!')
  }
  
  // Aumento intelligenza
  const intelligenzaGain = Math.floor(Math.random() * 3) + 1
  
  // Aggiorna voti e stats
  setGrades((current) => ({
    ...current,
    [subject]: clampStat(current[subject] + gradeIncrease, 0, 10)
  }))
  
  setStats((current) => ({
    ...current,
    stanchezza: clampStat(current.stanchezza + 20),
    coattaggine: clampStat(current.coattaggine - 5),
    intelligenza: clampStat(current.intelligenza + intelligenzaGain)
  }))
  
  consumeAction()
  playSound.statIncrease()
  
  const bonusText = hasFriendBonus ? ' (BONUS AMICO SECCHIONE!)' : ''
  announce(
    `Hai studiato ${getSubjectDisplayName(subject)}! ` +
    `+${gradeIncrease.toFixed(1)} al voto, ` +
    `+${intelligenzaGain} Intelligenza${bonusText}, ` +
    `+20 Stanchezza, -5 Coattaggine`
  )
  
  // Check interrogazione a sorpresa
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

---

## STEP 4: Modificare handleStudia per aprire il pannello

Sostituisci la funzione handleStudia esistente con:

```typescript
const handleStudia = () => {
  if (gameTime.actionsRemaining === 0) {
    playSound.failure()
    announce('Nessuna azione rimasta!')
    return
  }
  if (!gameTime.schoolYear.isSchoolPeriod) {
    playSound.failure()
    announce('Non puoi studiare durante le VACANZE ESTIVE!')
    return
  }
  if (stats.stanchezza > 80) {
    playSound.failure()
    announce('Sei troppo DISTRUTTO per studiare! Riposa!')
    return
  }
  
  // Apri il pannello di selezione materia
  setShowSubjectSelection(true)
  announce('Pannello selezione materia aperto. Scegli una materia da studiare.')
}
```

---

## STEP 5: Handler per azioni amici

Aggiungi questa funzione (circa linea 800):

```typescript
const handleFriendAction = (friendId: string, actionId: string) => {
  const friend = enhancedFriends.find(f => f.id === friendId)
  if (!friend) return
  
  const action = FRIEND_ACTIONS.find(a => a.id === actionId)
  if (!action) return
  
  // Verifica requisiti
  const check = action.requirements(stats, friend)
  if (!check.canDo) {
    playSound.failure()
    announce(check.reason || 'Azione non disponibile')
    return
  }
  
  // Verifica azioni rimanenti
  if (gameTime.actionsRemaining < action.cost) {
    playSound.failure()
    announce('Nessuna azione rimasta!')
    return
  }
  
  // Applica effetti
  const result = applyFriendActionEffects(actionId, stats, friend)
  
  // Aggiorna stats
  Object.entries(result.newStats).forEach(([key, value]) => {
    setStats((current) => ({
      ...current,
      [key as keyof GameStats]: clampStat(value as number, 
        key === 'soldi' ? 0 : undefined, 
        key === 'soldi' ? 1000 : undefined
      )
    }))
  })
  
  // Se è studio con secchione, aumenta anche media
  if (actionId === 'studia') {
    const subjects = Object.keys(grades)
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    setGrades((current) => ({
      ...current,
      [randomSubject]: clampStat(current[randomSubject] + 0.3, 0, 10)
    }))
  }
  
  // Aggiorna affinità
  setEnhancedFriends((current) =>
    current.map(f =>
      f.id === friendId
        ? { ...f, affinita: result.newAffinita }
        : f
    )
  )
  
  // Consuma azione se necessario
  if (action.cost > 0) {
    consumeAction()
  }
  
  // Annuncia risultato
  playSound.success()
  announce(result.message)
  
  // Check se amicizia è finita
  if (checkFriendshipLost(result.newAffinita)) {
    setTimeout(() => {
      setEnhancedFriends((current) => current.filter(f => f.id !== friendId))
      playSound.gameOver()
      announce(`L'amicizia con ${friend.name} è FINITA! Non è più nella tua rubrica.`)
    }, 1000)
  }
  
  // Check se è diventato migliore amico
  if (checkBestFriend(result.newAffinita) && !checkBestFriend(friend.affinita)) {
    setTimeout(() => {
      playSound.bigWin()
      announce(
        `${friend.name} è ora il tuo MIGLIORE AMICO! ` +
        `Sbloccato: Copertura Genitori!`
      )
    }, 500)
  }
}
```

---

## STEP 6: Handler per azioni girlfriend

Aggiungi questa funzione:

```typescript
const handleGirlfriendAction = (action: string) => {
  if (!girlfriend) return
  
  if (gameTime.actionsRemaining === 0) {
    playSound.failure()
    announce('Nessuna azione rimasta!')
    return
  }
  
  let interesseGain = 0
  let costaSoldi = 0
  let message = ''
  
  switch (action) {
    case 'messaggio':
      interesseGain = calculateInteresseGain('messaggio', stats, girlfriend)
      message = `Hai mandato un messaggio a ${girlfriend.nome}! +${interesseGain} Interesse`
      break
      
    case 'cinema':
      if (girlfriend.interessePerTe < 30) {
        playSound.failure()
        announce('Interesse troppo basso! Minimo 30.')
        return
      }
      if (stats.soldi < 40) {
        playSound.failure()
        announce('Servono 40€!')
        return
      }
      costaSoldi = 40
      interesseGain = calculateInteresseGain('cinema', stats, girlfriend)
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 5)
      }))
      message = `Hai portato ${girlfriend.nome} al cinema! +${interesseGain} Interesse, +5 Figosità, -40€`
      break
      
    case 'motorino':
      if (girlfriend.interessePerTe < 40) {
        playSound.failure()
        announce('Interesse troppo basso! Minimo 40.')
        return
      }
      if (stats.coattaggine < 50) {
        playSound.failure()
        announce('Servono almeno 50 Coattaggine!')
        return
      }
      if (stats.soldi < 20) {
        playSound.failure()
        announce('Servono 20€!')
        return
      }
      costaSoldi = 20
      interesseGain = calculateInteresseGain('motorino', stats, girlfriend)
      message = `Hai portato ${girlfriend.nome} col motorino! +${interesseGain} Interesse, -20€`
      break
      
    case 'compiti':
      if (girlfriend.personalita !== 'secchiona') {
        playSound.failure()
        announce('Funziona solo con ragazze secchione!')
        return
      }
      if (stats.intelligenza < 40) {
        playSound.failure()
        announce('Servono almeno 40 Intelligenza!')
        return
      }
      interesseGain = calculateInteresseGain('compiti', stats, girlfriend)
      const subjects = Object.keys(grades)
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
      setGrades((current) => ({
        ...current,
        [randomSubject]: clampStat(current[randomSubject] + 0.3, 0, 10)
      }))
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine - 10)
      }))
      message = `Hai fatto i compiti a ${girlfriend.nome}! +${interesseGain} Interesse, +0.3 Media, -10 Coattaggine`
      break
      
    case 'dichiarati':
      if (girlfriend.interessePerTe < 70) {
        playSound.failure()
        announce('Interesse troppo basso! Minimo 70.')
        return
      }
      setGirlfriend((current) => current ? { ...current, interessePerTe: 100 } : null)
      playSound.bigWin()
      announce(
        `${girlfriend.nome} ha detto SÌ! Siete FIDANZATI UFFICIALMENTE! ` +
        `+30 Figosità, +20 Carisma`
      )
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 30),
        carisma: clampStat(current.carisma + 20)
      }))
      consumeAction()
      return
  }
  
  // Applica cambiamenti
  setGirlfriend((current) => 
    current 
      ? { ...current, interessePerTe: Math.min(100, current.interessePerTe + interesseGain) }
      : null
  )
  
  if (costaSoldi > 0) {
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - costaSoldi, 0, 1000)
    }))
  }
  
  consumeAction()
  playSound.success()
  announce(message)
}

const handleBreakup = () => {
  if (!girlfriend) return
  
  const name = girlfriend.nome
  setGirlfriend(null)
  playSound.failure()
  announce(`Hai lasciato ${name}. Sei di nuovo single.`)
}
```

---

## STEP 7: Modificare eventi casuali per aggiungere nuovi amici e ragazze

Nelle funzioni handlePalestra, handleDisco, handleCinema, handleShoppingMall, DOPO `triggerRandomEvent()`, aggiungi:

```typescript
// Check nuovi amici
if (enhancedFriends.length < 4 && randomChance(15 + Math.floor(stats.carisma / 10))) {
  const newFriend = generateRandomEnhancedFriend()
  setEnhancedFriends((current) => [...current, newFriend])
  playSound.eventTrigger()
  announce(
    `Hai conosciuto ${newFriend.name}! Nuovo amico aggiunto! ` +
    `(${getFriendTypeDescription(newFriend.type)})`
  )
}

// Check nuova ragazza (solo se non ne hai già una)
if (!girlfriend && randomChance(20)) {
  const newGirl = generateRandomGirlfriend()
  setGirlfriend(newGirl)
  playSound.eventTrigger()
  announce(
    `Hai notato ${newGirl.nome} ${newGirl.cognome}! ` +
    `${newGirl.eta} anni, ${newGirl.aspetto}. Vuoi provarci?`
  )
}
```

---

## STEP 8: Modificare evento street race per usare bet system

Nella funzione che gestisce lo street race, PRIMA di mostrare il dialog, aggiungi:

```typescript
const betInfo = generateStreetRace(stats.reputazione)
setCurrentBetInfo(betInfo)
setRaceWinChance(Math.round(
  Math.min(85, Math.max(15, 
    (stats.coattaggine * 0.5) + 
    (stats.figosita * 0.3) + 
    (stats.muscoli * 0.2) +
    reputationModifier.positiveOutcomeBonus
  ))
))
```

E nel dialog, mostra:
```typescript
<p>Scommessa: {currentBetInfo.importo}€</p>
<p>Vincita potenziale: {currentBetInfo.vincitaPotenziale}€</p>
<p>{currentBetInfo.descrizione}</p>
```

Quando vince/perde, usa `currentBetInfo.importo` e `currentBetInfo.vincitaPotenziale` invece dei valori fissi.

---

## STEP 9: Aggiungere keyboard shortcuts

Nel useEffect handleKeyPress, aggiungi questi case:

```typescript
case 'f': 
  if (!e.shiftKey) {
    setShowFriendsDialog(true)
    announce('Pannello amici aperto')
  }
  break
case 't': 
  if (!e.shiftKey) {
    setShowGirlfriendDialog(true)
    announce('Scheda ragazza aperta')
  }
  break
```

E modifica il case '5':

```typescript
case '5': 
  handleStudia()  // Ora apre il pannello invece di studiare direttamente
  break
```

---

## STEP 10: Aggiungere componenti al JSX

PRIMA del chiusura tag `</main>`, aggiungi:

```typescript
<SubjectSelectionDialog
  open={showSubjectSelection}
  onClose={() => setShowSubjectSelection(false)}
  grades={grades}
  onSelectSubject={handleSubjectStudy}
  stanchezza={stats.stanchezza}
/>

{/* Dialog amici separato se vuoi, oppure integra nel tab Amici */}

{/* GirlfriendPanel va nel TabsContent "social" o "friends" */}
```

E nel TabsContent appropriato, sostituisci FriendsPanel con EnhancedFriendsPanel:

```typescript
<TabsContent value="friends" className="space-y-6 mt-6">
  <EnhancedFriendsPanel
    friends={enhancedFriends}
    stats={stats}
    actionsRemaining={gameTime.actionsRemaining}
    onFriendAction={handleFriendAction}
  />
  
  <GirlfriendPanel
    girlfriend={girlfriend}
    stats={stats}
    actionsRemaining={gameTime.actionsRemaining}
    onAction={handleGirlfriendAction}
    onBreakup={handleBreakup}
  />
</TabsContent>
```

---

## STEP 11: Creare funzione di validazione

In `/src/lib/data-validation.ts`, aggiungi:

```typescript
export const validateEnhancedFriends = (friends: any[]): EnhancedFriend[] => {
  if (!Array.isArray(friends)) return []
  
  return friends.filter(f => 
    f && 
    typeof f.id === 'string' &&
    typeof f.name === 'string' &&
    ['coatto', 'secchione', 'sportivo', 'ribelle'].includes(f.type) &&
    typeof f.affinita === 'number'
  )
}
```

---

## COMPLETAMENTO

Dopo aver seguito tutti questi step:

1. Verifica che non ci siano errori TypeScript
2. Testa il flusso: Ctrl+5 → Seleziona materia → Conferma → Vedi voto salire
3. Testa amici: Vai in palestra → Nuovo amico appare → Apri con Ctrl+F → Fai azioni
4. Testa girlfriend: Vai in disco → Nuova ragazza → Apri con Ctrl+T → Fai azioni
5. Testa street race con nuovo sistema scommesse dinamico

Tutte le funzionalità dovrebbero essere operative!
