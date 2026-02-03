// Header.jsx


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingsModal from "./SettingsModal";
import LoginSidebar from "./LoginSidebar";
import { auth, googleProvider, signInWithPopup } from "../services/firebaseConfig";

export default function Header({ language, toggleLanguage }) {
  const [openSettings, setOpenSettings] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false); // para hamburguesa
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setUser(user);
      setOpenLogin(false);
      navigate(`/user/${user.uid}`);
    } catch (err) {
      console.error("Error login Google:", err);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 h-20 px-6 md:px-12 flex items-center justify-between backdrop-blur-md bg-black/60 border-b border-white/10">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-2xl md:text-3xl font-bold tracking-widest logo-pulse select-none cursor-pointer hover:opacity-80 transition"
        >
          FOCUSTAR
        </button>

        {/* Botones escritorio */}
        <div className="hidden md:flex items-center gap-3 md:gap-5">
          <button
            onClick={toggleLanguage}
            className="btn-glow px-3 py-1 md:px-4 md:py-2 rounded border border-white/20 text-sm md:text-base"
          >
            {language === "es" ? "ES" : "EN"}
          </button>

          <button
            onClick={() => setOpenSettings(true)}
            className="btn-glow px-3 py-1 md:px-4 md:py-2 rounded border border-white/20 text-sm md:text-base flex items-center gap-1"
          >
            <span className="icon-spin inline-block text-lg md:text-xl leading-none">⚙</span>
            {language === "es" ? "Configuración" : "Settings"}
          </button>

          {user ? (
            <button
              onClick={handleLogout}
              className="btn-glow px-3 py-1 md:px-4 md:py-2 rounded border border-white/20 text-sm md:text-base"
            >
              {language === "es" ? "Cerrar sesión" : "Sign Out"}
            </button>
          ) : (
            <button
              onClick={() => setOpenLogin(true)}
              className="btn-glow px-3 py-1 md:px-4 md:py-2 rounded border border-white/20 text-sm md:text-base"
            >
              {language === "es" ? "Iniciar sesión" : "Sign In"}
            </button>
          )}
        </div>

        {/* Botón hamburguesa */}
        <div className="md:hidden">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="p-2 text-3xl font-bold cursor-pointer"
          >
            {openMenu ? "✕" : "☰"} {/* ✕ para cerrar, ☰ para abrir */}
          </button>
        </div>

        {/* LÍNEA ROJA */}
        <div className="header-line"></div>
      </header>

      {/* Menú hamburguesa móvil */}
      {/* Menú hamburguesa móvil */}
      {/* Menú hamburguesa móvil */}
{openMenu && (
  <div className="absolute top-20 right-0 w-full bg-black/90 p-6 flex flex-col items-center justify-center gap-4 md:hidden z-50 rounded-lg shadow-lg">

    <button
      onClick={toggleLanguage}
      className="btn-glow w-1/2 min-w-[200px] max-w-sm px-4 py-2 rounded text-sm font-bold"
    >
      {language === "es" ? "ES" : "EN"}
    </button>

    <button
      onClick={() => {
        setOpenSettings(true);
        setOpenMenu(false);
      }}
      className="btn-glow w-1/2 min-w-[200px] max-w-sm px-4 py-2 rounded text-sm font-bold flex items-center justify-center gap-2"
    >
      <span className="icon-spin inline-block text-lg leading-none">⚙</span>
      {language === "es" ? "Configuración" : "Settings"}
    </button>

    {user ? (
      <button
        onClick={() => {
          handleLogout();
          setOpenMenu(false);
        }}
        className="btn-glow w-1/2 min-w-[200px] max-w-sm px-4 py-2 rounded text-sm font-bold"
      >
        {language === "es" ? "Cerrar sesión" : "Sign Out"}
      </button>
    ) : (
      <button
        onClick={() => {
          setOpenLogin(true);
          setOpenMenu(false);
        }}
        className="btn-glow w-1/2 min-w-[200px] max-w-sm px-4 py-2 rounded text-sm font-bold"
      >
        {language === "es" ? "Iniciar sesión" : "Sign In"}
      </button>
    )}

  </div>
)}



      <SettingsModal
        isOpen={openSettings}
        onClose={() => setOpenSettings(false)}
        language={language}
      />

      <LoginSidebar
        isOpen={openLogin}
        onClose={() => setOpenLogin(false)}
        language={language}
        handleGoogleLogin={handleGoogleLogin}
      />
    </>
  );
}
