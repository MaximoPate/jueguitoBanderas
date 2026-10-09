import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react' 

// 👉 Forma de cada país tal como lo devuelve la API (dentro de "data")
export interface Country {
  name: string
  flag: string // URL de la imagen de la bandera
  iso2: string
  iso3: string
}


export interface LeaderboardEntry {
  id: number 
  name: string
  score: number
  date: string
}

const GAME_DURATION = 30
const HINT_COST = 2
const LEADERBOARD_SIZE = 10
const STORAGE_KEY = 'flag-game-leaderboard'


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


// 👉 NUEVO: cuenta cuántas LETRAS tiene un texto (ignora espacios, guiones, apóstrofes, etc.)
// \p{L} es "cualquier letra de cualquier idioma" (por eso va con la bandera u)
const countLetters = (text: string): number =>
  text.split('').filter((char) => /\p{L}/u.test(char)).length

const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}


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
  timeLeft: number 
  isGameOver: boolean 
  restartGame: () => void 
  playerName: string
  gameStarted: boolean
  startGame: (name: string) => void
  changePlayer: () => void
  hintsUsed: number
  maxHints: number
  hintCost: number
  requestHint: () => void
  leaderboard: LeaderboardEntry[]
  clearLeaderboard: () => void
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
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [playerName, setPlayerName] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard)

  const isGameOver = timeLeft === 0

  const maxHints = currentCountry
  ? Math.max(0, countLetters(currentCountry.name) - 1)
  : 0

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

 // 👉 NUEVO: efecto de la cuenta regresiva
  useEffect(() => {
    // No corremos el reloj si todavía está cargando, si hubo error o si el juego ya terminó
    if (!gameStarted || loading || error || isGameOver) return

    // setInterval ejecuta la función cada 1000 ms (1 segundo)
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [gameStarted, loading, error, isGameOver])
  // 👆 Cuando isGameOver pasa a true, el efecto se re-ejecuta: corre el cleanup (frena el reloj)
  // y el "return" de arriba evita crear uno nuevo.

  useEffect(() => {
    if (!isGameOver || score === 0) return

    setLeaderboard((prev) =>
      [
        ...prev,
        {
          id: Date.now(),
          name: playerName,
          score,
          date: new Date().toLocaleDateString('es-AR'),
        },
      ]
        .sort((a, b) => b.score - a.score) 
        .slice(0, LEADERBOARD_SIZE) 
    )
  }, [isGameOver, score, playerName])


useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard))
    } catch {
      // Si falla (modo privado, storage lleno), el juego sigue andando sin guardar
    }
  }, [leaderboard])




// 👉 NUEVO: elige un país nuevo al azar, distinto del actual.
  // Después la vamos a llamar cuando el jugador acierte.
  const nextCountry = () => {
    // Si todavía no hay países cargados, no hacemos nada
    if (countries.length === 0) return
    setCurrentCountry(pickRandom(countries, currentCountry))
    setHintsUsed(0)
  }

    // 👉 NUEVO: lógica de adivinar
  const guess = (answer: string): boolean => {
    if (isGameOver) return false
    if (!currentCountry || answer.trim() === '') return false

    const isCorrect = normalize(answer) === normalize(currentCountry.name)

    if (isCorrect) {

      setScore((prev) => prev + 10)
      nextCountry()
    } else {
      setScore((prev) => Math.max(0, prev - 1))
    }

    return isCorrect
  }

  const resetScore = () => setScore(0)

  const requestHint = () => {
    // No se puede si terminó el juego, si no hay país, o si ya se reveló el máximo
    if (isGameOver || !currentCountry || hintsUsed >= maxHints) return

    setHintsUsed((prev) => prev + 1)
    setScore((prev) => Math.max(0, prev - HINT_COST)) 
  }

  const restartGame = () => {
    resetScore()
    setTimeLeft(GAME_DURATION)
    setHintsUsed(0)
    if (countries.length > 0) {
      setCurrentCountry(pickRandom(countries, currentCountry))
    }
  }
  
  // 👉 NUEVO: arranca una partida para un jugador
  const startGame = (name: string) => {
    const cleanName = name.trim()
    if (cleanName === '') return

    setPlayerName(cleanName)
    restartGame()
    setGameStarted(true)
  }

  const changePlayer = () => setGameStarted(false)

  const clearLeaderboard = () => setLeaderboard([])

  
  return (
    // 👉 "value" es lo que van a poder leer los componentes con useGame()
    <GameContext.Provider value={{ countries, loading, error, currentCountry, nextCountry, score, guess, resetScore, timeLeft, isGameOver, restartGame, playerName, gameStarted, startGame, changePlayer, hintsUsed, maxHints, hintCost: HINT_COST, requestHint, leaderboard, clearLeaderboard }}>
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