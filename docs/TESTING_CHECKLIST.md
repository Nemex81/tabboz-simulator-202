# 🧪 TESTING CHECKLIST - Iterazione 22

## Come Testare le Nuove Funzionalità

### ✅ 1. PANNELLO SELEZIONE MATERIA

**Obiettivo:** Verificare che il pulsante "Studia" apra un dialog per scegliere la materia.

**Passi:**
1. Avvia il gioco e vai alla tab "Scuola"
2. Assicurati di avere almeno 1 azione disponibile
3. Clicca sul pulsante "Studia" (o premi Ctrl+5)
4. **Risultato Atteso:** Si apre un dialog con tutte le materie del tuo indirizzo
5. Ogni materia mostra:
   - Nome della materia
   - Voto attuale (es. 6.5)
   - Indicatore colore (🔴 rosso se < 6, 🟡 giallo se 6-7, 🟢 verde se > 7)
6. Clicca su una materia per selezionarla
7. **Risultato Atteso:** La materia si evidenzia con bordo verde
8. Premi "Conferma Studio" (o tasto Enter)
9. **Risultato Atteso:**
   - Dialog si chiude
   - Azioni rimanenti: 3 → 2
   - Voto della materia selezionata aumentato di ~0.3-0.8 punti
   - Stanchezza aumentata di +20
   - Coattaggine ridotta di -5
   - Intelligenza aumentata di +1 a +3
   - Toast notification annuncia il risultato

**Test Aggiuntivi:**
- Premi Escape → dialog si chiude SENZA consumare azione
- Se Stanchezza > 80 → warning visibile "Bonus dimezzato!"
- Testa con Stanchezza 85 → bonus studio deve essere metà

---

### ✅ 2. SISTEMA DIFFICOLTÀ VERIFICHE

**Obiettivo:** Verificare che le verifiche abbiano livelli di difficoltà visibili.

**Passi:**
1. Vai alla tab "Verifiche"
2. Se non ci sono verifiche programmate, avanza di alcuni giorni (pulsante "Riposa")
3. **Risultato Atteso:** Ogni verifica programmata mostra:
   - Nome materia
   - "Tra X giorni" badge
   - **NUOVO:** Badge difficoltà (FACILE/NORMALE/DIFFICILE/BRUTALE)
   - Colori badge:
     - Verde = Facile
     - Grigio = Normale
     - Giallo = Difficile
     - Rosso = Brutale

**Test Annunci (3 giorni prima):**
1. Se una verifica è tra 4 giorni, avanza di 1 giorno
2. Quando arriva a "Tra 3 giorni"
3. **Risultato Atteso:** Toast notification con testo ironico:
   - Facile: "Il prof ha detto che sarà una passeggiata..."
   - Normale: "Verifica tra 3 giorni. Mettiti sotto."
   - Difficile: "Il collega ha pianto vedendo la verifica..."
   - Brutale: "Metà classe bocciata l'ultima volta. STUDIA ORA."

