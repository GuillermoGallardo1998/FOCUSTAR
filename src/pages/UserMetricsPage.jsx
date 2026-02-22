import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { db } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";

function UserMetricsPage() {
  const { language } = useOutletContext();

  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");

  // 🔥 Cargar listas en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "lists"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setLists(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // Crear lista
  const addList = async () => {
    if (!newListName.trim()) return;

    await addDoc(collection(db, "lists"), {
      name: newListName,
      color: newColor,
      tasks: []
    });

    setNewListName("");
  };

  // Eliminar lista
  const deleteList = async (id) => {
    await deleteDoc(doc(db, "lists", id));
  };

  // Agregar tarea
  const addTask = async (list) => {
    const updatedTasks = [
      ...list.tasks,
      { id: Date.now(), text: "", completed: false }
    ];

    await updateDoc(doc(db, "lists", list.id), {
      tasks: updatedTasks
    });
  };

  // Actualizar tarea
  const updateTask = async (list, taskId, field, value) => {
    const updatedTasks = list.tasks.map((task) =>
      task.id === taskId
        ? { ...task, [field]: value }
        : task
    );

    await updateDoc(doc(db, "lists", list.id), {
      tasks: updatedTasks
    });
  };

  // Eliminar tarea
  const deleteTask = async (list, taskId) => {
    const updatedTasks = list.tasks.filter(
      (task) => task.id !== taskId
    );

    await updateDoc(doc(db, "lists", list.id), {
      tasks: updatedTasks
    });
  };

  return (
    <div className="p-6 space-y-6">

      {/* Título */}
      <h1 className="text-3xl font-bold">
        {language === "es" ? "Listas PRO" : "Pro Task Lists"}
      </h1>

      {/* Crear lista */}
      <div className="flex flex-col sm:flex-row gap-3">

        <input
          type="text"
          placeholder={language === "es" ? "Nombre de la lista" : "List name"}
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          className="border rounded-xl p-3 flex-1"
        />

        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-12 h-12 rounded-full cursor-pointer"
        />

        <button
          onClick={addList}
          className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:opacity-90 transition"
        >
          {language === "es" ? "Agregar" : "Add"}
        </button>
      </div>

      {/* GRID RESPONSIVE */}
      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        2xl:grid-cols-4
        gap-6
      ">

        {lists.map((list) => {

          const completed = list.tasks.filter(t => t.completed).length;
          const total = list.tasks.length;
          const percent = total === 0 ? 0 : (completed / total) * 100;

          return (
            <div
              key={list.id}
              className="rounded-2xl p-5 space-y-4 shadow-md hover:scale-[1.02] duration-300 transition"
              style={{ backgroundColor: list.color + "15" }}
            >

              {/* Header */}
              <div className="flex justify-between items-center">

                <h2 className="font-semibold text-lg truncate">
                  {list.name}
                </h2>

                <button
                  onClick={() => deleteList(list.id)}
                  className="text-red-500 hover:opacity-70 transition"
                >
                  ✕
                </button>
              </div>

              {/* 📊 Barra de progreso */}
              <div className="space-y-1">

                <div className="flex justify-between text-xs font-medium">
                  <span>
                    {completed}/{total} {language === "es" ? "tareas" : "tasks"}
                  </span>
                  <span>
                    {Math.round(percent)}%
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: percent + "%",
                      backgroundColor: list.color
                    }}
                  />
                </div>

              </div>

              {/* Tareas */}
              <div className="space-y-2">

                {list.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-2 transition-all duration-300 ${
                      task.completed ? "task-completed-animation" : ""
                    }`}
                  >

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) =>
                        updateTask(
                          list,
                          task.id,
                          "completed",
                          e.target.checked
                        )
                      }
                    />

                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) =>
                        updateTask(
                          list,
                          task.id,
                          "text",
                          e.target.value
                        )
                      }
                      placeholder={
                        language === "es"
                          ? "Escribe tarea..."
                          : "Write task..."
                      }
                      className={`border rounded-lg p-2 flex-1 ${
                        task.completed
                          ? "line-through opacity-60"
                          : ""
                      }`}
                    />

                    <button
                      onClick={() =>
                        deleteTask(list, task.id)
                      }
                      className="text-red-400 hover:opacity-70 transition"
                    >
                      ✕
                    </button>

                  </div>
                ))}

              </div>

              {/* Botón agregar tarea */}
              <button
                onClick={() => addTask(list)}
                className="text-blue-600 text-sm font-medium hover:opacity-70 transition"
              >
                {language === "es"
                  ? "+ Agregar tarea"
                  : "+ Add task"}
              </button>

            </div>
          );
        })}

      </div>
    </div>
  );
}

export default UserMetricsPage;