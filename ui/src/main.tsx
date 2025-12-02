import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

let user = ''





if (user) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

