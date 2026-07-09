import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            background: '#FFFFFF',
            color: '#111827',
            boxShadow: 'none',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
