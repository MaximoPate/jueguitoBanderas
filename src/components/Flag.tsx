import { useGame } from '../context/GameContext'

export default function Flag() {
  const { currentCountry } = useGame()

  if (!currentCountry) return null

  return (
    <div className="stage">
      {/* aria-hidden: el mástil es pura decoración, los lectores de pantalla lo ignoran */}
      <div className="pole" aria-hidden="true" />

      {/* 👉 NUEVO: key={nombre del país}. Cuando cambia el país, React destruye y vuelve a crear
          este div, y por eso la animación de "desplegar" se repite con cada bandera nueva */}
      <div className="flag" key={currentCountry.name}>
        <img
          className="flag__img"
          src={currentCountry.flag}
          alt="Bandera del país a adivinar"
        />
      </div>
    </div>
  )
}