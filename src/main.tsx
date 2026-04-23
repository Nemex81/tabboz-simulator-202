import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from 'sonner'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
<<<<<<< HEAD
import { A11yProvider } from './components/A11yLiveRegion'
=======
import { A11yLiveRegion } from './components/A11yLiveRegion'
>>>>>>> 36b249777e886e265f6b221cc3f6c42204cebb17

import "./main.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
<<<<<<< HEAD
    <A11yProvider>
      <App />
    </A11yProvider>
=======
    <App />
    <A11yLiveRegion />
>>>>>>> 36b249777e886e265f6b221cc3f6c42204cebb17
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{ duration: 4500 }}
    />
  </ErrorBoundary>
)
