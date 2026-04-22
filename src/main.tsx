import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from 'sonner'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { A11yLiveRegion } from './components/A11yLiveRegion'

import "./main.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
    <A11yLiveRegion />
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{ duration: 4500 }}
    />
  </ErrorBoundary>
)