**Test Preparazione:**
1. Clicca "Prepara" su una verifica BRUTALE
2. **Risultato Atteso:** 
   - Bonus Intelligenza ridotto (35% dell'originale)
   - Messaggio conferma preparazione
3. Ripeti con verifica FACILE
4. **Risultato Atteso:**
   - Bonus Intelligenza aumentato (150% dell'originale)

**Test Voto Finale:**
1. Preparati per una verifica BRUTALE
2. Aspetta il giorno della verifica
3. **Risultato Atteso:**
   - Voto calcolato con penalità -1.0 per difficoltà
   - Messaggio: "VERIFICA BRUTALE di [MATERIA]! Eri PREPARATO! Voto: X.X"
4. Ripeti con verifica FACILE e NON preparato
5. **Risultato Atteso:**
   - Voto con bonus +0.5
   - Messaggio: "VERIFICA FACILE di [MATERIA]! Non eri preparato... Voto: X.X"

---

### ⚠️ 3. VALIDAZIONE SOLDI (Da Verificare Manualmente)

**Obiettivo:** Assicurarsi che non si possano spendere più soldi di quelli disponibili.

**Setup:**
1. Apri Console Browser (F12)
2. Digita: `window.localStorage.clear()` per reset completo
3. Avvia nuovo gioco
4. Vai alla tab "Profilo"

**Test 1: Pulsanti Disabled**
1. Riduci soldi a 30€ (via azioni o console)
2. Vai alla tab "Sociale"
3. **Risultato Atteso:**
   - Pulsante "Lampada" (30€) → ATTIVO
   - Pulsante "Motorino" (50€) → DISABLED
   - Pulsante "Shopping" (100€) → DISABLED
4. Clicca "Lampada"
5. **Risultato Atteso:**
   - Soldi: 30€ → 0€
   - Coattaggine +15, Figosità +10

**Test 2: Eventi Casuali**
1. Riduci soldi a 40€
2. Esegui azioni finché non appare evento "Polizia"
3. Scegli opzione "Dai Mazzetta" (50€)
4. **Risultato Atteso:**
   - Se hai 40€ → dovrebbe dire "Non hai abbastanza"
   - Soldi non vanno in negativo
   - Esito alternativo (portato in questura)

**Test 3: Evento Metallari**
1. Riduci soldi a 20€
2. Trigger evento Metallari (vai in giro finché appare)
3. Combatti e perdi
4. **Risultato Atteso:**
   - Dovrebbe sottrarre 50€
   - Soldi finali = 0€ (NON -30€!)

**Test 4: Rimorchio**
1. Vai alla tab "Sociale" > sotto-tab "Vita"
2. Riduci soldi a 60€
3. Clicca "Atipa" (Ctrl+9)
4. Accetta di provare (costa 80€)
5. **Risultato Atteso:**
   - Pulsante dovrebbe essere disabled
   - OPPURE messaggio "Non hai abbastanza soldi"

---

### ❌ 4. EVENTI NUOVI AMICI (Bug da Verificare)

**Obiettivo:** Verificare se gli eventi "Conosci nuovo amico" si triggherano.

**Metodo 1: Test Naturale**
1. Vai alla tab "Amici"
2. Conta amici attuali (es. 0)
3. Vai alla tab "Sociale"
4. Esegui 10 azioni di:
   - Palestra (Ctrl+1) x 3
   - Discoteca (Ctrl+D) x 3
   - Cinema (Ctrl+C) x 2
   - Shopping (Ctrl+S) x 2
5. Torna alla tab "Amici"
6. **Risultato Atteso:** Almeno 1 nuovo amico aggiunto (probabilità ~20% per azione)
7. **Se NON appare:** Procedi a Metodo 2

**Metodo 2: Test Forzato (Debug)**
1. Apri Console Browser (F12)
2. Vai al file `/src/lib/social-system.ts` (via editor)
3. Trova funzione `checkNewFriendEvent`
4. Cambia temporaneamente:
```typescript
const baseChance = 100  // ERA: 15, ORA 100 per test
```
5. Salva il file
6. Ricarica il gioco
7. Esegui 1 azione di Palestra
8. **Risultato Atteso:** Toast "Hai conosciuto [NOME] in palestra!"
9. Se anche così NON funziona → bug confermato, aprire issue

**Debug Console (Avanzato):**
1. Aggiungi in `handlePalestra()` dopo riga `checkForNewFriend('in palestra')`:
```typescript
console.log('[DEBUG FRIEND]', {
  carisma: stats.carisma,
  friendsCount: friends.length,
  maxFriends: 4,
  canTrigger: friends.length < 4
})
```
2. Guarda console ogni volta che vai in palestra
3. Verifica che `canTrigger` sia `true`
4. Se `false` → il limite di 4 amici è già raggiunto

**Fix Temporaneo (se bug confermato):**
1. In `/src/lib/social-system.ts`, cambia:
```typescript
export const checkNewFriendEvent = (carisma: number, location: string): boolean => {
  const baseChance = 30  // AUMENTATO DA 15 A 30
  const carismaBonus = Math.floor(carisma / 5)  // AUMENTATO DA /10 A /5
  const totalChance = baseChance + carismaBonus
  return randomChance(totalChance)
}
```

---

## 📊 CHECKLIST FINALE

Prima di considerare l'iterazione completa, verifica:

- [ ] ✅ Pannello selezione materia si apre con Ctrl+5
- [ ] ✅ Studiare una materia specifica aumenta solo quella materia
- [ ] ✅ Escape chiude dialog SENZA consumare azione
- [ ] ✅ Verifiche mostrano badge difficoltà (FACILE/NORMALE/DIFFICILE/BRUTALE)
- [ ] ✅ Annuncio 3 giorni prima con testo ironico
- [ ] ✅ Voto verifica influenzato da difficoltà
- [ ] ⚠️ Pulsanti disabled quando soldi insufficienti
- [ ] ⚠️ Eventi casuali non vanno in soldi negativi
- [ ] ❌ Eventi "Nuovi amici" si triggherano correttamente

**Legenda:**
- ✅ = Implementato e dovrebbe funzionare
- ⚠️ = Implementato ma da testare manualmente
- ❌ = Bug noto, necessita verifica e possibile fix

---

## 🐛 Se Trovi un Bug

1. Apri Console Browser (F12)
2. Copia tutto l'output della console
3. Descrivi esattamente cosa hai fatto (passi)
4. Descrivi cosa ti aspettavi vs cosa è successo
5. Screenshot se possibile
6. Apri issue su GitHub o contatta sviluppatore

---

## 📝 Note Importanti

### Backward Compatibility
- ✅ Vecchi save games funzionano ancora
- ✅ Verifiche vecchie senza difficoltà → default "normale"
- ✅ Nessun dato perso

### Performance
- ✅ Nessun lag aggiunto
- ✅ Dialog si apre istantaneamente
- ✅ State updates ottimizzati

### Accessibilità
- ✅ Keyboard navigation completa
- ✅ Screen reader announces
- ✅ Focus trap nei dialog
- ✅ Aria labels su tutti gli elementi interattivi

---

**Buon Testing!** 🎮
