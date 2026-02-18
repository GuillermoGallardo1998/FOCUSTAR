// RoutineBlocksEditor.jsx

import { useEffect, useState } from "react";
import {
  createBlock,
  getRoutineBlocks,
  toggleBlockCompleted,
  updateBlock,
  deleteBlock,
  resetRoutine,
  deleteRoutine
} from "../services/routinesService";

function RoutineBlocksEditor({ routineId, language, onRoutineDeleted }) {
  const [blocks, setBlocks] = useState([]);

  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newColor, setNewColor] = useState("#2563eb");

  const [newHours, setNewHours] = useState("");
  const [newMinutes, setNewMinutes] = useState("");
  const [newSeconds, setNewSeconds] = useState("");

  // 🔹 Formatear segundos a HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  // 🔹 Cargar bloques
  useEffect(() => {
    if (!routineId) return;

    const fetchBlocks = async () => {
      const data = await getRoutineBlocks(routineId);
      setBlocks(
        data.map((b) => ({
          ...b,
          editMode: false,
          editHours: Math.floor(b.duration / 3600),
          editMinutes: Math.floor((b.duration % 3600) / 60),
          editSeconds: b.duration % 60,
        }))
      );
    };

    fetchBlocks();
  }, [routineId]);

  // 🔹 Agregar bloque
  const handleAddBlock = async () => {
    if (!newTitle) return;

    const totalSeconds =
      (Number(newHours) || 0) * 3600 +
      (Number(newMinutes) || 0) * 60 +
      (Number(newSeconds) || 0);

    if (totalSeconds <= 0) return;

    const newBlock = {
      order: blocks.length,
      title: newTitle,
      type: "focus",
      duration: totalSeconds,
      note: newNote,
      color: newColor,
      completed: false,
    };

    const createdBlockId = await createBlock(routineId, newBlock);

    setBlocks((prev) => [
      ...prev,
      {
        id: createdBlockId,
        ...newBlock,
        editMode: false,
        editHours: 0,
        editMinutes: 0,
        editSeconds: 0,
      },
    ]);

    setNewTitle("");
    setNewNote("");
    setNewColor("#2563eb");
    setNewHours("");
    setNewMinutes("");
    setNewSeconds("");
  };

  // 🔹 Guardar bloque editado
  const handleSave = async (block) => {
    const totalSeconds =
      (Number(block.editHours) || 0) * 3600 +
      (Number(block.editMinutes) || 0) * 60 +
      (Number(block.editSeconds) || 0);

    if (totalSeconds <= 0) return;

    const updatedData = {
      title: block.title ?? "Sin título",
      type: "focus",
      duration: totalSeconds,
      note: block.note ?? "",
      color: block.color ?? "#2563eb",
    };

    await updateBlock(routineId, block.id, updatedData);
    await resetRoutine(routineId);

    alert(
      language === "es"
        ? "Se reinició el contador porque se editó la lista."
        : "The counter has been reset because the list was edited."
    );

    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id
          ? {
              ...b,
              ...updatedData,
              editMode: false,
            }
          : b
      )
    );
  };

  const handleToggleCompleted = async (blockId, current) => {
    await toggleBlockCompleted(routineId, blockId, !current);
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, completed: !current } : b
      )
    );
  };

  const handleDeleteBlock = async (blockId) => {
    await deleteBlock(routineId, blockId);
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const handleDeleteRoutine = async () => {
    if (
      !confirm(
        language === "es"
          ? "¿Seguro que quieres eliminar toda la rutina?"
          : "Are you sure you want to delete the entire routine?"
      )
    )
      return;

    await deleteRoutine(routineId);
    onRoutineDeleted?.();
  };

  return (
    <div className="mt-6 border-t pt-6 flex flex-col gap-6">

      <h4 className="text-xl font-bold tracking-tight">
        {language === "es" ? "Bloques" : "Blocks"}
      </h4>

      {/* LISTA DE BLOQUES */}
      {blocks.map((block) => (
        <div
          key={block.id}
          className="inverted-card rounded-2xl shadow-md p-5 transition-all duration-200 hover:shadow-lg"
          style={{
            borderLeft: `6px solid ${block.color}`,
          }}
        >
          <div className="flex justify-between items-start gap-4">

            {/* CONTENIDO */}
            {block.editMode ? (
              <div className="flex flex-col gap-3 w-full">

                <input
                  type="text"
                  value={block.title}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id
                          ? { ...b, title: e.target.value }
                          : b
                      )
                    )
                  }
                  className="border rounded-xl p-3 text-lg font-semibold focus:outline-none"
                  placeholder="Título"
                />

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={block.editHours}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b) =>
                          b.id === block.id
                            ? { ...b, editHours: e.target.value }
                            : b
                        )
                      )
                    }
                    className="border rounded-xl p-3 w-20 text-center"
                    placeholder="HH"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={block.editMinutes}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b) =>
                          b.id === block.id
                            ? { ...b, editMinutes: Math.min(59, e.target.value) }
                            : b
                        )
                      )
                    }
                    className="border rounded-xl p-3 w-20 text-center"
                    placeholder="MM"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={block.editSeconds}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b) =>
                          b.id === block.id
                            ? { ...b, editSeconds: Math.min(59, e.target.value) }
                            : b
                        )
                      )
                    }
                    className="border rounded-xl p-3 w-20 text-center"
                    placeholder="SS"
                  />
                </div>

                <input
                  type="text"
                  value={block.note || ""}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id
                          ? { ...b, note: e.target.value }
                          : b
                      )
                    )
                  }
                  className="border rounded-xl p-3"
                  placeholder="Nota"
                />

                <input
                  type="color"
                  value={block.color}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id
                          ? { ...b, color: e.target.value }
                          : b
                      )
                    )
                  }
                  className="w-14 h-10 rounded-lg cursor-pointer"
                />

                <button onClick={() => handleSave(block)}>
                  {language === "es" ? "Guardar" : "Save"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={block.completed || false}
                    onChange={() =>
                      handleToggleCompleted(block.id, block.completed)
                    }
                    className="w-5 h-5"
                    style={{ accentColor: "var(--bg-color)" }}
                  />

                  <p
                    className={`text-lg font-bold ${
                      block.completed ? "line-through opacity-50" : ""
                    }`}
                  >
                    {block.title}
                  </p>
                </div>

                <p className="text-sm font-mono opacity-70">
                  {formatTime(block.duration)}
                </p>

                {block.note && (
                  <p className="text-sm opacity-60">
                    {block.note}
                  </p>
                )}
              </div>
            )}

            {/* BOTONES */}
            {!block.editMode && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id
                          ? { ...b, editMode: true }
                          : b
                      )
                    )
                  }
                >
                  {language === "es" ? "Editar" : "Edit"}
                </button>

                <button
                  onClick={() => handleDeleteBlock(block.id)}
                >
                  {language === "es" ? "Eliminar" : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* CREAR BLOQUE */}
      <div className="inverted-card rounded-2xl p-5 shadow-inner flex flex-col gap-3">

        <input
          type="text"
          placeholder="Título"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border rounded-xl p-3 text-lg font-semibold"
        />

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="HH"
            value={newHours}
            onChange={(e) => setNewHours(e.target.value)}
            className="border rounded-xl p-3 w-20 text-center"
          />
          <input
            type="number"
            placeholder="MM"
            max="59"
            value={newMinutes}
            onChange={(e) =>
              setNewMinutes(Math.min(59, e.target.value))
            }
            className="border rounded-xl p-3 w-20 text-center"
          />
          <input
            type="number"
            placeholder="SS"
            max="59"
            value={newSeconds}
            onChange={(e) =>
              setNewSeconds(Math.min(59, e.target.value))
            }
            className="border rounded-xl p-3 w-20 text-center"
          />
        </div>

        <input
          type="text"
          placeholder="Nota"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="border rounded-xl p-3"
        />

        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-14 h-10 rounded-lg cursor-pointer"
        />

        <button onClick={handleAddBlock}>
          {language === "es" ? "Agregar bloque" : "Add block"}
        </button>
      </div>

      <button
        onClick={handleDeleteRoutine}
        className="main-button"
      >
        {language === "es"
          ? "Eliminar toda la rutina"
          : "Delete entire routine"}
      </button>

    </div>
  );

}

export default RoutineBlocksEditor;
