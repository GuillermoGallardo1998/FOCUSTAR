// UserWelcomePage.jsx

import { useOutletContext } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";

function UserWelcomePage() {
  const { language } = useOutletContext();

  return (
    <div className="min-h-screen pt-20 px-10 pb-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold text-(--text-color) mb-15 text-shadow-(--text-shadow-strong)">
        <TypeAnimation
          key={language}
          sequence={[
            language === "es"
            ? "¡Gracias por iniciar sesión!"
            : "Thank you for logging in!",
            2000,      
            "",        
            1000,      
          ]}
          speed={50}     
          deletionSpeed={40} 
          repeat={Infinity}
          cursor={true}
        />
      </h1>
      <p className="max-w-3xl text-shadow-(--text-shadow-strong)">
        {language === "es"
          ? "Nos alegra que estés aquí. Gracias por probar nuestra plataforma."
          : "We are happy to have you here. Thank you for trying our platform."}
      </p>
      <p className="mt-5 max-w-3xl text-shadow-(--text-shadow-strong)">
        {language === "es"
          ? "En la esquina inferior derecha encontrarás el ícono que abre el menú de opciones para que puedas navegar cómodamente por la aplicación."
          : "In the bottom right corner you will find the icon that opens the options menu so you can navigate comfortably through the app."}
      </p>
      <div className="mt-15 w-40 h-40 rounded-full bg-(--smoke-white) [box-shadow:var(--component-shadow)] flex items-center justify-center border-2 group">
        <img
          src="/icons/Focustar.png"
          alt="Focustar Logo"
          className="w-24 h-24 object-contain animate-bounce group-hover:[animation-play-state:paused]"
        />
      </div>
    </div>
  );
}

export default UserWelcomePage;