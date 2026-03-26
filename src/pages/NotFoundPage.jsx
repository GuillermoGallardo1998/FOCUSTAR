// pages/NotFoundPage.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function NotFoundPage() {
  const [language, setLanguage] = useState("es");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "es" ? "en" : "es"));
  };

  const content = {
    es: {
      error: "404",
      title: "Vaya, te has perdido en el código.",
      message: "La ruta que intentaste acceder no existe o ha sido movida.",
      button: "Volver al inicio",
    },
    en: {
      error: "404",
      title: "Whoops, you've lost in the code.",
      message: "The route you tried to access doesn't exist or has been moved.",
      button: "Back to Home",
    },
  };

  const t = language === "es" ? content.es : content.en;

  return (
    <div className="bg-(--bg-color) text-(--text-color) min-h-dvh flex flex-col">
      <Header language={language} toggleLanguage={toggleLanguage} />
      <main className="flex grow items-center justify-center py-30 px-10 sm:px-20 overflow-hidden">
        <div className="flex flex-col items-center text-center gap-20">
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold select-none text-(--text-color) animate-strong-pulse text-shadow">
						{t.error}
					</h1>
          <div className="max-w-3xl flex flex-col items-center justify-center gap-5">
            <h2 className="text-3xl md:text-4xl font-bold text-shadow">
              {t.title}
            </h2>
            <p className="text-(--text-color)/60 text-lg">
              {t.message}
            </p>
            <Link
              to="/"
              className="mt-6 py-3 px-6 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) hover:transition transform duration-300 hover:scale-95 component-shadow"
            >
              {t.button}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}