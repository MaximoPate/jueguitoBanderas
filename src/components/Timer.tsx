import { useGame } from '../context/GameContext'

export default function Timer() {
  const { timeLeft } = useGame()

  const isLow = timeLeft <= 10

  return (
    <div className={isLow ? 'stat stat--low' : 'stat'} role="timer">
      <span className="stat__value">{timeLeft}</span>
      <span className="stat__label">segundos</span>
    </div>
  )
}