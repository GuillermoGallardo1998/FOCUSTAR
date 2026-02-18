// components/UserFloatingMenu.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function UserFloatingMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { uid } = useParams();

  const goTo = (path) => {
    navigate(`/user/${uid}/${path}`);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">

      {open && (
        <>
          <button
            onClick={() => goTo("welcome")}
            className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition"
          >
            Bienvenida
          </button>

          <button
            onClick={() => goTo("data")}
            className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-600 transition"
          >
            Datos
          </button>

          <button
            onClick={() => goTo("metrics")}
            className="bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-600 transition"
          >
            Métricas
          </button>

          <button
            onClick={() => goTo("about")}
            className="bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition"
          >
            Propósito
          </button>
        </>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="bg-black text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl hover:scale-110 transition"
      >
        {open ? "×" : "+"}
      </button>
    </div>
  );
}

export default UserFloatingMenu;
