import { useOutletContext } from "react-router-dom";

function UserMetricsPage() {
  const { language } = useOutletContext();

  return (
    <div>
      <h1 className="text-3xl font-bold">
        {language === "es"
          ? "Métricas (Próximamente)"
          : "Metrics (Coming Soon)"}
      </h1>
    </div>
  );
}

export default UserMetricsPage;
