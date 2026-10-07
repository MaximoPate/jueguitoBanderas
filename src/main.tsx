import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// 👉 NUEVO: importamos el Provider del juego
import { GameProvider } from './context/GameContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 👉 NUEVO: el Provider envuelve a App, así todos los componentes hijos acceden al Context */}
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
)