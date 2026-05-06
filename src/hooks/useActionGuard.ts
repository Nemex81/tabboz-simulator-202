import { useCallback } from 'react'

export function useActionGuard(
  consumeAction: () => void,
  actionsRemaining: number,
  announce: (msg: string) => void
): {
  guardedAction: (fn: () => void, label?: string) => void
} {
  const guardedAction = useCallback((fn: () => void, _label?: string) => {
    if (actionsRemaining <= 0) {
      announce('Nessuna azione disponibile per questa fascia oraria')
      return
    }

    consumeAction()
    fn()
  }, [actionsRemaining, announce, consumeAction])

  return { guardedAction }
}