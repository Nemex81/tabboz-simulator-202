import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  reloadAttempted: boolean
}

function DefaultFallback(): React.ReactElement {
  return (
    <div role="alert" className="p-4 text-sm text-muted-foreground">
      Errore caricamento componente.{' '}
      <button onClick={() => window.location.reload()}>
        Ricarica
      </button>
    </div>
  )
}

export default class ChunkErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, reloadAttempted: false }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error): void {
    const isChunkError =
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.name === 'ChunkLoadError'

    if (isChunkError && !this.state.reloadAttempted) {
      this.setState({ reloadAttempted: true })
      window.location.reload()
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback />
    }
    return this.props.children
  }
}
