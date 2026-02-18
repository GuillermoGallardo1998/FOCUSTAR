import { useOutletContext } from "react-router-dom";

function UserWelcomePage() {
  const { language } = useOutletContext();

  return (
    <div>
      <h1 className="text-3xl font-bold">
        {language === "es" ? "Bienvenido" : "Welcome"}
      </h1>
      <p className="mt-4">
        {language === "es"
          ? "Esta es tu página principal."
          : "This is your main page."}
      </p>
    </div>
  );
}

export default UserWelcomePage;
