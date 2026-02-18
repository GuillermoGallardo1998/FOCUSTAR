// RoutineCard.jsx

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import RoutinePlayer from "./RoutinePlayer";
import RoutineBlocksEditor from "./RoutineBlocksEditor";

function RoutineCard({ id, routine, language }) {
  const [open, setOpen] = useState(false);

  // 🔹 Hook de dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  // 🔹 Estilo dinámico para animación
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border p-4 rounded bg-gray-50 flex flex-col gap-4"
    >
      {/* Nombre de la rutina */}
      <h3 className="font-semibold text-lg">{routine.name}</h3>

      {/* MOTOR DE EJECUCIÓN */}
      <RoutinePlayer routine={routine} />

      {/* Botón para abrir editor */}
      <button
        onClick={() => setOpen(!open)}
        className="text-blue-500 text-sm mt-2"
      >
        {open
          ? language === "es" ? "Cerrar" : "Close"
          : language === "es" ? "Editar bloques" : "Edit blocks"}
      </button>

      {/* Editor de bloques */}
      {open && (
        <RoutineBlocksEditor routineId={routine.id} language={language} />
      )}
    </div>
  );
}

export default RoutineCard;
