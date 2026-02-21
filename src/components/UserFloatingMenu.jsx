// UserFloatingMenu.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function UserFloatingMenu({ language }) {

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
          <div className="slide-in delay-1">
            <button
              onClick={() => goTo("welcome")}
              className="w-40 bg-(--bg-color) text-(--text-color) border border-(--text-color)/50 py-2 rounded-full transition-all duration-300 ease-in-out text-shadow-(--text-shadow-strong) hover:bg-(--text-color) hover:text-(--bg-color)"
            >
              {language === "es" ? "Bienvenida" : "Welcome"}
            </button>
          </div>
          <div className="slide-in delay-2">
            <button
              onClick={() => goTo("data")}
              className="w-40 bg-(--bg-color) text-(--text-color) border border-(--text-color)/50 py-2 rounded-full transition-all duration-300 ease-in-out text-shadow-(--text-shadow-strong) hover:bg-(--text-color) hover:text-(--bg-color)"
            >
              {language === "es" ? "Rutinas" : "Routines"}
            </button>
          </div>
          <div className="slide-in delay-3">
            <button
              onClick={() => goTo("metrics")}
              className="w-40 bg-(--bg-color) text-(--text-color) border border-(--text-color)/50 py-2 rounded-full transition-all duration-300 ease-in-out text-shadow-(--text-shadow-strong) hover:bg-(--text-color) hover:text-(--bg-color)"
            >
              {language === "es" ? "Métricas" : "Metrics"}
            </button>
          </div>
          <div className="slide-in delay-4">
            <button
              onClick={() => goTo("about")}
              className="w-40 bg-(--bg-color) text-(--text-color) border border-(--text-color)/50 py-2 rounded-full transition-all duration-300 ease-in-out text-shadow-(--text-shadow-strong) hover:bg-(--text-color) hover:text-(--bg-color)"
            >
              {language === "es" ? "Sobre mí" : "About"}
            </button>
          </div>
        </>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          border border-(--text-color)/50
          transition-all duration-300 cursor-pointer
          [box-shadow:var(--component-shadow)]
          hover:scale-85
          ${open 
            ? "bg-(--text-color) text-(--bg-color)" 
            : "bg-(--bg-color) text-(--text-color)"
          }
        `}
      >
        <div
          className={`
            relative w-6 h-6
            transition-transform duration-300
            ${open ? "rotate-45" : "rotate-0"}
          `}
        >
          <span className="absolute inset-0 m-auto w-6 h-0.5 bg-current rounded"></span>
          <span className="absolute inset-0 m-auto h-6 w-0.5 bg-current rounded"></span>
        </div>
      </button>
    </div>
  );
}

export default UserFloatingMenu;