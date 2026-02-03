// SettingsModal.jsx
import { useEffect, useRef, useState } from "react"

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

export default function SettingsModal({ isOpen, onClose, language }) {
  const saved = getSavedSettings()
  const [volume, setVolume] = useState(saved.volume)
  const [repeat, setRepeat] = useState(saved.repeat)
  const [bgColor, setBgColor] = useState(saved.bgColor)
  const [textColor, setTextColor] = useState(saved.textColor)
  const [sound, setSound] = useState(saved.sound)
  const previewAudioRef = useRef(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const playPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
    }
    const audio = new Audio(`/sounds/${sound}.mp3`)
    audio.volume = volume / 100
    audio.play()
    previewAudioRef.current = audio
  }

  useEffect(() => {
    const settings = { volume, repeat, bgColor, textColor, sound }
    localStorage.setItem("focustar_settings", JSON.stringify(settings))

    document.documentElement.style.setProperty("--bg-color", bgColor)
    document.documentElement.style.setProperty("--text-color", textColor)
  }, [volume, repeat, bgColor, textColor, sound])

  if (!isOpen) return null

  const sounds = [
    { value: "alarm1", label: language === "es" ? "Clásico" : "Classic" },
    { value: "alarm2", label: language === "es" ? "Digital" : "Digital" },
    { value: "alarm3", label: language === "es" ? "Suave" : "Soft" },
    { value: "alarm4", label: language === "es" ? "Campana" : "Bell" },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-md p-6 rounded-2xl space-y-6 shadow-2xl border border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-[1.02]"
        style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold tracking-wide text-center mb-4">
          {language === "es" ? "Configuraciones" : "Settings"}
        </h2>

        {/* CUSTOM DROPDOWN */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium">
            {language === "es" ? "Sonido de alarma" : "Alarm sound"}
          </label>

          <div className="relative w-full">
            <button
              className="w-full p-2 rounded-lg flex justify-between items-center border border-white/20 focus:outline-none transition hover:opacity-80"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                backgroundColor: bgColor,
                color: textColor,
                backdropFilter: "blur(4px)",
              }}
            >
              {sounds.find((s) => s.value === sound)?.label || sound}
              <span className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {dropdownOpen && (
              <ul
                className="absolute top-full left-0 mt-1 z-50 w-full rounded-lg max-h-52 overflow-auto shadow-lg border border-white/20"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {sounds.map((s) => (
                  <li
                    key={s.value}
                    className={`p-2 cursor-pointer hover:opacity-80 ${
                      sound === s.value ? "font-semibold" : ""
                    }`}
                    onClick={() => {
                      setSound(s.value)
                      setDropdownOpen(false)
                    }}
                    style={{
                      backgroundColor: sound === s.value ? textColor + "20" : "transparent",
                      color: textColor,
                    }}
                  >
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={playPreview}
            className="mt-2 px-4 py-2 rounded-lg font-medium text-sm transition hover:opacity-80"
            style={{ backgroundColor: textColor, color: bgColor }}
          >
            {language === "es" ? "Reproducir" : "Preview"}
          </button>
        </div>

        {/* VOLUMEN */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium">
            {language === "es" ? `Volumen: ${volume}%` : `Volume: ${volume}%`}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        {/* REPETIR */}
        <div className="flex justify-center items-center gap-2">
          <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="accent-blue-500" />
          <span className="text-sm font-medium">
            {language === "es" ? "Repetir alarma hasta detener" : "Repeat alarm until stopped"}
          </span>
        </div>

        {/* COLORES + BOTÓN DEFAULT */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-4">
          {/* Background color */}
          <div className="flex flex-col items-center relative">
            <label className="text-sm font-medium mb-1">
              {language === "es" ? "Fondo" : "Background"}
            </label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute w-12 h-12 opacity-0 cursor-pointer" />
            <div
              className="w-12 h-12 rounded-full border-2 cursor-pointer shadow-inner transition-transform hover:scale-105"
              style={{ backgroundColor: bgColor, borderColor: textColor }}
              onClick={(e) => e.currentTarget.previousSibling.click()}
            />
          </div>

          {/* Text color */}
          <div className="flex flex-col items-center relative">
            <label className="text-sm font-medium mb-1">
              {language === "es" ? "Texto" : "Text"}
            </label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="absolute w-12 h-12 opacity-0 cursor-pointer" />
            <div
              className="w-12 h-12 rounded-full border-2 cursor-pointer shadow-inner transition-transform hover:scale-105"
              style={{ backgroundColor: textColor, borderColor: bgColor }}
              onClick={(e) => e.currentTarget.previousSibling.click()}
            />
          </div>

          {/* Default Colors Button */}
          <button
            onClick={() => {
              setBgColor("#0a0a0a")
              setTextColor("#ffffff")
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ backgroundColor: textColor, color: bgColor }}
          >
            {language === "es" ? "Colores por defecto" : "Default Colors"}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg font-semibold text-sm transition hover:bg-white/20 mt-4"
          style={{ backgroundColor: "var(--text-color)", color: "var(--bg-color)" }}
        >
          {language === "es" ? "Cerrar" : "Close"}
        </button>
      </div>
    </div>
  )
}
