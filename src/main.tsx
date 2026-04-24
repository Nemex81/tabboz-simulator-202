import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from 'sonner'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { A11yLiveRegion, A11yProvider } from './components/A11yLiveRegion'

import "./main.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <A11yProvider>
      <App />
      <A11yLiveRegion />
    </A11yProvider>
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{ duration: 4500 }}
    />
  </ErrorBoundary>
)
