// RoutineList.jsx

"use client";

import { useEffect, useState } from "react";
import { listenUserRoutines, updateRoutineOrder } from "../services/routinesService";
import RoutineCard from "./RoutineCard";

import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";

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
      const sorted = [...data].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      setRoutines(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userUid]);

  // 🔥 DRAG END
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = routines.findIndex(r => r.id === active.id);
    const newIndex = routines.findIndex(r => r.id === over.id);

    const newOrder = arrayMove(routines, oldIndex, newIndex);

    // 🔥 Actualiza estado visual inmediato
    setRoutines(newOrder);

    // 🔥 Guarda nuevo orden en Firebase
    for (let i = 0; i < newOrder.length; i++) {
      await updateRoutineOrder(newOrder[i].id, i);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {language === "es" ? "Tus rutinas" : "Your routines"}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <RoutineCardSkeleton key={n} />
          ))}
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={routines.map(r => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  id={routine.id}
                  routine={routine}
                  language={language}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default RoutineList;
