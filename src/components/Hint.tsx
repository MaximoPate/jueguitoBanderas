import { useGame } from '../context/GameContext'

export default function Hint() {
  const { currentCountry, hintsUsed, maxHints, hintCost, hintTimeCost, timeLeft, requestHint } = useGame()

  if (!currentCountry) return null

  let lettersSeen = 0
  let revealed = ''

  for (const char of currentCountry.name) {
    const isLetter = /\p{L}/u.test(char)

    if (isLetter) {
      if (lettersSeen === hintsUsed) break
      lettersSeen++
    }

    revealed += char
  }

  return (
    <div className="hint">
      <div className="hint__tiles" aria-live="polite">
        {hintsUsed === 0 ? (
          <p className="hint__empty">Pedí una pista para ver la primera letra</p>
        ) : (
          [...revealed.trimEnd()].map((char, index) => (
            // key={index}: las fichas ya existentes se mantienen y solo la NUEVA hace la animación "pop"
            <span key={index} className={char === ' ' ? 'tile tile--space' : 'tile'}>
              {char === ' ' ? '' : char}
            </span>
          ))
        )}
      </div>

      <button
        className="btn btn--ghost btn--small"
        onClick={requestHint}
        disabled={hintsUsed >= maxHints || timeLeft <= hintTimeCost}
        >
        Pedir pista (-{hintCost} puntos)
        </button>
    </div>
  )
}