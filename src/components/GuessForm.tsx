import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { useGame } from '../context/GameContext'

export default function GuessForm() {
  const { countries, guess } = useGame()

  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault()

    const isCorrect = guess(answer)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setAttempts((prev) => prev + 1)

    setAnswer('')
  }

  return (
    <form className="guess" onSubmit={handleSubmit}>
      <div className="guess__row">
        <input
          className="field"
          type="text"
          list="countries-list"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="¿De qué país es?"
          autoComplete="off" // apaga el autocompletado del navegador para que no tape la lista de países
          autoFocus // el cursor ya queda en el campo al empezar a jugar
        />
        <datalist id="countries-list">
          {countries.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>

        <button className="btn btn--primary" type="submit">
          Adivinar
        </button>
      </div>

      <div className="feedback-slot">
        {feedback === 'correct' && (
          <p key={attempts} className="feedback feedback--correct">
            ¡Correcto! +10
          </p>
        )}
        {feedback === 'wrong' && (
          <p key={attempts} className="feedback feedback--wrong">
            Ese no es el país
          </p>
        )}
      </div>
    </form>
  )
}