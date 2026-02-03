// UserPage.jsx

import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UserItineraryForm from "../components/UserItineraryForm";
import UserItineraryList from "../components/UserItineraryList";

function UserPage() {
  const [language, setLanguage] = useState("es");
  const { uid } = useParams(); // 🔹 UID del usuario desde la URL

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "es" ? "en" : "es"));
  };

  return (
    <>
      {/* Header con login/logout y cambio de idioma */}
      <Header
        language={language}
        toggleLanguage={toggleLanguage}
      />

      <div className="p-6 flex flex-col gap-6">
        {/* Formulario para crear nuevas notas */}
        <UserItineraryForm 
          userUid={uid}         // 🔹 Pasamos UID al formulario
          language={language} 
        />

        {/* Lista de notas guardadas */}
        <UserItineraryList 
          userUid={uid}         // 🔹 Pasamos UID a la lista
          language={language} 
        />
      </div>

      {/* Footer */}
      <Footer language={language} />
    </>
  );
}

export default UserPage;
