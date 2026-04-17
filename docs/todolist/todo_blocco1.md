# TODO — Blocco 1 UI/Accessibilità

## [1.4] Glow neon adattivo ai temi
- File: src/index.css
- Stato: [x] DONE
- Dipende da: nessuno
- Stima: 5 minuti
- Test: verifica visiva su 3 temi; conferma che .neon-glow, .neon-text-glow, neon-pulse e glow-intense seguano il colore primario
- Note: primo intervento consigliato; nessuna dipendenza TS

## [1.3] Rename label tab ambigui
- File: src/components/MainGameTabs.tsx
- Stato: [x] DONE
- Dipende da: nessuno
- Stima: 5 minuti
- Test: verifica visiva tab Azioni/Impostazioni; NVDA annuncia i nuovi label; i value restano social/status
- Note: aggiornare sia desktop sia mobile span

## [1.2] aria-live su interazioniRimaste
- File: src/components/TimeDisplay.tsx
- Stato: [x] DONE
- Dipende da: nessuno
- Stima: 10 minuti
- Test: NVDA annuncia il decremento di interazioniRimaste con aria-live polite e aria-atomic true; npx tsc --noEmit
- Note: marcare l'icona come aria-hidden per evitare ridondanza

## [1.1] blockedReason leggibile da NVDA
- File: src/components/ActionButton.tsx
- Stato: [x] DONE
- Dipende da: nessuno
- Stima: 20 minuti
- Test: focus su pulsante disabilitato con NVDA; annuncio di label + blockedReason; tooltip visivo invariato; npx tsc --noEmit
- Note: usare useId() internamente; non aggiungere prop id a ActionButtonProps

## [1.5] Pulizia contenuto corrotto di main.css
- File: src/main.css
- Stato: [x] DONE
- Dipende da: nessuno
- Stima: 10 minuti
- Test: avvio app senza errori CSS; font JetBrains Mono e Orbitron caricati; tema funzionante; nessun warning console
- Note: preservare i 3 @import iniziali; ultimo intervento del blocco
