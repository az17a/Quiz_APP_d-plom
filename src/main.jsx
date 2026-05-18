import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{
      style: { borderRadius: '12px', fontSize: '14px' },
      success: { style: { background: '#E1F5EE', color: '#0F6E56' } },
      error: { style: { background: '#FCEBEB', color: '#A32D2D' } },
    }} />
  </StrictMode>
)