import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react' 

// 👉 Forma de cada país tal como lo devuelve la API (dentro de "data")
export interface Country {
  name: string
  flag: string // URL de la imagen de la bandera
  iso2: string
  iso3: string
}

// 👉 NUEVO: función auxiliar que devuelve un país al azar de una lista.
// Vive FUERA del componente porque no depende de ningún estado (no necesita recrearse en cada render).
// Si le pasamos "exclude", evita devolver ese mismo país (para no repetir bandera seguida).
const pickRandom = (list: Country[], exclude?: Country | null): Country => {
  // Si hay que excluir uno, lo sacamos de la lista de opciones
  const options = exclude ? list.filter((c) => c.name !== exclude.name) : list
  // Math.random() da un decimal entre 0 y 1; lo multiplicamos por el largo de la lista
  // y Math.floor lo redondea hacia abajo para obtener un índice válido
  return options[Math.floor(Math.random() * options.length)]
}

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()


// 👉 Todo lo que el Context le va a exponer a los componentes.
// Por ahora solo los países y el estado de la carga; lo vamos ampliando por pasos.
interface GameContextType {
  countries: Country[]
  loading: boolean
  error: string | null
  currentCountry: Country | null 
  nextCountry: () => void 
  score: number 
  guess: (answer: string) => boolean // 👉 NUEVO: recibe lo que escribió el jugador y devuelve true si acertó
  resetScore: () => void
}

// 👉 Creamos el Context. Arranca en null y el hook useGame (abajo) valida que exista el Provider.
const GameContext = createContext<GameContextType | null>(null)

// 👉 Provider: guarda el estado y lo comparte con toda la app
export function GameProvider({ children }: { children: ReactNode }) {
  // Lista completa de países que trae la API
  const [countries, setCountries] = useState<Country[]>([])
  // Para mostrar "Cargando..." mientras llega la respuesta
  const [loading, setLoading] = useState(true)
  // Para mostrar un mensaje si el fetch falla
  const [error, setError] = useState<string | null>(null)
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null)
  const [score, setScore] = useState(0)

  // 👉 Se ejecuta UNA vez al montar la app (por el array de dependencias vacío [])
  useEffect(() => {
    // Bandera para ignorar la respuesta si el componente se desmontó.
    // Sirve también porque StrictMode ejecuta los efectos 2 veces en desarrollo.
    let ignore = false

    const fetchCountries = async () => {
      try {
        const res = await fetch(
          'https://countriesnow.space/api/v0.1/countries/flag/images'
        )
        // fetch NO tira error en 404/500, así que lo chequeamos a mano
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`)

        const json = await res.json()

        // La API devuelve { error, msg, data: [...] }, nos quedamos con "data"
        if (!ignore) setCountries(json.data)
            // 👉 NUEVO: apenas llega la respuesta, elegimos el primer país al azar.
          // Usamos json.data (y no "countries") porque el state todavía no se actualizó en este momento.
          setCurrentCountry(pickRandom(json.data))
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        // Pase lo que pase, terminó la carga
        if (!ignore) setLoading(false)
      }
    }

    fetchCountries()

    // Cleanup: se ejecuta al desmontar
    return () => {
      ignore = true
    }
  }, [])

// 👉 NUEVO: elige un país nuevo al azar, distinto del actual.
  // Después la vamos a llamar cuando el jugador acierte.
  const nextCountry = () => {
    // Si todavía no hay países cargados, no hacemos nada
    if (countries.length === 0) return
    setCurrentCountry(pickRandom(countries, currentCountry))
  }

    // 👉 NUEVO: lógica de adivinar
  const guess = (answer: string): boolean => {
    // Si no hay país actual o el jugador no escribió nada, no hacemos nada
    if (!currentCountry || answer.trim() === '') return false

    // Comparamos las dos cosas ya normalizadas
    const isCorrect = normalize(answer) === normalize(currentCountry.name)

    if (isCorrect) {
      // Acierto: +10 puntos y pasamos a otro país
      // Usamos la forma (prev => ...) para asegurarnos de partir siempre del valor más reciente
      setScore((prev) => prev + 10)
      nextCountry()
    } else {
      // Fallo: -1 punto (el país NO cambia, el jugador puede reintentar)
      setScore((prev) => prev - 1)
    }

    return isCorrect
  }

  // 👉 NUEVO: reinicia el puntaje
  const resetScore = () => setScore(0)

  return (
    // 👉 "value" es lo que van a poder leer los componentes con useGame()
    <GameContext.Provider value={{ countries, loading, error, currentCountry, nextCountry, score, guess, resetScore }}>
      {children}
    </GameContext.Provider>
  )
}

// 👉 Hook propio para consumir el Context sin repetir useContext + validación en cada componente
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame tiene que usarse dentro de <GameProvider>')
  }
  return context
}