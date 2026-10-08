import { useGame } from '../context/GameContext'

export default function ScoreBoard() {
  const { score, resetScore } = useGame()

  return (
    <div>
      <h2>Puntaje: {score}</h2>
      <button onClick={resetScore}>Reiniciar puntaje</button>
    </div>
  )
}