// features/routines/components/RoutinePlayer.jsx

import { useEffect, useState, useRef } from "react";
import {
  startRoutine,
  resetRoutine,
  advanceBlock,
} from "../services/routinesService";
import { collection, doc, getDocs, getDoc, onSnapshot, query, orderBy, updateDoc, where } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useOutletContext } from "react-router-dom";

function getSettings() {
  return JSON.parse(localStorage.getItem("focustar_settings")) || {
    volume: 50,
    repeat: false,
    sound: "alarm1"
  };
}

function RoutinePlayer({ routine }) {
  const [remaining, setRemaining] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const intervalRef = useRef(null);
  const remainingRef = useRef(remaining);
  const audioRef = useRef(null);
  const alarmTimeoutRef = useRef(null);
  const toastShownRef = useRef(false); 
  const { language } = useOutletContext();

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    if (!routine?.id) return;
    const blocksRef = collection(db, "routines", routine.id, "blocks");
    const q = query(blocksRef, orderBy("order", "asc"));
    const unsub = onSnapshot(q, snapshot => {
      const b = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlocks(b);
    });
    return () => unsub();
  }, [routine?.id]);

  useEffect(() => {
    if (!routine?.id) return;

    const routineRef = doc(db, "routines", routine.id);
    const unsub = onSnapshot(routineRef, snap => {
      const data = snap.data();
      if (!data) return;

      let seconds = Number(data.remainingSeconds ?? 0);

      if (blocks.length > 0 && (seconds === 0 || seconds === null)) {
        seconds = blocks[routine.currentBlockIndex]?.duration ?? 0;
      }

      if (data.isRunning && data.blockStartedAt && data.remainingSeconds !== null) {
        const startedAt = data.blockStartedAt.toMillis
          ? data.blockStartedAt.toMillis()
          : data.blockStartedAt.toDate().getTime();

        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);

        if (elapsed > 0) {
          seconds = Math.max(seconds - elapsed, 0);
        }
      }

      setRemaining(seconds);
      remainingRef.current = seconds;
    });

    return () => unsub();
  }, [routine?.id, blocks, routine.currentBlockIndex]);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!routine?.id || !routine.isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const playSound = () => {
      if (!audioUnlocked) return;

      const settings = getSettings();
      const soundFile = ["alarm1","alarm2","alarm3","alarm4"].includes(settings.sound)
        ? settings.sound
        : "alarm1";

      stopAlarm();

      const audio = new Audio(`/sounds/${soundFile}.mp3`);
      audio.volume = settings.volume / 100;
      audio.loop = settings.repeat;

      audioRef.current = audio;

      audio.play().catch(e => console.log("Audio bloqueado", e));

      alarmTimeoutRef.current = setTimeout(() => {
        stopAlarm();
      }, 30000);
    };

    const tick = async () => {
      let seconds = remainingRef.current;
      if (seconds <= 1) {
        playSound();
        await advanceBlock(routine.id);

        const routineRef = doc(db, "routines", routine.id);
        const rSnap = await getDoc(routineRef);
        const rData = rSnap.data();

        if (!rData?.isRunning || !rData.remainingSeconds) {
          setRemaining(0);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return;
        }

        remainingRef.current = rData.remainingSeconds;
        setRemaining(rData.remainingSeconds);
      } else {
        seconds = seconds - 1;
        remainingRef.current = seconds;
        setRemaining(seconds);
      }
    };

    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [routine?.id, routine.isRunning, audioUnlocked]);

  const currentBlock = blocks[routine.currentBlockIndex] || null;

  const handleStart = async () => {
    setAudioUnlocked(true);

    const routineRef = doc(db, "routines", routine.id);

    const runningRoutinesQuery = query(
      collection(db, "routines"),
      where("uid", "==", routine.uid),
      where("isRunning", "==", true)
    );

    const runningSnap = await getDocs(runningRoutinesQuery);

    if (!routine.isRunning && !runningSnap.empty) {
      if (!toastShownRef.current) {
        toast.warn(
        language === "es" 
          ? "Otra rutina está corriendo. Pausa esa primero para continuar." 
          : "Another routine is running. Pause it first to continue.",
          {
            position: "bottom-center",
            autoClose: 3000,
            pauseOnHover: true,
            theme: "dark",
            toastId: "routine-conflict",
            style: {
              textAlign: "center",
              padding: "16px 24px",
              fontSize: "16px",
            },
          }
        );
        toastShownRef.current = true;
      }
      return;
    }

    const startFromZero = remaining === 0 || routine.currentBlockIndex === null;

    if (startFromZero) {
      await startRoutine(routine.id, routine.uid);
    } else {
      await updateDoc(routineRef, {
        isRunning: true,
        blockStartedAt: new Date()
      });
    }
  };

  const handlePause = async () => {
    setAudioUnlocked(true);
    stopAlarm();
    toastShownRef.current = false;

    const routineRef = doc(db, "routines", routine.id);
    await updateDoc(routineRef, {
      isRunning: false,
      remainingSeconds: remainingRef.current
    });

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleReset = () => {
    setAudioUnlocked(true);
    stopAlarm();
    toastShownRef.current = false;
    resetRoutine(routine.id);
  };

  const formatTime = totalSeconds => {
    const seconds = Number(totalSeconds) || 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, []);

  return (
    <div style={{ backgroundColor: currentBlock?.color || "#dcfce7" }} className="mt-4 p-4 rounded-2xl flex flex-col gap-4 transition-colors duration-300 [box-shadow:var(--component-shadow-soft)]">
      {currentBlock && <div className="text-center font-semibold text-lg">{currentBlock.title}</div>}
      <div className="text-2xl font-bold text-center" style={{ color: currentBlock?.color ? "#000" : "#111" }}>
        {formatTime(remaining)}
      </div>
      {currentBlock?.note && <textarea value={currentBlock.note} readOnly className="w-full border rounded-xl p-3 bg-(--input-color) text-(--input-text) shadow-inner border-(--bg-color)/50 [box-shadow:var(--component-shadow-soft)] resize-y focus:outline-none" />}
      <div className="flex gap-4 justify-center mt-2">
        <button
          onClick={handleStart}
          className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-md flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-pointer"
        >
          <img src="/icons/Play-button.png" alt="Play" className="w-8 h-8" />
        </button>
        <button
          onClick={handlePause}
          className="w-16 h-16 bg-yellow-500 hover:bg-yellow-600 rounded-full shadow-md flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-pointer"
        >
          <img src="/icons/Pause-button.png" alt="Pause" className="w-8 h-8" />
        </button>
        <button
          onClick={handleReset}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full shadow-md flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-pointer"
        >
          <img src="/icons/Reset-button.png" alt="Reset" className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

export default RoutinePlayer;