// pages/UserDataPage.jsx

import { useParams, useOutletContext } from "react-router-dom";
import RoutineBuilder from "../features/routines/components/RoutineBuilder";
import RoutineList from "../features/routines/components/RoutineList";

function UserDataPage() {
  const { uid } = useParams();

  // 🔹 Recibimos language desde UserLayout
  const { language } = useOutletContext();

  return (
    <div className="flex flex-col gap-10">

      {/* Construcción de nuevas rutinas */}
      <RoutineBuilder userUid={uid} language={language} />

      {/* Lista de rutinas arrastrables */}
      <RoutineList userUid={uid} language={language} />

    </div>
  );
}

export default UserDataPage;
