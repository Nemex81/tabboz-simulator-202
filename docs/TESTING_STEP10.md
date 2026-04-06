# TESTING STEP 10 — Checklist Test Manuale

> **STEP 10 Obiettivo**: `tsc --noEmit` → 0 errori. Verifica funzionalità complete post-fix.
> **Stato compilazione**: ✅ 0 errori TypeScript

---

## 0. Pre-requisiti

- [ ] `npm install` eseguito
- [ ] `npm run dev` avviato senza crash in console
- [ ] Browser aperto su `http://localhost:5173`

---

## 1. Avvio e Selezione Scuola

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 1.1 | Aprire l'applicazione | Schermata selezione scuola visibile |
| 1.2 | Selezionare "Tecnico" | Gioco si avvia con scuola tecnica |
| 1.3 | Selezionare "Agraria" | Gioco si avvia con scuola agraria |
| 1.4 | Selezionare "Artistico" | Gioco si avvia con scuola artistica |
| 1.5 | Selezionare "Liceo" | Gioco si avvia con liceo (se disponibile) |

---

## 2. Navigazione Schede (Tabs)

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 2.1 | Cliccare tab "Scuola" | Pannello scuola visibile |
| 2.2 | Cliccare tab "Esami" | Lista verifiche programmata visibile |
| 2.3 | Cliccare tab "Amici" | Pannello amici/fidanzata visibile |
| 2.4 | Cliccare tab "Dashboard" | Statistiche aggregate visibili |
| 2.5 | Cliccare tab "Personaggio" | Scheda personaggio visibile |
| 2.6 | Cliccare tab "Città" | Pannello azioni città visibile |

---

## 3. Mattina — Azioni Scuola

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 3.1 | Fare clic su "Vai a Scuola" | Evento scuola mattina, +2 INT, +10 stanchezza |
| 3.2 | Fare clic su "Marina!" | +1 assenza, +5 coattaggine, azione extra |
| 3.3 | (Con stanchezza alta > 80) Studiare | Bottone disabilitato con messaggio blocco |
| 3.4 | (Fuori periodo scolastico) Vai a Scuola | Bottone disabilitato |
| 3.5 | (Weekend) Vai a Scuola | Bottone disabilitato (solo feriali) |

---

## 4. Avanzamento Fasi Giornata

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 4.1 | Consumare tutte le azioni | Bottone "Avanza" abilitato, testo "✓ Pronto ad avanzare" |
| 4.2 | Premere "Avanza" | Fase avanza (Mattina→Pomeriggio→Sera) |
| 4.3 | Premere "Dormi" in serata | Avanza al giorno successivo |
| 4.4 | Ctrl+N | Avanza fase (shortcut) |

---

## 5. Sistema Esami

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 5.1 | Aprire tab Esami | Lista verifiche visibile senza crash |
| 5.2 | Badge "Verifica imminente" | Appare su esami con daysUntil ≤ 1 |
| 5.3 | Bottone "Preparati" su un esame | Azione eseguita, verifica preparata |
| 5.4 | Esame con daysUntil=0 | Evidenziato in rosso pulsante |

---

## 6. Sistema Amici

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 6.1 | Visualizzare pannello amici | Lista amici senza crash |
| 6.2 | Azione su amico di tipo "coatto" | Effetto applicato |
| 6.3 | Azione su amico di tipo "secchione" | Effetto studio bonus |
| 6.4 | Azione su amico di tipo "generico" | Nessun crash (nuovo tipo ora supportato) |

---

## 7. Dialoghi Scuola

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 7.1 | Aprire dialogo "Corrompi Professore" | Lista professori con voti visibile |
| 7.2 | Aprire dialogo "Minaccia Professore" | Lista professori visibile |
| 7.3 | Selezionare un professore (Corrompi) | Dialog di conferma, -100€, +voto |
| 7.4 | Selezionare un professore (Minaccia) | Evento minaccia con possibile espulsione |

---

## 8. Azioni Sociali (Tab Attività)

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 8.1 | Chiacchiera | +5 CAR, +3 REP |
| 8.2 | Giro al Parco | +5 CAR, -5 stanchezza |
| 8.3 | Telefona | +3 CAR |
| 8.4 | Atipa (rimorchio) | Successo/fallimento con effetti stat |
| 8.5 | Trucca Motorino (Costa 50€) | +15 coattaggine se soldi sufficienti |

---

## 9. Scheda Personaggio

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 9.1 | Aprire tab Personaggio | Scheda carica senza crash |
| 9.2 | Livello reputazione mostrato | Testo label reputazione visibile (es. "Coatto Base") |
| 9.3 | Stat salute/stress/morale | Valori mostrati correttamente |

---

## 10. Sistema Fasi e Azioni Rimaste

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 10.1 | N azioni rimaste > 0 | Bottoni azione abilitati |
| 10.2 | N azioni rimaste = 0 | Bottoni azione disabilitati con messaggio |
| 10.3 | Fase "mattina" | Solo azioni mattina disponibili |
| 10.4 | Fase "pomeriggio" | Azioni pomeriggio disponibili |
| 10.5 | Fase "sera" | Azioni sera disponibili |

---

## 11. Keyboard Shortcuts

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 11.1 | Premere `?` | Pannello shortcut appare |
| 11.2 | Ctrl+N | Avanza fase |
| 11.3 | Ctrl+4 | Trucca motorino |
| 11.4 | Ctrl+6 | Apre dialogo corrompi |
| 11.5 | Ctrl+7 | Apre dialogo minaccia |

---

## 12. Selettore Tema

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 12.1 | Aprire selettore tema | Lista temi disponibili |
| 12.2 | Cambiare tema | UI aggiornata con nuovo tema, persistito |

---

## 13. Fine Anno / Pagella

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 13.1 | Avanzare al fine anno | Dialogo pagella appare |
| 13.2 | Media sufficiente | Promozione, anno scolastico avanza |
| 13.3 | Media insufficiente | Bocciatura, messaggio appropriato |
| 13.4 | > 35 assenze | Bocciatura automatica |

---

## 14. Persistenza Dati

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 14.1 | Ricaricare pagina | Dati partita recuperati da localStorage |
| 14.2 | Aprire in tab diverso | Stesso stato gioco |

---

## 15. Accessibilità Basilare

| Test | Azione | Risultato atteso |
|------|--------|-----------------|
| 15.1 | Navigare con Tab | Focus visibile su elementi interattivi |
| 15.2 | Bottoni disabilitati con Screen Reader | aria-label descrive stato blocco |
| 15.3 | Messaggi di gioco | Testi leggibili con contrasto adeguato |

---

## Note Regressioni Specifiche da Verificare

- **Fix STEP 9E**: `useHealthSystem.ts` — `dayOfMonth` → `day` — verificare che la salute si aggiorni correttamente giorno per giorno
- **Fix FriendType 'generico'**: amici di tipo generico non causano crash in `EnhancedFriendsPanel`
- **Fix getReputationLevel**: oggetto `{label, description}` — verificare che `CharacterSheet` mostri il livello correttamente
- **Fix EventConstraint.blockedWhenExhausted**: eventi con questa proprietà non causano errori TS in `school-events.ts`
- **Fix phaseActionsLeft**: tutti i bottoni scuola/sociale/motorino rispettano correttamente il contatore azioni
