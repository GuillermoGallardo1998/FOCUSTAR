// features/routines/components/RoutineBlocksEditor.jsx

import { useEffect, useState, useRef} from "react";
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
import { toast } from "react-toastify";

function RoutineBlocksEditor({ routineId, language, onRoutineDeleted }) {
  const [blocks, setBlocks] = useState([]);

  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newColor, setNewColor] = useState("#1F3C88");

  const [newHours, setNewHours] = useState("");
  const [newMinutes, setNewMinutes] = useState("");
  const [newSeconds, setNewSeconds] = useState("");
  const colorInputRef = useRef(null);
  const MAX_BLOCKS = 20;
  
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

  const handleAddBlock = async () => {
    if (blocks.length >= MAX_BLOCKS) {
      toast.warn(
        language === "es"
          ? `No puedes agregar más de ${MAX_BLOCKS} bloques a esta rutina`
          : `You can't add more than ${MAX_BLOCKS} blocks to this routine`,
        { toastId: "block-limit" }
      );
      return;
    }

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

    await updateRoutineTimestamp(routineId);

    setBlocks((prev) => [
      ...prev,
      {
        id: createdBlockId,
        ...newBlock,
        editMode: false,
        editHours: Math.floor(totalSeconds / 3600),
        editMinutes: Math.floor((totalSeconds % 3600) / 60),
        editSeconds: totalSeconds % 60,
      },
    ]);

    setNewTitle("");
    setNewNote("");
    setNewColor("#1F3C88");
    setNewHours("");
    setNewMinutes("");
    setNewSeconds("");
  };

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

  const moveBlockUp = async (index) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    const updatedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
    setBlocks(updatedBlocks);
    await saveBlocksOrder(updatedBlocks);
  };


  const moveBlockDown = async (index) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    const updatedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
    setBlocks(updatedBlocks);
    await saveBlocksOrder(updatedBlocks);
  };

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
      <h4 className="text-xl font-bold tracking-tight text-shadow">
        {language === "es" ? "Bloques de enfoque" : "Focus Blocks"}
      </h4>
      <p className="text-sm opacity-70">
        {language === "es"
          ? `Bloques ${blocks.length} / ${MAX_BLOCKS}`
          : `Blocks ${blocks.length} / ${MAX_BLOCKS}`}
      </p>
      {blocks.map((block) => (
        <div
          key={block.id}
          className="rounded-2xl p-5 transition-all duration-300 ease-in-out [box-shadow:var(--component-shadow-soft)] hover:[box-shadow:var(--component-shadow)]"
          style={{
            backgroundColor: block.color,
          }}
        >
          <div className="flex flex-col items-center gap-4">
            {block.editMode ? (
              <div className="flex flex-col gap-4 w-full">
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
                  className="border border-(--bg-color)/50 rounded-xl bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 text-lg font-semibold [box-shadow:var(--component-shadow-soft)] focus:outline-none"
                  placeholder="Título"
                />
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
                    className="border border-(--bg-color)/50 rounded-xl w-full bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
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
                    className="border border-(--bg-color)/50 rounded-xl w-full bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
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
                    className="border border-(--bg-color)/50 rounded-xl w-full bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
                    placeholder="SS"
                  />
                </div>
                <textarea
                  rows={1}
                  value={block.note || ""}
                  onChange={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id ? { ...b, note: e.target.value } : b
                      )
                    );
                  }}
                  className="min-h-12 border border-(--bg-color)/50 rounded-xl w-full bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 resize-none [box-shadow:var(--component-shadow-soft)] focus:outline-none"
                  placeholder="Nota"
                />
                <div className="flex gap-2 w-full">
                  <div
                    onClick={() => colorInputRef.current.click()}
                    className="flex-1 flex items-center justify-center gap-2 p-2 border bg-(--text-color) border-(--bg-color)/50 rounded-xl font-semibold text-[16px] text-(--bg-color) cursor-pointer [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-in-out hover:bg-(--bg-color) hover:text-(--text-color)"
                  >
                    <label className="select-none hidden sm:block">
                      {language === "es" ? "Tema" : "Theme"}
                    </label>
                    <input
                      ref={colorInputRef}
                      type="color"
                      value={block.color}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((b) =>
                            b.id === block.id ? { ...b, color: e.target.value } : b
                          )
                        )
                      }
                      className="opacity-0 absolute"
                    />
                    <div
                      className="color-circle w-12 h-12"
                      style={{
                        backgroundColor: block.color,
                        borderRadius: "9999px",
                        border: "2px solid var(--bg-color)",
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleSave(block)}
                    className="flex-1 px-4 py-2 border border-(--bg-color)/50 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) text-lg [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer"
                  >
                    {language === "es" ? "Guardar" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col gap-2 w-full p-4">
                <div className="flex w-full items-center justify-between gap-2 rounded-xl">
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={block.completed || false}
                      onChange={() => handleToggleCompleted(block.id, block.completed)}
                      className="w-6 h-6 rounded-full appearance-none cursor-pointer transition-all duration-300 border-2 border-(--text-color) bg-(--text-color) checked:bg-transparent checked:scale-90 [box-shadow:var(--component-shadow-soft)]"
                    />
                    <p
                      className={`flex-1 min-w-0 text-lg font-bold text-(--bg-color) wrap-break-word whitespace-normal ${
                        block.completed ? "line-through" : ""
                      }`}
                    >
                      {block.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <button
                      onClick={() => moveBlockUp(blocks.findIndex(b => b.id === block.id))}
                      className="w-8 h-10 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-120"
                    >
                      <img src="/icons/Arrow.png" alt="Up" className="w-7 h-7" />
                    </button>
                    <button
                      onClick={() => moveBlockDown(blocks.findIndex(b => b.id === block.id))}
                      className="w-8 h-10 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-120 rotate-180"
                    >
                      <img src="/icons/Arrow.png" alt="Down" className="w-7 h-7" />
                    </button>
                  </div>
                </div>
                <p className="text-(--bg-color) font-bold">{formatTime(block.duration)}</p>
                {block.note && (
                  <textarea
                    value={block.note}
                    readOnly
                    className="w-full min-h-12 border border-(--bg-color)/50 rounded-xl p-2 bg-(--input-color) text-(--input-text) [box-shadow:var(--component-shadow-soft)] resize-y focus:outline-none"
                  />
                )}
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
                    onClick={() => handleDeleteBlock(block.id)}
                    className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full shadow-md flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <img src="/icons/Delet.png" alt="Delete" className="w-6 h-6" />
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
          className="border border-(--bg-color)/50 rounded-xl bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 text-lg font-semibold [box-shadow:var(--component-shadow-soft)] focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            placeholder="HH"
            max="100"
            value={newHours}
            onChange={(e) => 
              setNewHours(Math.min(100, Number(e.target.value)))
            }
            className="border border-(--bg-color)/50 rounded-xl w-full bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
          />
          <input
            type="number"
            min="0"
            placeholder="MM"
            max="59"
            value={newMinutes}
            onChange={(e) =>
              setNewMinutes(Math.min(59, Number(e.target.value)))
            }
            className="border border-(--bg-color)/50 rounded-xl w-full bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
          />
          <input
            type="number"
            min="0"
            placeholder="SS"
            max="59"
            value={newSeconds}
            onChange={(e) =>
              setNewSeconds(Math.min(59, Number(e.target.value)))
            }
            className="border border-(--bg-color)/50 rounded-xl w-full bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 font-semibold text-center [box-shadow:var(--component-shadow-soft)] focus:outline-none flex-1"
          />
        </div>
        <textarea
          rows={1}
          placeholder="Nota"
          value={newNote}
          onChange={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";

            setNewNote(e.target.value);
          }}
          className="min-h-12 border border-(--bg-color)/50 rounded-xl w-full bg-(--input-color) text-(--input-text) placeholder:text-(--input-text)/50 transition-all duration-300 ease-in-out p-3 resize-none [box-shadow:var(--component-shadow-soft)] focus:outline-none"
        />
        <div className="flex gap-2 w-full">
          <div
            onClick={() => colorInputRef.current.click()}
            className="flex-1 flex items-center justify-center gap-2 p-2 border border-(--bg-color)/50 rounded-xl font-semibold text-[16px] text-(--bg-color) cursor-pointer [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color)"
          >
            <label className="select-none text-lg cursor-pointer hidden sm:block">
              {language === "es" ? "Tema" : "Theme"}
            </label>
            <input
              ref={colorInputRef}
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="opacity-0 absolute cursor-pointer"
            />
            <div
              className="color-circle w-12 h-12 cursor-pointer"
              style={{
                backgroundColor: newColor,
                borderRadius: "9999px",
                border: "2px solid var(--bg-color)",
              }}
            />
          </div>
          <button
            onClick={handleAddBlock}
            className={`flex-1 px-4 py-2 border border-(--bg-color)/50 rounded-xl font-semibold bg-(--text-colo) text-(--bg-color) text-lg transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer
              ${blocks.length >= MAX_BLOCKS ? "opacity-40" : "opacity-100"}
            `}
          >
            {language === "es" ? "Agregar bloque" : "Add block"}
          </button>
        </div>
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