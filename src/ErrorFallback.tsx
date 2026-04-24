import React from 'react'
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  if (import.meta.env.DEV) {
    console.error('Runtime error captured by ErrorBoundary:', error)
  }

  const isDynamicImportError = /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(error.message)

  const handleRecovery = () => {
    if (isDynamicImportError) {
      window.location.reload()
      return
    }
    resetErrorBoundary()
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <h1 className="sr-only">Errore imprevisto</h1>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon />
          <AlertTitle>{isDynamicImportError ? 'Aggiornamento rilevato durante la sessione' : 'Errore imprevisto durante l\'esecuzione'}</AlertTitle>
          <AlertDescription>
            {isDynamicImportError
              ? 'L\'app ha provato a caricare un modulo generato da una build precedente. Ricarica la pagina per allinearti agli asset pubblicati piu recenti.'
              : 'Si è verificato un problema inatteso durante l\'esecuzione dell\'applicazione. I dettagli dell\'errore sono mostrati qui sotto. Contatta l\'autore dello spark per segnalare il problema.'}
          </AlertDescription>
        </Alert>

        <div className="bg-card border rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-sm text-muted-foreground mb-2">Dettagli dell'errore:</h2>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>

        <Button
          autoFocus
          onClick={handleRecovery}
          className="w-full"
          variant="outline"
        >
          <RefreshCwIcon />
          {isDynamicImportError ? 'Ricarica la pagina' : 'Riprova'}
        </Button>
      </div>
    </div>
  );
}
