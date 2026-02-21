// RoutineCard.jsx

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import RoutinePlayer from "./RoutinePlayer";
import RoutineBlocksEditor from "./RoutineBlocksEditor";

function RoutineCard({ id, routine, language }) {
  const [open, setOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="border border-(--text-color)/50 p-4 rounded-xl bg-(--bg-color) [box-shadow:var(--component-shadow)] flex flex-col gap-4 relative"
    >
      <div
        {...listeners}
        className="text-xl cursor-grab active:cursor-grabbing text-(--text-color) absolute top-4 right-4"
      >
        ⋮⋮
      </div>
      <h3 className="font-bold text-xl text-shadow-(--text-shadow-strong)">{routine.name}</h3>

      <RoutinePlayer routine={routine} />

      <button
        onClick={() => setOpen(!open)}
        className="bg-(--text-color) text-(--bg-color) text-xl cursor-pointer border border-(--text-color)/50 rounded-xl p-1 [box-shadow:var(--component-shadow)] hover:bg-(--bg-color) hover:text-(--text-color) font-bold"
      >
        {open
          ? language === "es" ? "Cerrar" : "Close"
          : language === "es" ? "Editar Rutina" : "Edit Routine"}
      </button>

      {open && (
        <RoutineBlocksEditor routineId={routine.id} language={language} />
      )}
    </div>
  );
}

export default RoutineCard;
