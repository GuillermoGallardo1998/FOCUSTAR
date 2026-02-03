// HomeTimer.jsx

import { useEffect, useRef, useState, useCallback } from "react"

const MAX_TOTAL_SECONDS = 12 * 60 * 60 // ⛔ Máximo 12 horas

function getSavedSettings() {
  const saved = JSON.parse(localStorage.getItem("focustar_settings"))
  return {
    volume: saved?.volume ?? 50,
    repeat: saved?.repeat ?? false,
    bgColor: saved?.bgColor ?? "#0a0a0a",
    textColor: saved?.textColor ?? "#ffffff",
    sound: saved?.sound ?? "alarm1",
  }
}

function HomeTimer({ language }) {
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [settings, setSettings] = useState(getSavedSettings())
  const [toast, setToast] = useState("")

  const audioRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setSettings(getSavedSettings())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(""), 3000)
  }

  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
  }, [])

  const playAlarm = useCallback(() => {
    stopAlarm()
    const currentSettings = getSavedSettings()
    const audio = new Audio(`/sounds/${currentSettings.sound}.mp3`)
    audio.volume = currentSettings.volume / 100
    audio.loop = currentSettings.repeat
    audio.play()
    audioRef.current = audio
  }, [stopAlarm])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsRunning(false)
          setIsFinished(true)
          playAlarm()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, playAlarm])

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const updateTimePart = (type, value) => {
    stopAlarm()
    setIsFinished(false)

    const val = Math.max(0, parseInt(value) || 0)

    let newHours = hours
    let newMinutes = minutes
    let newSeconds = seconds

    if (type === "h") newHours = val
    if (type === "m") newMinutes = Math.min(val, 59)
    if (type === "s") newSeconds = Math.min(val, 59)

    const newTotal = newHours * 3600 + newMinutes * 60 + newSeconds

    if (newTotal > MAX_TOTAL_SECONDS) {
      setTotalSeconds(MAX_TOTAL_SECONDS)
      showToast("Máximo permitido: 12:00:00")
      return
    }

    setTotalSeconds(newTotal)
  }

  const handleStart = () => {
    if (totalSeconds <= 0) return

    if (totalSeconds > MAX_TOTAL_SECONDS) {
      setTotalSeconds(MAX_TOTAL_SECONDS)
      showToast("Máximo permitido: 12:00:00")
      return
    }

    stopAlarm()
    setIsFinished(false)
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
    stopAlarm()
    setIsFinished(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    stopAlarm()
    setIsFinished(false)
    setTotalSeconds(0)
  }

  const inputStyle =
    "w-12 sm:w-16 md:w-24 bg-transparent text-center outline-none font-mono text-4xl sm:text-5xl md:text-7xl"

  const baseBtn =
    "rounded-lg font-semibold transition-all duration-200 active:scale-95 hover:scale-105 shadow-md active:shadow-inner cursor-pointer"

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 transition-colors duration-300 ${
        isFinished ? "bg-flash" : ""
      }`}
      style={{ color: settings.textColor }}
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl mb-6 text-center">
        {language === "es" ? "Temporizador" : "Timer"}
      </h1>

      <div
        className={`flex items-center font-semibold mb-10 gap-1 sm:gap-2 
          text-4xl sm:text-5xl md:text-7xl ${isFinished ? "text-red-500" : ""}`}
      >
        <input
          type="number"
          value={String(hours).padStart(2, "0")}
          onChange={(e) => updateTimePart("h", e.target.value)}
          disabled={isRunning}
          className={inputStyle}
        />
        :
        <input
          type="number"
          value={String(minutes).padStart(2, "0")}
          onChange={(e) => updateTimePart("m", e.target.value)}
          disabled={isRunning}
          className={inputStyle}
        />
        :
        <input
          type="number"
          value={String(seconds).padStart(2, "0")}
          onChange={(e) => updateTimePart("s", e.target.value)}
          disabled={isRunning}
          className={inputStyle}
        />
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleStart}
          className={`${baseBtn} bg-green-600 hover:bg-green-700 text-sm sm:text-base px-4 sm:px-6 py-2`}
        >
          {language === "es" ? "Iniciar" : "Play"}
        </button>

        <button
          onClick={handlePause}
          className={`${baseBtn} bg-yellow-600 hover:bg-yellow-700 text-sm sm:text-base px-4 sm:px-6 py-2`}
        >
          {language === "es" ? "Pausar" : "Pause"}
        </button>

        <button
          onClick={resetTimer}
          className={`${baseBtn} bg-red-600 hover:bg-red-700 text-sm sm:text-base px-4 sm:px-6 py-2`}
        >
          Reset
        </button>
      </div>

      {toast && (
        <div className="toast text-sm sm:text-base mt-4 px-2 py-1 sm:px-4 sm:py-2">
          {toast}
        </div>
      )}
    </div>
  )

}

export default HomeTimer
