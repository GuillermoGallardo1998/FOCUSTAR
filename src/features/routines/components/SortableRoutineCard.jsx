// SortableRoutineCard.jsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import RoutineCard from "./RoutineCard";

function SortableRoutineCard({ routine, language }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: routine.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RoutineCard routine={routine} language={language} />
    </div>
  );
}

export default SortableRoutineCard;
