// UserLayout.jsx

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import UserFloatingMenu from "../components/UserFloatingMenu";

function UserLayout() {
  const [language, setLanguage] = useState("es");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "es" ? "en" : "es"));
  };

  return (
    <>
      <Header language={language} toggleLanguage={toggleLanguage} />
      <div className="min-h-screen">
        <Outlet context={{ language }} />
      </div>
      <UserFloatingMenu language={language} />
    </>
  );
}

export default UserLayout;