// RoutineCard.jsx

import { useState } from "react";
import RoutinePlayer from "./RoutinePlayer";
import RoutineBlocksEditor from "./RoutineBlocksEditor";

function RoutineCard({ routine, language, moveToFirst }) {
  const [open, setOpen] = useState(false);

  // Función para formatear cualquier fecha en formato local según idioma
  const formatDate = (date) => {
    if (!date) return "";
    let d;
    // Firebase Timestamp
    if (date.seconds) d = new Date(date.seconds * 1000);
    else d = new Date(date);

    return d.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  // Etiquetas según idioma
  const createdLabel = language === "es" ? "Creación" : "Creation";
  const updatedLabel = language === "es" ? "Últ. mod." : "Last updated";

  return (
    <div className="border border-(--text-color)/50 p-4 rounded-xl bg-(--bg-color) [box-shadow:var(--component-shadow)] flex flex-col gap-4 relative">

      {/* Fechas y botón mover al inicio */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col text-sm text-(--text-color)/70">
          <span>{createdLabel}: {formatDate(routine.createdAt)}</span>
          <span>{updatedLabel}: {formatDate(routine.updatedAt)}</span>
        </div>

        <button
          onClick={() => moveToFirst(routine.id)}
          className="
            bg-(--text-color)
            rounded-full
            w-9 h-9
            flex items-center justify-center
            cursor-pointer
            transition-transform duration-200
            hover:scale-110
            active:scale-95
          "
        >
          <span
            className="
              w-0 h-0
              border-l-10 border-l-transparent
              border-r-10 border-r-transparent
              border-b-16 border-b-(--bg-color)
              translate-y-[-2px]
            "
          ></span>
        </button>
      </div>

      {/* Nombre de la rutina */}
      <h3 className="font-bold text-xl text-shadow-(--text-shadow-strong)">
        {routine.name}
      </h3>

      {/* Player de la rutina */}
      <RoutinePlayer routine={routine} />

      {/* Botón abrir/editar */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-(--text-color) text-(--bg-color) text-xl cursor-pointer border border-(--text-color)/50 rounded-xl p-1 [box-shadow:var(--component-shadow)] hover:bg-(--bg-color) hover:text-(--text-color) font-bold"
      >
        {open
          ? language === "es" ? "Cerrar" : "Close"
          : language === "es" ? "Editar Rutina" : "Edit Routine"}
      </button>

      {/* Editor de bloques */}
      {open && <RoutineBlocksEditor routineId={routine.id} language={language} />}
    </div>
  );
}

export default RoutineCard;