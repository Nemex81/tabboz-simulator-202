<<<<<<< HEAD
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { toast } from 'sonner'
import { announce as domAnnounce } from '@/lib/a11y-announce'

type A11yPriority = 'polite' | 'assertive'

interface A11yContextValue {
  announce: (message: string, priority?: A11yPriority) => void
}

const noopAnnounce: A11yContextValue['announce'] = () => {}

const A11yContext = createContext<A11yContextValue>({
  announce: noopAnnounce,
})

export function A11yProvider({ children }: { children: ReactNode }) {
  const value = useMemo<A11yContextValue>(() => ({
    announce: (message, priority = 'polite') => {
      if (!message.trim()) {
        return
      }

      domAnnounce(message, priority)
      toast(message, { duration: 3000 })
    },
  }), [])

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>
}

export function useA11y() {
  return useContext(A11yContext)
}

=======
>>>>>>> 36b249777e886e265f6b221cc3f6c42204cebb17
export function A11yLiveRegion() {
  return (
    <>
      <div
        id="a11y-live-region-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        id="a11y-live-region-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  )
}
<<<<<<< HEAD

export type { A11yPriority }
=======
>>>>>>> 36b249777e886e265f6b221cc3f6c42204cebb17
