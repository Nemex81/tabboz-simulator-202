# TODO - Eliminare collisioni residue nelle chiavi romantiche

- [x] Sostituire la chiave pickup derivata con un encounter id casuale esplicito
- [x] Assegnare `sourceKey` stabili anche alle relazioni legacy prive di chiave
- [x] Aggiornare la normalizzazione di bootstrap per persistere le nuove chiavi
- [x] Aggiungere test sui casi pickup/direct-girlfriend e sulla migrazione legacy
- [x] Validare con `npx tsc --noEmit` e suite Vitest completa
- [x] Riassumere i rischi residui rimasti fuori dal perimetro minimo
