const POLITE_ID = 'a11y-live-region-polite'
const ASSERTIVE_ID = 'a11y-live-region-assertive'

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined' || !message) return
  const id = priority === 'assertive' ? ASSERTIVE_ID : POLITE_ID
  const node = document.getElementById(id)
  if (!node) return
  // Force re-announcement by clearing first
  node.textContent = ''
  // microtask delay to ensure SR detects the change
  window.requestAnimationFrame(() => {
    node.textContent = message
  })
}
