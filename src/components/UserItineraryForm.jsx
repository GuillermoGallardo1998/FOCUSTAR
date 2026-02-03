// UserItineraryForm.jsx

import { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";

function UserItineraryForm({ userUid, language }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔹 Suscribirse a las notas de este usuario
  useEffect(() => {
    if (!userUid) return;

    const notesQuery = query(
      collection(db, "userNotes"),
      where("uid", "==", userUid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(fetchedNotes);
    });

    return () => unsubscribe();
  }, [userUid]);

  // 🔹 Guardar nueva nota
  const handleSaveNote = async () => {
    if (!userUid) {
      setError(language === "es" ? "Debes iniciar sesión" : "You must be logged in");
      return;
    }
    if (!note.trim()) {
      setError(language === "es" ? "La nota no puede estar vacía" : "Note cannot be empty");
      return;
    }

    try {
      await addDoc(collection(db, "userNotes"), {
        uid: userUid,
        note: note.trim(),
        createdAt: serverTimestamp()
      });
      setNote("");
      setSuccess(language === "es" ? "Nota guardada correctamente" : "Note saved successfully");
      setError("");
    } catch (err) {
      console.error(err);
      setError(language === "es" ? "Error al guardar la nota" : "Error saving note");
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">
        {language === "es" ? "Nuevo formato de Itinerario" : "New Itinerary form"}
      </h2>

      <textarea
        placeholder={language === "es" ? "Escribe tu nota aquí..." : "Write your note here..."}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="border p-2 rounded w-full resize-none"
        rows={4}
      />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <button
        onClick={handleSaveNote}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-max"
      >
        {language === "es" ? "Guardar nota" : "Save Note"}
      </button>

      <div className="mt-6">
        <h3 className="font-semibold">{language === "es" ? "Tus notas" : "Your Notes"}</h3>
        {notes.length === 0 && <p>{language === "es" ? "No tienes notas aún." : "No notes yet."}</p>}
        <ul className="mt-2 flex flex-col gap-2">
          {notes.map(n => (
            <li key={n.id} className="border p-2 rounded bg-gray-50">
              <p>{n.note}</p>
              <small className="text-gray-400 text-xs">
                {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : ""}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserItineraryForm;
