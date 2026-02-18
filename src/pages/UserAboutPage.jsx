function UserAboutPage({ language }) {
  return (
    <div>
      <h1 className="text-3xl font-bold">
        {language === "es"
          ? "Sobre esta plataforma"
          : "About this platform"}
      </h1>

      <p className="mt-4">
        {language === "es"
          ? "Esta aplicación fue creada para gestionar rutinas, métricas y progreso."
          : "This application was created to manage routines, metrics and progress."}
      </p>
    </div>
  );
}

export default UserAboutPage;
