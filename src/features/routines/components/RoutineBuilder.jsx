// RoutineBuilder.jsx

import { useState } from "react";
import { createRoutine } from "../services/routinesService";

function RoutineBuilder({ userUid, language }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;

    await createRoutine(userUid, name.trim());
    setMessage(language === "es" ? "Rutina creada" : "Routine created");
    setName("");
  };

  return (
    <div className=" border border-(--text-color)/50 p-6 rounded-xl flex flex-col gap-6 [box-shadow:var(--component-shadow)]">
      <h2 className="text-2xl text-center font-bold text-shadow-(--text-shadow-strong)">
        {language === "es" ? "Crear nueva rutina" : "Create new routine"}
      </h2>
      <input
        type="text"
        placeholder={language === "es" ? "Nombre de la rutina" : "Routine name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 rounded-xl bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow-soft)] focus:outline-none"
      />
      <button
        onClick={handleCreate}
        className="px-4 py-2 text-lg border-2 border-(--text-color)/50 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer hover:-translate-y-0.5"
      >
        {language === "es" ? "Crear" : "Create"}
      </button>

      {message && <p className="text-(--text-color) text-shadow-(--text-shadow-strong)">{message}</p>}
    </div>
  );
}

export default RoutineBuilder;