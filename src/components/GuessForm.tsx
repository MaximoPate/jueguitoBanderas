import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { useGame } from '../context/GameContext'

export default function GuessForm() {
  const { countries, guess } = useGame()

  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null) 

  const handleSubmit = (e: SyntheticEvent) => {
    // Evita que el formulario recargue la página (comportamiento por defecto del navegador)
    e.preventDefault()

    const isCorrect = guess(answer)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    if (isCorrect) setAnswer('')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 👉 input + datalist = podés escribir O elegir de la lista de sugerencias */}
      <input
        type="text"
        list="countries-list"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="¿Qué país es?"
      />
      <datalist id="countries-list">
        {countries.map((c) => (
          <option key={c.name} value={c.name} />
        ))}
      </datalist>

      <button type="submit">Adivinar</button>

      {feedback === 'correct' && <p>¡Correcto! +10 🎉</p>}
      {feedback === 'wrong' && <p>Ups, no es ese. -1 😅</p>}
    </form>
  )
}