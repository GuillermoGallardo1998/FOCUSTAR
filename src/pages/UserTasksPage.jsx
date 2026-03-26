// pages/UserTasksPage.jsx

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../services/firebaseConfig";
import { query, where, collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserTasksPage() {
  const { language } = useOutletContext();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newColor, setNewColor] = useState("#1F3C88");
  const [editingListId, setEditingListId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedColor, setEditedColor] = useState("#1F3C88");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const MAX_TASKS = 15;
  const MAX_LISTS = 20;

  useEffect(() => {
    let unsubscribe;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "lists"),
          where("userId", "==", user.uid)
        );
        unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          const ordered = data.sort(
            (a, b) => (a.position || 0) - (b.position || 0)
          );
          setLists(ordered);
        });
      } else {
        setLists([]);
      }
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const addList = async () => {
    if (!newListName.trim()) return;

    if (lists.length >= MAX_LISTS) {
      toast.warn(
        language === "es"
          ? `No puedes crear más de ${MAX_LISTS} listas`
          : `You can't create more than ${MAX_LISTS} lists`,
        { toastId: "list-limit" }
      );
      return;
    }

    const maxPosition =
      lists.length > 0
        ? Math.max(...lists.map(l => l.position || 0))
        : 0;

    await addDoc(collection(db, "lists"), {
      name: newListName,
      color: newColor,
      tasks: [],
      position: maxPosition + 1,
      userId: auth.currentUser.uid
    });

    setNewListName("");
  };

  const deleteList = async (id) => {
    await deleteDoc(doc(db, "lists", id));
  };

  const confirmDelete = async () => {
    if (!listToDelete) return;
    await deleteList(listToDelete.id);
    setShowDeleteModal(false);
    setListToDelete(null);
  };

  const startEdit = (list) => {
    setEditingListId(list.id);
    setEditedName(list.name);
    setEditedColor("#1F3C88");
  };

  const saveEdit = async (id) => {
    if (!editedName.trim()) return;
    await updateDoc(doc(db, "lists", id), {
      name: editedName,
      color: editedColor
    });
    setEditingListId(null);
  };

  const cancelEdit = () => {
    setEditingListId(null);
  };

  const addTask = async (list) => {
    if (list.tasks.length >= MAX_TASKS) {
      toast.warn(
        language === "es"
          ? `No puedes agregar más de ${MAX_TASKS} tareas a esta lista`
          : `You can't add more than ${MAX_TASKS} tasks to this list`,
        { toastId: "task-limit" }
      );
      return;
    }

    const updatedTasks = [
      ...list.tasks,
      { id: Date.now(), text: "", completed: false }
    ];

    await updateDoc(doc(db, "lists", list.id), {
      tasks: updatedTasks
    });
  };

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

  const deleteTask = async (list, taskId) => {
    const updatedTasks = list.tasks.filter(
      (task) => task.id !== taskId
    );
    await updateDoc(doc(db, "lists", list.id), {
      tasks: updatedTasks
    });
  };

  const moveToFirst = async (selectedList) => {
    const updates = lists.map(async (list) => {
      if (list.id === selectedList.id) {
        return updateDoc(doc(db, "lists", list.id), {
          position: 0
        });
      } else {
        return updateDoc(doc(db, "lists", list.id), {
          position: (list.position || 0) + 1
        });
      }
    });
    await Promise.all(updates);
  };

  return (
    <div className="min-h-dvh pt-30 px-6 sm:px-15 md:px-30 pb-40 flex flex-col items-center justify-baseline">
      <h2 className="text-5xl font-bold pb-4">
        {language === "es" ? "Mis Listas" : "My Tasks"}
      </h2>
      <div className="flex flex-col items-center mb-6 text-center">
        <p className="text-(--text-color)/70 mb-2">
          {language === "es"
            ? "Puedes crear hasta 20 listas. Cada lista permite un máximo de 15 tareas."
            : "You can create up to 20 lists. Each list allows a maximum of 15 tasks."
          }
        </p>
        <div className="flex items-center gap-2 text-(--text-color)">
          <span>{language === "es" ? "Listas creadas:" : "Lists created:"}</span>
          <span className="px-3 py-1 bg-(--bg-color) border-2 border-(--text-color) rounded-lg font-semibold">
            {lists.length} / {MAX_LISTS}
          </span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl pb-12">
        <input
          type="text"
          placeholder={language === "es" ? "Nombre de la lista" : "List name"}
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addList();
            }
          }}
          className="w-full sm:flex-1 p-3 rounded-xl bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow-soft)] focus:outline-none"
        />
        <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="color-circle w-12 h-12 rounded-full cursor-pointer border-2 border-(--text-color) hover:scale-105 transition p-0"
          />
          <button
            onClick={addList}
            className={`px-6 py-3 border-2 border-(--text-color)/50 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) [box-shadow:var(--component-shadow-soft)] transition-all duration-200 ease-out hover:bg-(--bg-color) hover:text-(--text-color) cursor-pointer hover:-translate-y-0.5 ${lists.length >= MAX_LISTS ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {language === "es" ? "Agregar" : "Add"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
        {lists.map((list) => {
          const completed = list.tasks.filter(t => t.completed).length;
          const total = list.tasks.length;
          const percent = total === 0 ? 0 : (completed / total) * 100;

          return (
            <div
              key={list.id}
              className="rounded-2xl p-6 space-y-4 [box-shadow:var(--component-shadow)] hover:scale-[1.02] duration-300 transition ease-out"
              style={{ backgroundColor: list.color }}
            >
              <div className="flex justify-between items-center gap-2">
                {editingListId === list.id ? (
                  <div className="flex flex-col gap-3 w-full">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="border rounded-lg p-2 w-full bg-(--bg-color) text-(--text-color) [box-shadow:var(--component-shadow-soft)]"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editedColor || "#3b82f6"}
                        onChange={(e) => setEditedColor(e.target.value)}
                        className="color-circle w-8 h-8 rounded-full border-2 border-(--bg-color) cursor-pointer shrink-0 [box-shadow:var(--component-shadow-soft)]"
                      />
                      <button
                        onClick={() => saveEdit(list.id)}
                        className="flex-1 text-center text-(--bg-color) border border-(--text-color) bg-(--text-color) rounded-lg py-2 [box-shadow:var(--component-shadow-soft)] hover:bg-(--bg-color) hover:text-(--text-color) duration-300 transition ease-out cursor-pointer"
                      >
                        {language === "es" ? "Guardar" : "Save"}

                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 text-center text-(--bg-color) border border-(--text-color) bg-(--text-color) rounded-lg py-2 [box-shadow:var(--component-shadow-soft)] hover:bg-(--bg-color) hover:text-(--text-color) duration-300 transition ease-out cursor-pointer"
                      >
                        {language === "es" ? "Cancelar" : "Cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="font-semibold text-lg truncate flex-1 text-shadow-(--text-shadow-strong)">
                      {list.name}
                    </h2>
                    <button
                      onClick={() => moveToFirst(list)}
                      className="hover:scale-120 duration-300 transition ease-out cursor-pointer"
                    >
                      <img
                        src="/icons/Arrow.png"
                        alt="Move to first"
                        className="w-6 h-6"
                      />
                    </button>
                    <button
                      onClick={() => startEdit(list)}
                      className="hover:scale-120 duration-300 transition ease-out cursor-pointer"
                    >
                      <img
                        src="/icons/Edit.png"
                        alt="Edit"
                        className="w-6 h-6"
                      />
                    </button>
                    <button
                      onClick={() => {
                        setListToDelete(list);
                        setShowDeleteModal(true);
                      }}
                      className="hover:scale-120 duration-300 transition ease-out cursor-pointer"
                    >
                      <img
                        src="/icons/Delet.png"
                        alt="Delete"
                        className="w-6 h-6"
                      />
                    </button>
                  </>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>
                    {completed}/{total} {language === "es" ? "tareas" : "tasks"}
                  </span>
                  <span>
                    {Math.round(percent)}%
                  </span>
                </div>
                <div className="w-full h-4 bg-(--smoke-white) border-2 border-(--smoke-white)/80 rounded-full overflow-hidden [box-shadow:var(--component-shadow-soft)]">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: percent + "%",
                      backgroundColor: list.color
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {list.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-2 transition-all duration-300 ${task.completed ? "task-completed-animation" : ""
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
                      className="w-6 h-6 rounded-full appearance-none cursor-pointer transition-all duration-300 border-2 border-(--text-color) bg-(--text-color) checked:bg-transparent checked:scale-90 [box-shadow:var(--component-shadow-soft)]"
                    />
                    <textarea
                      ref={(el) => {
                        if (el) {
                          el.style.height = "auto";
                          el.style.height = el.scrollHeight + "px";
                        }
                      }}
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
                      rows={1}
                      className={`border-none rounded-lg p-2 flex-1 min-w-0 bg-(--input-color) text-(--input-text)
                        focus:outline-none resize-none overflow-hidden box-border
                        ${task.completed ? "line-through opacity-60" : ""}
                      `}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                    />
                    <button
                      onClick={() => deleteTask(list, task.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-red-700 text-(--smoke-white) font-bold transition-all duration-300 ease-in-out hover:opacity-80 [box-shadow:var(--component-shadow-soft)] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addTask(list)}
                className={`text-(--text-color) font-bold hover:opacity-70 transition-all duration-300 ease-in-out ${list.tasks.length >= MAX_TASKS ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {language === "es" ? "+ Agregar tarea" : "+ Add task"}
              </button>
            </div>
          );
        })}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative flex flex-col justify-center items-center gap-4 bg-(--bg-color) rounded-2xl m-6 p-6 w-80 [box-shadow:var(--component-shadow-soft)] animate-scaleIn transition-all duration-300 ease-in-out">
            <h3 className="text-lg font-semibold">
              {language === "es"
                ? "¿Quieres borrar esta lista?"
                : "Do you want to delete this list?"}
            </h3>
            <div className="w-full flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-(--text-color) text-(--bg-color) font-bold hover:scale-90 transition-all duration-300 ease-in-out [box-shadow:var(--component-shadow-soft)]"
              >
                {language === "es" ? "No" : "No"}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-red-700 text-(--smoke-white) font-bold hover:scale-90 transition-all duration-300 ease-in-out [box-shadow:var(--component-shadow-soft)]"
              >
                {language === "es" ? "Sí" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        theme="dark"
        limit={3}
      />
    </div>
  );
}

export default UserTasksPage;