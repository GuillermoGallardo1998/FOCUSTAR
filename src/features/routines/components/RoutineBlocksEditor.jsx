// RoutineBlocksEditor.jsx

import { useEffect, useState } from "react";
import {
  createBlock,
  getRoutineBlocks,
  toggleBlockCompleted,
  updateBlock,
  deleteBlock,
  resetRoutine,
  deleteRoutine,
  updateRoutineTimestamp
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

  // 🔹 ACTUALIZAR FECHA DE ÚLTIMA MODIFICACIÓN
  await updateRoutineTimestamp(routineId);

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

    // 🔹 ESTA ES LA LÍNEA QUE FALTABA
    await updateRoutineTimestamp(routineId);

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

// Mover bloque hacia arriba
const moveBlockUp = async (index) => {
  if (index === 0) return; // Ya está en la primera posición
  const newBlocks = [...blocks];
  [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
  const updatedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
  setBlocks(updatedBlocks);
  await saveBlocksOrder(updatedBlocks);
};

// Mover bloque hacia abajo
const moveBlockDown = async (index) => {
  if (index === blocks.length - 1) return; // Ya está en la última posición
  const newBlocks = [...blocks];
  [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
  const updatedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
  setBlocks(updatedBlocks);
  await saveBlocksOrder(updatedBlocks);
};

  // 🔹 Guardar orden actualizado en Firebase
const saveBlocksOrder = async (updatedBlocks) => {
  try {
    for (const block of updatedBlocks) {
      await updateBlock(routineId, block.id, { order: block.order });
    }
  } catch (error) {
    console.error("Error guardando el orden de los bloques:", error);
  }
};

  return (
    <div className="mt-2 border-t pt-6 flex flex-col gap-6">

      <h4 className="text-xl font-bold tracking-tight">
        {language === "es" ? "Bloques de enfoque" : "Focus Blocks"}
      </h4>

      {blocks.map((block) => (
        <div
          key={block.id}
          className="rounded-2xl p-6 transition-all duration-300 ease-in-out [box-shadow:var(--component-shadow-soft)] hover:[box-shadow:var(--component-shadow)]"
          style={{
            backgroundColor: block.color,
          }}
        >



          <div className="flex flex-col items-center gap-4">
            {block.editMode ? (
              <div className="flex flex-col gap-4 w-full">
                {/* Título */}
                <input
                  type="text"
                  value={block.title}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id ? { ...b, title: e.target.value } : b
                      )
                    )
                  }
                  className="border border-(--bg-color)/50 rounded-xl bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p-3 text-lg font-semibold [box-shadow:var(--component-shadow-soft)] focus:outline-none"
                  placeholder="Título"
                />

                {/* Horas, minutos, segundos */}
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    value={block.editHours}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b) =>
                          b.id === block.id ? { ...b, editHours: Number(e.target.value) } : b
                        )
                      )
                    }
                    className="border border-(--bg-color)/50 rounded-xl w-full bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
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
                    className="border border-(--bg-color)/50 rounded-xl w-full bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
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
                    className="border border-(--bg-color)/50 rounded-xl w-full bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
                    placeholder="SS"
                  />
                </div>

                {/* Nota */}
                <textarea
                  value={block.note || ""}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id ? { ...b, note: e.target.value } : b
                      )
                    )
                  }
                  className="border border-(--bg-color)/50 rounded-xl w-full bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p p-3 [box-shadow:var(--component-shadow-soft)] focus:outline-none"
                  placeholder="Nota"
                ></textarea>

                {/* Selector de color */}
                <input
                  type="color"
                  value={block.color}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id ? { ...b, color: e.target.value } : b
                      )
                    )
                  }
                  className="w-full h-10 border border-(--bg-color)/50 cursor-pointer [box-shadow:var(--component-shadow-soft)]"
                />

                {/* Botón Guardar */}
                <button
                  onClick={() => handleSave(block)}
                  className="px-4 py-2 border border-(--bg-color)/50 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) text-lg [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer"
                >
                  {language === "es" ? "Guardar" : "Save"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                {/* Checkbox y título */}
                <div className="flex gap-3 items-start w-full">
                  <input
                    type="checkbox"
                    checked={block.completed || false}
                    onChange={() => handleToggleCompleted(block.id, block.completed)}
                    className="w-5 h-5 accent-(--bg-color) border border-(--bg-color)/50 rounded mt-1 shrink-0"
                  />
                  <p
                    className={`flex-1 min-w-0 text-lg font-bold text-(--bg-color) wrap-break-word whitespace-normal ${
                      block.completed ? "line-through" : ""
                    }`}
                  >
                    {block.title}
                  </p>
                </div>

                {/* Duración */}
                <p className="text-(--bg-color) font-semibold">{formatTime(block.duration)}</p>

                {/* Nota */}
                {block.note && (
                  <textarea
                    value={block.note}
                    readOnly
                    className="w-full border border-(--bg-color)/50 rounded-xl p-2 bg-(--text-color) text-(--bg-color) [box-shadow:var(--component-shadow-soft)] resize-y focus:outline-none"
                  />
                )}

                {/* Botones subir/bajar */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => moveBlockUp(blocks.findIndex(b => b.id === block.id))}
                    className="px-4 py-2 border border-(--bg-color)/50 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) text-lg [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer flex-1"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveBlockDown(blocks.findIndex(b => b.id === block.id))}
                    className="px-4 py-2 border border-(--bg-color)/50 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) text-lg [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer flex-1"
                  >
                    ↓
                  </button>
                </div>

                {/* Botones Editar y Eliminar */}
                <div className="flex gap-3 mt-2">
                  <button
                    className="px-4 py-2 border border-(--bg-color)/50 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) text-lg [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer flex-1"
                    onClick={() =>
                      setBlocks((prev) =>
                        prev.map((b) =>
                          b.id === block.id ? { ...b, editMode: true } : b
                        )
                      )
                    }
                  >
                    {language === "es" ? "Editar" : "Edit"}
                  </button>

                  <button
                    className="bg-red-600 hover:bg-red-700 text-[#EDEDED] text-xl px-4 py-2 rounded-xl [box-shadow:var(--component-shadow-soft)] cursor-pointer font-semibold text-shadow-(--text-shadow-strong) flex-1"
                    onClick={() => handleDeleteBlock(block.id)}
                  >
                    {language === "es" ? "Eliminar" : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="inverted-card gap-3 flex flex-col bg-(--text-color) rounded-2xl p-5 border transition-all duration-300 ease-in-out border-(--text-color) [box-shadow:var(--component-shadow-soft)]">
        <input
          type="text"
          placeholder="Título"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border border-(--bg-color)/50 rounded-xl bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p-3 text-lg font-semibold [box-shadow:var(--component-shadow-soft)] focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="HH"
            max="100"
            value={newHours}
            onChange={(e) => 
              setNewHours(Math.min(100, Number(e.target.value)))
            }
            className="border border-(--bg-color)/50 rounded-xl w-full bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
          />
          <input
            type="number"
            placeholder="MM"
            max="59"
            value={newMinutes}
            onChange={(e) =>
              setNewMinutes(Math.min(59, Number(e.target.value)))
            }
            className="border border-(--bg-color)/50 rounded-xl w-full bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
          />
          <input
            type="number"
            placeholder="SS"
            max="59"
            value={newSeconds}
            onChange={(e) =>
              setNewSeconds(Math.min(59, Number(e.target.value)))
            }
            className="border border-(--bg-color)/50 rounded-xl w-full bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
          />
        </div>
        <textarea
          placeholder="Nota"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="border border-(--bg-color)/50 rounded-xl w-full bg-(--text-color) text-(--bg-color) transition-all duration-300 ease-in-out p p-3 [box-shadow:var(--component-shadow-soft)] focus:outline-none"
        ></textarea>
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-full h-10 border border-(--bg-color)/50 cursor-pointer [box-shadow:var(--component-shadow-soft)]"
        />
        <button 
          onClick={handleAddBlock}
          className="px-4 py-2 border border-(--bg-color)/50 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) text-lg [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer"
        >
          {language === "es" ? "Agregar bloque" : "Add block"}
        </button>
      </div>

      <button
        onClick={handleDeleteRoutine}
        className="bg-red-600 hover:bg-red-700 text-[#EDEDED] text-xl px-4 py-2 rounded-2xl [box-shadow:var(--component-shadow-soft)] cursor-pointer font-bold text-shadow-(--text-shadow-strong)"
      >
        {language === "es"
          ? "Eliminar rutina"
          : "Delete routine"}
      </button>
    </div>
  );
}

export default RoutineBlocksEditor;