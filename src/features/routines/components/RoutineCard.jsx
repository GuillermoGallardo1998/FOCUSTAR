// features/routines/components/RoutineCard.jsx

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";
import RoutinePlayer from "./RoutinePlayer";
import RoutineBlocksEditor from "./RoutineBlocksEditor";

function RoutineCard({ routine, language, moveToFirst }) {
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(routine.name);

  const formatDate = (date) => {
    if (!date) return "";
    let d;
    if (date.seconds) d = new Date(date.seconds * 1000);
    else d = new Date(date);
    return d.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const saveName = async () => {
    if (!newName.trim()) return;

    try {
      const routineRef = doc(db, "routines", routine.id);
      await updateDoc(routineRef, {
        name: newName,
        updatedAt: new Date()
      });
      setEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const createdLabel = language === "es" ? "Creación" : "Creation";
  const updatedLabel = language === "es" ? "Últ. mod." : "Last updated";

  return (
    <div className="border border-(--text-color)/50 p-4 rounded-xl bg-(--bg-color) [box-shadow:var(--component-shadow)] flex flex-col gap-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex flex-col text-sm text-(--text-color)/70">
          <span>{createdLabel}: {formatDate(routine.createdAt)}</span>
          <span>{updatedLabel}: {formatDate(routine.updatedAt)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpen(!open)}
            className="w-9 h-9 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-120"
          >
            <img src="/icons/Edit.png" alt="Editar" className="w-7 h-7" />
          </button>
          <button
            onClick={() => moveToFirst(routine.id)}
            className="w-9 h-9 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-120"
          >
            <img src="/icons/Arrow.png" alt="Subir" className="w-7 h-7" />
          </button>
        </div>
      </div>
      {editingName ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveName();
          }}
          autoFocus
          className="font-bold text-xl bg-transparent border-b border-(--text-color) outline-none w-full wrap-break-word"
        />
      ) : (
        <h3
          onClick={() => setEditingName(true)}
          className="font-bold text-xl cursor-pointer text-shadow-(--text-shadow-strong) min-w-0 wrap-break-word"
        >
          {routine.name}
        </h3>
      )}
      <RoutinePlayer routine={routine} />
      {open && <RoutineBlocksEditor routineId={routine.id} language={language} />}
    </div>
  );
}

export default RoutineCard; 