// UserDataPage.jsx

import { useParams, useOutletContext } from "react-router-dom";
import RoutineBuilder from "../features/routines/components/RoutineBuilder";
import RoutineList from "../features/routines/components/RoutineList";

function UserDataPage() {
  const { uid } = useParams();
  const { language } = useOutletContext();

  return (
    <div className="flex flex-col gap-12 pt-30 p-10">
      <RoutineBuilder userUid={uid} language={language} />
      <RoutineList userUid={uid} language={language} />
    </div>
  );
}

export default UserDataPage;