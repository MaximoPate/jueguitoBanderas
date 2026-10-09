import { useGame } from './context/GameContext'
import Flag from './components/Flag'
import ScoreBoard from './components/ScoreBoard'
import GuessForm from './components/GuessForm'
import Timer from './components/Timer'
import Hint from './components/Hint'
import PlayerSetup from './components/PlayerSetup'
import Leaderboard from './components/Leaderboard'

function App() {
  const { loading, error, isGameOver, restartGame, gameStarted, playerName, changePlayer } =
    useGame()

  if (loading) return <p className="status">Cargando países...</p>
  if (error)
    return <p className="status status--error">No se pudieron cargar los países: {error}</p>

  // Pantalla 1: inicio
  if (!gameStarted) {
    return (
      <main className="app">
        <header className="hero">
          <h1 className="hero__title">
            Adiviná
            <br />
            la bandera
          </h1>
          <p className="hero__lead">
            Mirá la bandera, escribí de qué país es y sumá puntos antes de que se acabe el tiempo.
          </p>
          <PlayerSetup />
        </header>
        <Leaderboard />
      </main>
    )
  }

  // Pantalla 2: partida en curso o terminada
  return (
    <main className="app">
      <header className="topbar">
        <h1 className="wordmark">Adiviná la bandera</h1>
        <span className="player">{playerName}</span>
      </header>

      <section className="hud">
        <Timer />
        <ScoreBoard />
      </section>

      {isGameOver ? (
        <section className="over">
          <h2 className="over__title">Se acabó el tiempo</h2>
          <div className="over__actions">
            <button className="btn btn--primary" onClick={restartGame}>
              Jugar de nuevo
            </button>
            <button className="btn btn--ghost" onClick={changePlayer}>
              Cambiar jugador
            </button>
          </div>
          <Leaderboard />
        </section>
      ) : (
        <>
          <Flag />
          <Hint />
          <GuessForm />
        </>
      )}
    </main>
  )
}

export default App