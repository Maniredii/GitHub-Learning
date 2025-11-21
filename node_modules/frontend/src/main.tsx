import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { register as registerServiceWorker } from './utils/serviceWorkerRegistration'
import { initSentry } from './config/sentry'

// Initialize Sentry for error tracking
initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for offline caching
registerServiceWorker()
