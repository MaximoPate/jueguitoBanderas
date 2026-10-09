import { useGame } from '../context/GameContext'

export default function Leaderboard() {
  const { leaderboard, clearLeaderboard } = useGame()

  return (
    <section>
      <h2 className="board__title">Mejores puntajes</h2>

      {leaderboard.length === 0 ? (
        <p className="board__empty">Todavía no hay puntajes. ¡Sé el primero!</p>
      ) : (
        <>
          <table className="board__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Jugador</th>
                {/* "num" alinea a la derecha; "col-date" se oculta en celulares */}
                <th className="num">Puntos</th>
                <th className="num col-date">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.id}>
                  <td>
                    {/* 👉 NUEVO: los 3 primeros llevan una clase extra (rank--1, rank--2, rank--3) para darles color */}
                    <span className={index < 3 ? `rank rank--${index + 1}` : 'rank'}>
                      {index + 1}
                    </span>
                  </td>
                  <td>{entry.name}</td>
                  <td className="num score">{entry.score}</td>
                  <td className="num col-date">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="board__actions">
            <button className="btn btn--text" onClick={clearLeaderboard}>
              Borrar puntajes
            </button>
          </div>
        </>
      )}
    </section>
  )
}