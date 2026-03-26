// features/routines/components/RoutineList.jsx

import { updateRoutineOrder } from "../services/routinesService";
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

function RoutineList({ language, routines, loading }) {

  const moveToFirst = async (id) => {
    const oldIndex = routines.findIndex(r => r.id === id);
    if (oldIndex <= 0) return;

    const newOrder = [...routines];
    const [card] = newOrder.splice(oldIndex, 1);
    newOrder.unshift(card);

    for (let i = 0; i < newOrder.length; i++) {
      await updateRoutineOrder(newOrder[i].id, i);
    }
  };

  return (
    <div>
      <h2 className="text-3xl text-center font-bold mb-6">
        {language === "es" ? "Tus rutinas" : "Your routines"}
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map(n => (
            <RoutineCardSkeleton key={n} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
          {routines.map(routine => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              language={language}
              moveToFirst={moveToFirst}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RoutineList;