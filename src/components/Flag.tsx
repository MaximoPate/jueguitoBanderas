import { useGame } from '../context/GameContext'

export default function Flag() {
  const { currentCountry } = useGame()

  if (!currentCountry) return null

  return (
    <img
      src={currentCountry.flag}
      alt="Bandera del país a adivinar"
      width={300}
    />
  )
}