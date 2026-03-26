// pages/UserDataPage.jsx

import { useParams, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { listenUserRoutines } from "../features/routines/services/routinesService";
import RoutineBuilder from "../features/routines/components/RoutineBuilder";
import RoutineList from "../features/routines/components/RoutineList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserDataPage() {
  const { uid } = useParams();
  const { language } = useOutletContext();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  const MAX_ROUTINES = 20;

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = listenUserRoutines(uid, (data) => {
      setRoutines(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return (
    <div className="flex flex-col pt-30 px-6 sm:px-15 md:px-30 pb-40">
      <RoutineBuilder
        userUid={uid}
        language={language}
        routines={routines}
        MAX_ROUTINES={MAX_ROUTINES}
      />
      <RoutineList
        language={language}
        routines={routines}
        loading={loading}
      />
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        theme="dark"
        limit={3}
      />
    </div>
  );
}

export default UserDataPage;