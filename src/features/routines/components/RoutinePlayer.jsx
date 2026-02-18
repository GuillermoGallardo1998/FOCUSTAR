// RoutinePlayer.jsx

import { useEffect, useState, useRef } from "react";
import {
  startRoutine,
  pauseRoutine,
  resetRoutine,
  advanceBlock
} from "../services/routinesService";
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";

// 🔹 Configuración de sonido
function getSettings() {
  return JSON.parse(localStorage.getItem("focustar_settings")) || {
    volume: 50,
    repeat: false,
    sound: "alarm1"
  };
}

function RoutinePlayer({ routine }) {
  const [remaining, setRemaining] = useState(routine.remainingSeconds || 0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // 🔹 Escucha bloques en tiempo real
  useEffect(() => {
    if (!routine.id) return;

    const blocksRef = collection(db, "routines", routine.id, "blocks");
    const q = query(blocksRef, orderBy("order", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const b = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlocks(b);
    });

    return () => unsub();
  }, [routine.id]);

  // 🔹 Escucha cambios de la rutina en Firestore
  useEffect(() => {
    if (!routine.id) return;

    const routineRef = doc(db, "routines", routine.id);
    const unsub = onSnapshot(routineRef, (snap) => {
      const data = snap.data();
      if (!data) return;

      setRemaining(data.remainingSeconds ?? 0);

      if (data.blockStartedAt) {
        startTimeRef.current = data.blockStartedAt.toMillis
          ? data.blockStartedAt.toMillis()
          : data.blockStartedAt.toDate().getTime();
      }
    });

    return () => unsub();
  }, [routine.id]);

  // 🔹 Cuenta regresiva + Page Visibility API
  useEffect(() => {
    if (!routine.isRunning || !routine.blockStartedAt) return;

    const playSound = () => {
      if (!audioUnlocked) return;
      const settings = getSettings();
      const validAlarms = ["alarm1", "alarm2", "alarm3", "alarm4"];
      const soundFile = validAlarms.includes(settings.sound) ? settings.sound : "alarm1";
      const audio = new Audio(`/sounds/${soundFile}.mp3`);
      audio.volume = settings.volume / 100;
      audio.loop = settings.repeat;
      audio.play().catch((err) => console.log("Audio bloqueado:", err));
    };

    const tick = () => {
      if (!startTimeRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = routine.remainingSeconds - elapsed;

      if (newRemaining <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRemaining(0);
        playSound();
        advanceBlock(routine.id);
      } else {
        setRemaining(newRemaining);
      }
    };

    intervalRef.current = setInterval(tick, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [routine.isRunning, routine.blockStartedAt, routine.remainingSeconds, routine.id, audioUnlocked]);

  // 🔹 Bloque actual
  const currentBlock = blocks[routine.currentBlockIndex] || null;

  // 🔹 Botones
  const handleStart = () => {
    setAudioUnlocked(true);
    startRoutine(routine.id, routine.uid);
  };
  const handlePause = () => {
    setAudioUnlocked(true);
    pauseRoutine(routine.id, remaining);
  };
  const handleReset = () => {
    setAudioUnlocked(true);
    resetRoutine(routine.id);
  };

  // 🔹 Formatear tiempo
  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="mt-4 border-t pt-4 flex flex-col gap-3 transition-colors duration-300"
      style={{ backgroundColor: currentBlock?.color || "#dcfce7" }}
    >
      {/* 🔹 Título del bloque */}
      {currentBlock && (
        <div className="text-center font-semibold text-lg">
          {currentBlock.title}
        </div>
      )}

      {/* 🔹 Tiempo restante */}
      <div
        className="text-2xl font-bold text-center"
        style={{ color: currentBlock?.color ? "#000" : "#111" }}
      >
        {formatTime(remaining)}
      </div>

      {/* 🔹 Botones */}
      <div className="flex gap-2">
        <button onClick={handleStart} className="bg-blue-500 text-white px-4 py-2 rounded flex-1">
          ▶ Start
        </button>
        <button onClick={handlePause} className="bg-yellow-500 text-white px-4 py-2 rounded flex-1">
          ⏸ Pause
        </button>
        <button onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded flex-1">
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

export default RoutinePlayer;
