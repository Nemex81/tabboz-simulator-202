import React from 'react'
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  if (import.meta.env.DEV) throw error;

  const isDynamicImportError = /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(error.message)

  const handleRecovery = () => {
    if (isDynamicImportError) {
      window.location.reload()
      return
    }
    resetErrorBoundary()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon />
          <AlertTitle>{isDynamicImportError ? 'Aggiornamento rilevato durante la sessione' : 'This spark has encountered a runtime error'}</AlertTitle>
          <AlertDescription>
            {isDynamicImportError
              ? 'L\'app ha provato a caricare un modulo generato da una build precedente. Ricarica la pagina per allinearti agli asset pubblicati piu recenti.'
              : 'Something unexpected happened while running the application. The error details are shown below. Contact the spark author and let them know about this issue.'}
          </AlertDescription>
        </Alert>
        
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Details:</h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>
        
        <Button 
          onClick={handleRecovery} 
          className="w-full"
          variant="outline"
        >
          <RefreshCwIcon />
          {isDynamicImportError ? 'Ricarica la pagina' : 'Try Again'}
        </Button>
      </div>
    </div>
  );
}
