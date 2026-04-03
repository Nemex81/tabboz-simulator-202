# 🔍 DIAGNOSTICA ANOMALIE - Riepilogo Visuale

## STATO CORRENTE DEL CODICE

---

### ❌ ANOMALIA 1: Eventi Amici Non Generati
**File coinvolti:** `App.tsx`, `social-system.ts`

#### Situazione Attuale:
```typescript
// ✅ FUNZIONA (in handlePalestra)
announce('Hai pompato FERRO! ...')
checkForNewFriend('in palestra')  // ← Chiamata presente
checkForNewRelationship()
triggerRandomEvent()

// ❌ NON FUNZIONA (in handleShoppingMall)
announce('Hai comprato VESTITI FICHISSIMI! ...')
// checkForNewFriend() ← MANCA!
checkForNewRelationship()
triggerRandomEvent()

// ❌ NON FUNZIONA (in handleMotorino)
announce('Motorino TRUCCATO! ...')
// checkForNewFriend() ← MANCA!
triggerRandomEvent()

// ❌ NON FUNZIONA (in handleLampada)
announce('Ora sei ABBRONZATISSIMO! ...')
triggerRandomEvent()  // ← Manca checkForNewFriend!
```

#### Causa:
Le chiamate a `checkForNewFriend()` sono state dimenticate in 3 funzioni.

#### Impatto:
- Amici appaiono SOLO da: Palestra, Discoteca, Cinema
- NON appaiono da: Shopping, Motorino, Lampada
- Probabilità ridotta del ~50%

---

### ❌ ANOMALIA 2: Pannello Selezione Materia Non Collegato
**File coinvolti:** `App.tsx`, `SubjectSelectionDialog.tsx` (esiste già!)

#### Situazione Attuale:
```typescript
// ❌ IMPLEMENTAZIONE ATTUALE (handleStudia in App.tsx)
const handleStudia = () => {
  // ... controlli ...
  
  // Sceglie materia RANDOM
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
  
  // Studia direttamente senza chiedere
  setGrades((current) => ({
    ...current,
    [randomSubject]: clampStat(current[randomSubject] + gradeIncrease, 0, 10)
  }))
  
  // Consuma azione immediatamente
  consumeAction()
}

// ❌ COMPONENTE ESISTE MA NON È USATO
// File: src/components/SubjectSelectionDialog.tsx
// 167 righe di codice FUNZIONANTE ma MAI importato!
```

#### Cosa Manca:
1. Import del componente SubjectSelectionDialog
2. Stato `showSubjectSelection`
3. Separazione logica: handleStudia (apre pannello) vs handleConfirmStudy (esegue studio)
4. Rendering del componente nel JSX

#### Impatto:
- Giocatore NON può scegliere la materia da studiare
- Esperienza utente scadente (scelta casuale)
- Componente pronto ma inutilizzato (spreco)

---

### ❌ ANOMALIA 3: Gestione Soldi Inconsistente
**File coinvolti:** `App.tsx`, `game-utils.ts`

#### Situazione Attuale:

##### ✅ CONTROLLO PRESENTE (Palestra):
```typescript
const handlePalestra = () => {
  if (stats.soldi < 20) {  // ✅ Controllo esplicito
    playSound.failure()
    announce('Non hai abbastanza GRANA!')
    return
  }
  setStats((current) => ({
    soldi: clampStat(current.soldi - 20, 0, 1000)  // ⚠️ Clamp nasconde problema
  }))
}
```

##### ❌ PROBLEMA POTENZIALE:
```typescript
// Scenario problematico:
// Giocatore ha 15€
// Clicca Palestra (costa 20€)
// Il controllo "if (stats.soldi < 20)" BLOCCA correttamente ✅

// MA se per errore il controllo manca:
soldi: clampStat(15 - 20, 0, 1000)  // = clampStat(-5, 0, 1000) = 0
// Il giocatore può fare l'azione GRATIS! ❌
```

##### ❌ CONTROLLO MANCANTE (Cinema con ragazza):
```typescript
if (roll < 0.4) {
  // Incontra ragazza al cinema
  setStats((current) => ({
    ...current,
    soldi: clampStat(current.soldi - 80, 0, 1000)  // ❌ Nessun controllo!
    // Se ha 50€, diventa 0 e fa l'azione lo stesso
  }))
}
```

#### Funzioni da Verificare:
| Funzione | Costo | Controllo Presente | Stato |
|----------|-------|-------------------|-------|
| handlePalestra | 20€ | ✅ Sì | OK |
| handleLampada | 30€ | ✅ Sì | OK |
| handleMotorino | 50€ | ✅ Sì | OK |
| handleLavoro | 0€ (guadagno) | N/A | OK |
| handleCorrompi | 100€ | ✅ Sì | OK |
| handleDisco | 60€ | ✅ Sì | OK |
| handleCinema | 40€ | ✅ Sì | OK |
| handleCinema (ragazza) | 80€ | ❌ NO | CRITICO |
| handleShoppingMall | 100€ | ✅ Sì | OK |
| handleProvarciConAtipa | 80€ | ❌ NO (in dialog) | RISCHIO |

#### Impatto:
- Possibili azioni gratis se controllo manca
- Inconsistenza logica (clamp nasconde bug)
- Debug difficile (no warning console)

---

### ❌ ANOMALIA 4: Difficoltà Verifiche Non Implementata
**File coinvolti:** `types.ts`, `exam-system.ts`, `App.tsx`, `ExamsPanel.tsx`

