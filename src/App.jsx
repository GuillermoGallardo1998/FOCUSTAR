import { useState, useEffect } from "react"

export default function App() {
  const [seconds, setSeconds] = useState(1500) // 25 minutos
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-8">
      <h1 className="text-5xl font-bold">Focustar ⭐</h1>

      <div className="text-7xl font-mono">
        {formatTime(seconds)}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsRunning(true)}
          className="bg-green-500 px-6 py-3 rounded-xl font-semibold"
        >
          Start
        </button>

        <button
          onClick={() => setIsRunning(false)}
          className="bg-yellow-500 px-6 py-3 rounded-xl font-semibold"
        >
          Pause
        </button>

        <button
          onClick={() => {
            setIsRunning(false)
            setSeconds(1500)
          }}
          className="bg-red-500 px-6 py-3 rounded-xl font-semibold"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
