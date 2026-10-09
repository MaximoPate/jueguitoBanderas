import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { useGame } from '../context/GameContext'

export default function PlayerSetup() {
  const { startGame } = useGame()
  const [name, setName] = useState('')

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault()
    startGame(name)
  }

  return (
    <form className="setup" onSubmit={handleSubmit}>
      <input
        className="field"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        aria-label="Tu nombre" // el input no tiene <label> visible, así que lo nombramos para accesibilidad
        maxLength={20}
      />
      <button className="btn btn--primary" type="submit" disabled={name.trim() === ''}>
        Empezar
      </button>
    </form>
  )
}