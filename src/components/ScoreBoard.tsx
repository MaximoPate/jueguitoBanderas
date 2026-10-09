import { useGame } from '../context/GameContext'

export default function ScoreBoard() {
  const { score, resetScore } = useGame()

  return (
    <div className="stat stat--end">
      {/* aria-live="polite": el lector de pantalla anuncia el nuevo puntaje cuando cambia */}
      <span className="stat__value" aria-live="polite">
        {score}
      </span>
      <span className="stat__label">puntos</span>
      <button className="btn btn--text" onClick={resetScore}>
        Reiniciar puntaje
      </button>
    </div>
  )
}