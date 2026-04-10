# PLAN - Social Network Expansion

## Stato generale

- F1 - Azione social online: done
- F2 - Origine rete per nuovi amici online: done
- F3 - Provenienza visibile nelle card amici: done
- F4 - Contesto di provenienza per relazioni romantiche: done
- F5 - Filtro Rete nel FriendshipsPanel: done

## F1 - Azione social online

- Stato: done
- File:
  - src/components/tabs/SocialTab.tsx
  - src/hooks/useSocialActions.ts
  - src/hooks/useGameActions.ts
  - src/hooks/useGameActions.test.ts
  - src/App.tsx
  - src/lib/phase-actions.ts
- Tipo modifica:
  - nuova action UI
  - nuovo handler hook
  - propagazione nel wiring applicativo
  - aggiornamento del contratto ActionId
  - aggiornamento test mock
- Dipendenze:
  - nessuna

## F2 - Origine rete per nuovi amici online

- Stato: done
- File:
  - src/lib/relation-system.ts
  - src/lib/enhanced-friend-system.ts
  - src/hooks/useSocialActions.ts
  - eventuali test hook/lib collegati
- Tipo modifica:
  - distinzione esplicita della provenienza rete
  - allineamento testi e log di generazione online
- Dipendenze:
  - F1

## F3 - Provenienza visibile nelle card amici

- Stato: done
- File:
  - src/components/EnhancedFriendsPanel.tsx
- Tipo modifica:
  - rendering badge e label di provenienza
- Dipendenze:
  - F2

## F4 - Contesto di provenienza per relazioni romantiche

- Stato: done
- File:
  - src/lib/types.ts
  - src/lib/relationship-utils.ts
  - src/hooks/useEventEngine.ts
  - src/hooks/useAppEffects.ts
  - eventuali test hook/lib collegati
- Tipo modifica:
  - estensione type model
  - propagazione del contesto
  - normalizzazione bootstrap retrocompatibile
- Dipendenze:
  - F3

## F5 - Filtro Rete nel FriendshipsPanel

- Stato: done
- File:
  - src/components/FriendshipsPanel.tsx
- Tipo modifica:
  - nuovo filtro UI sugli amici conosciuti in rete
- Dipendenze:
  - F2

## Validazione e Cleanup

- Stato: done
- File:
  - src/App.tsx
  - src/components/AppHeader.tsx
  - src/components/TeachersPanel.tsx
  - src/components/RelationshipsPanel.tsx
  - src/components/RelationshipsPanel.test.tsx
  - src/components/SchoolMorningPanel.tsx
  - src/hooks/useEconomyActions.ts
  - src/hooks/useGirlfriendActions.ts
  - src/hooks/useHealthSystem.ts
  - src/hooks/useSchoolHandlers.ts
  - src/hooks/useSchoolEffects.test.ts
  - src/components/dialogs/CityDialogsGroup.test.tsx
  - src/components/GameDialogs.test.tsx
- Tipo modifica:
  - pulizia typecheck globale
  - allineamento contratti props e tipi runtime
  - test UI aggiuntivo per RelationshipsPanel

## Rinomina label sociali di quartiere

- Stato: done
- File:
  - src/components/tabs/SocialTab.tsx
  - src/hooks/useSocialActions.ts
  - src/hooks/useEventEngine.ts
  - src/hooks/useEventEngine.test.ts
  - src/lib/phase-actions.ts
  - src/components/dialogs/AtipaEventDialog.tsx
  - src/components/KeyboardShortcutsDialog.tsx
  - src/components/tabs/SchoolTab.tsx
- Tipo modifica:
  - rinomina label utente da attività parco a quartiere
  - rinomina label romantica da rimorchio generico alla nuova azione nel quartiere
  - allineamento di help text, log e testi di supporto