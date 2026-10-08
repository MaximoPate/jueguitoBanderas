import { useGame } from './context/GameContext'
import Flag from './components/Flag'
import ScoreBoard from './components/ScoreBoard'
import GuessForm from './components/GuessForm' 

function App() {
  const { loading, error } = useGame()

  if (loading) return <p>Cargando países...</p>
  if (error) return <p>Ups, algo falló: {error}</p>

  return (
    <main>
      <h1>Adiviná la bandera</h1>
      <ScoreBoard /> 
      <Flag />
      <GuessForm /> 
    </main>
  )
}

export default App