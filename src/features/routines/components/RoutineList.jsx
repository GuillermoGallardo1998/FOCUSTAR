// RoutineList.jsx

import { useEffect, useState } from "react";
import { listenUserRoutines, updateRoutineOrder } from "../services/routinesService";
import RoutineCard from "./RoutineCard";

function RoutineCardSkeleton() {
  return (
    <div className="border p-4 rounded bg-gray-100 animate-pulse flex flex-col gap-3">
      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
      <div className="h-24 bg-gray-300 rounded"></div>
      <div className="h-8 bg-gray-300 rounded w-1/3 mt-2"></div>
    </div>
  );
}

function RoutineList({ userUid, language }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userUid) return;

    const unsubscribe = listenUserRoutines(userUid, (data) => {
      // Ordenar por fecha (ascendente)
      const sorted = [...data].sort((a, b) => {
        const dateA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
        const dateB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
        return dateA - dateB;
      });
      setRoutines(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userUid]);

  // FUNCION: mueve la card al inicio de la lista
  const moveToFirst = async (id) => {
    const oldIndex = routines.findIndex(r => r.id === id);
    if (oldIndex <= 0) return; // ya está primero

    const newOrder = [...routines];
    const [card] = newOrder.splice(oldIndex, 1);
    newOrder.unshift(card);

    setRoutines(newOrder);

    // actualizar Firebase
    for (let i = 0; i < newOrder.length; i++) {
      await updateRoutineOrder(newOrder[i].id, i);
    }
  };

  return (
    <div className="mb-14">
      <h2 className="text-2xl text-center font-bold mb-6">
        {language === "es" ? "Tus rutinas" : "Your routines"}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(n => <RoutineCardSkeleton key={n} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map(routine => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              language={language}
              moveToFirst={moveToFirst} // botón “subir al inicio”
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RoutineList;