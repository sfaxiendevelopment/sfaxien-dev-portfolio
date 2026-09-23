import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { hydrateFromCloud, initLocalApi } from './lib/local-store'
import './index.css'

const HYDRATE_TIMEOUT_MS = 2500

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), ms)
    }),
  ])
}

async function boot(): Promise<void> {
  initLocalApi()
  await withTimeout(hydrateFromCloud(), HYDRATE_TIMEOUT_MS)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>,
  )
}

void boot()
