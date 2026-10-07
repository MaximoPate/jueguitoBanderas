import { useGame } from './context/GameContext'
import Flag from './components/Flag'

function App() {
  const { loading, error, nextCountry } = useGame()

  if (loading) return <p>Cargando países...</p>
  if (error) return <p>Ups, algo falló: {error}</p>

  return (
    <main>
      <h1>Adiviná la bandera</h1>
      <Flag />
      {/* 👉 TEMPORAL: botón solo para probar que el azar funciona. Lo borramos en el paso 3 */}
      <button onClick={nextCountry}>Siguiente (temporal)</button>
    </main>
  )
}

export default App