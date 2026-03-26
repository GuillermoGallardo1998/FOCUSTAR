// features/routines/components/RoutineBuilder.jsx

import { useState } from "react";
import { toast } from "react-toastify";
import { createRoutine } from "../services/routinesService";

function RoutineBuilder({ userUid, language, routines, MAX_ROUTINES }) {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;

    if (routines.length >= MAX_ROUTINES) {
      toast.warn(
        language === "es"
          ? `No puedes crear más de ${MAX_ROUTINES} rutinas`
          : `You can't create more than ${MAX_ROUTINES} routines`,
        { toastId: "routine-limit" }
      );
      return;
    }

    await createRoutine(userUid, name.trim());
    setName("");
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-5xl text-center font-bold text-shadow">
        {language === "es" ? "Crear rutina" : "Create routine"}
      </h2>
      <p className="text-(--text-color)/70 text-center">
        {language === "es"
          ? `Puedes crear hasta ${MAX_ROUTINES} rutinas. Cada rutina permite hasta un máximo de 20 bloques de enfoque.`
          : `You can create up to ${MAX_ROUTINES} routines. Each routine allows up to 20 focus blocks.`}
      </p>
      <div className="flex justify-center items-center gap-2">
        <span>
          {language === "es" ? "Rutinas creadas:" : "Routines created:"}
        </span>
        <span className="px-3 py-1 bg-(--bg-color) border-2 border-(--text-color) rounded-lg font-semibold">
          {routines.length} / {MAX_ROUTINES}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full max-w-2xl pb-12 mx-auto">
        <input
          type="text"
          placeholder={language === "es" ? "Nombre de la rutina" : "Routine name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="flex-1 p-3 w-full rounded-xl bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow-soft)] focus:outline-none"
        />
        <button
          onClick={handleCreate}
          className={`px-6 py-3 w-full sm:w-auto border-2 border-(--text-color)/50 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer hover:-translate-y-0.5 ${
            routines.length >= MAX_ROUTINES ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {language === "es" ? "Crear" : "Create"}
        </button>
      </div>
    </div>
  );
}

export default RoutineBuilder;