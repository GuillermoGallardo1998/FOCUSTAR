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
    <div className="border p-4 rounded flex flex-col gap-4">
      <h2 className="text-xl font-bold">
        {language === "es" ? "Crear nueva rutina" : "Create new routine"}
      </h2>

      <input
        type="text"
        placeholder={language === "es" ? "Nombre de la rutina" : "Routine name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />

      <button
        onClick={handleCreate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {language === "es" ? "Crear" : "Create"}
      </button>

      {message && <p className="text-green-500">{message}</p>}
    </div>
  );
}

export default RoutineBuilder;