#### Situazione Attuale:

##### Tipo Attuale (types.ts):
```typescript
export interface ScheduledExam {
  subject: string
  daysUntil: number
  isPrepared: boolean
  // ❌ MANCA: difficulty
}
```

##### Generazione Attuale (exam-system.ts):
```typescript
export const generateScheduledExam = (subjects: string[]): ScheduledExam => {
  return {
    subject: randomSubject,
    daysUntil: Math.floor(Math.random() * 4) + 2,
    isPrepared: false
    // ❌ MANCA: difficulty
  }
}
```

##### Calcolo Voto Attuale (exam-system.ts):
```typescript
export const calculateExamGrade = (
  currentGrade: number,
  intelligenza: number,
  isPrepared: boolean,
  media: number
  // ❌ MANCA: difficulty parameter
): number => {
  if (isPrepared) {
    const intelligenceMultiplier = 1 + (intelligenza / 100)
    gradeChange = 2 * intelligenceMultiplier
    // ❌ SEMPRE lo stesso moltiplicatore, indipendente da difficoltà
  }
  // ...
}
```

##### UI Attuale (ExamsPanel.tsx):
```tsx
<div className="exam-card">
  <span>{getSubjectDisplayName(exam.subject)}</span>
  {/* ❌ MANCA: indicatore difficoltà */}
  <span>{exam.daysUntil} giorni</span>
</div>
```

#### Cosa Manca:
1. Tipo `ExamDifficulty` con valori 'facile' | 'media' | 'difficile' | 'impossibile'
2. Campo `difficulty` in `ScheduledExam`
3. Logica generazione difficoltà casuale (con distribuzione realistica)
4. Moltiplicatori nel calcolo voto basati su difficoltà
5. UI che mostra difficoltà con emoji/colori

#### Impatto Utente:
- Tutte le verifiche hanno la stessa difficoltà
- Nessun incentivo a prepararsi meglio per verifiche difficili
- Esperienza ripetitiva (manca varietà)
- Impossibile pianificare strategia studio

#### Impatto Gameplay:
```
Scenario Attuale:
- Verifica Facile preparata: +2.5 voto
- Verifica Impossibile preparata: +2.5 voto  ← Stesso risultato!

Scenario Desiderato:
- Verifica Facile preparata: +3.75 voto (1.5x)
- Verifica Media preparata: +2.5 voto (1.0x)
- Verifica Difficile preparata: +1.75 voto (0.7x)
- Verifica Impossibile preparata: +1.0 voto (0.4x)
```

---

## 📊 PRIORITÀ IMPLEMENTAZIONE

### 🔴 CRITICA (blocca gameplay)
- **Anomalia 2** - Pannello Materie (feature esistente non collegata)
- **Anomalia 3** - Gestione Soldi (bug potenzialmente sfruttabile)

### 🟡 ALTA (degrada esperienza)
- **Anomalia 1** - Eventi Amici (feature ridotta del 50%)
- **Anomalia 4** - Difficoltà Verifiche (gameplay piatto)

---

## 🧪 MATRICE DI TESTING

| Test | File Coinvolto | Comando | Risultato Atteso | Risultato Attuale |
|------|---------------|---------|------------------|-------------------|
| Amico da Shopping | App.tsx | Fare shopping 10 volte | 1-2 amici appaiono | ❌ 0 amici |
| Pannello Materie | App.tsx | Premere Studia | Si apre dialog selezione | ❌ Studia random |
| Spendi più del dovuto | App.tsx | 15€, prova Palestra (20€) | Blocco con msg | ✅ Bloccato |
| Difficoltà Verifica | ExamsPanel | Controlla lista verifiche | Mostra difficoltà | ❌ Non mostrato |
| Verifica Facile | exam-system | Preparare verifica facile | +3.75 voto | ❌ +2.5 voto |

---

## 📁 FILE DA MODIFICARE

### Modifiche Minori (1-10 righe):
- ✏️ `App.tsx` - Aggiungi 3 chiamate checkForNewFriend
- ✏️ `social-system.ts` - Modifica probabilità location

### Modifiche Medie (10-50 righe):
- 📝 `App.tsx` - Collega SubjectSelectionDialog
- 📝 `game-utils.ts` - Aggiungi canAfford/spendMoney
- 📝 `types.ts` - Aggiungi ExamDifficulty

### Modifiche Estese (50+ righe):
- 📋 `App.tsx` - Refactor gestione soldi in tutte le funzioni
- 📋 `exam-system.ts` - Sistema difficoltà verifiche
- 📋 `ExamsPanel.tsx` - UI difficoltà

---

## 🎯 QUICK REFERENCE

### Comandi Debug Console:
```javascript
// Controlla soldi attuali
console.log('Soldi:', stats.soldi)

// Forza generazione amico
checkForNewFriend('test', 100)  // 100% probabilità

// Controlla verifiche programmate
console.log('Verifiche:', scheduledExams)
```

### Valori Critici:
- **Soldi MAX:** 1000€
- **Probabilità amici base:** 15%
- **Bonus carisma amici:** +1% ogni 10 punti
- **Moltiplicatori difficoltà:** Facile 1.5x, Media 1.0x, Difficile 0.7x, Impossibile 0.4x

---

**Ultimo aggiornamento:** ${new Date().toLocaleString('it-IT')}
**Versione diagnostica:** 1.0
