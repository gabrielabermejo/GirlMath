import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show update banner
    const banner = document.createElement('div')
    banner.id = 'pwa-update-banner'
    banner.innerHTML = `
      <div style="
        position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
        z-index: 9999; background: white; border: 1.5px solid #f9a8d4;
        border-radius: 16px; padding: 12px 20px;
        box-shadow: 0 8px 30px rgba(236,72,153,0.2);
        display: flex; align-items: center; gap: 12px;
        font-family: inherit; white-space: nowrap;
      ">
        <span style="font-size: 13px; color: #6b7280;">🎀 Nueva versión disponible</span>
        <button id="pwa-update-btn" style="
          background: linear-gradient(135deg, #ec4899, #fb7185);
          color: white; border: none; border-radius: 10px;
          padding: 6px 14px; font-size: 13px; font-weight: 600;
          cursor: pointer;
        ">Actualizar</button>
      </div>
    `
    document.body.appendChild(banner)
    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
      banner.remove()
      updateSW(true)
    })
  },
  onOfflineReady() {},
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
