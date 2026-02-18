// App.jsx
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./services/firebaseConfig";

import HomePage from "./pages/HomePage";
import UserLayout from "./pages/UserLayout";
import UserWelcomePage from "./pages/UserWelcomePage";
import UserDataPage from "./pages/UserDataPage";
import UserMetricsPage from "./pages/UserMetricsPage";
import UserAboutPage from "./pages/UserAboutPage";

// 🔒 Protección de rutas
function ProtectedRoute({ children, uidParam }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <p>Cargando...</p>;

  if (!user || user.uid !== uidParam) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// 🔹 Wrapper protegido con nested routes
function ProtectedUserWrapper() {
  const { uid } = useParams();

  return (
    <ProtectedRoute uidParam={uid}>
      <UserLayout />
    </ProtectedRoute>
  );
}

// 🔹 Redirección automática a UID
function UserRedirectWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <p>Cargando...</p>;

  if (!user) return <Navigate to="/" replace />;

  return <Navigate to={`/user/${user.uid}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user" element={<UserRedirectWrapper />} />

        {/* 🔥 Rutas protegidas con nested routes */}
        <Route path="/user/:uid/*" element={<ProtectedUserWrapper />}>
          <Route index element={<UserWelcomePage />} />
          <Route path="welcome" element={<UserWelcomePage />} />
          <Route path="data" element={<UserDataPage />} />
          <Route path="metrics" element={<UserMetricsPage />} />
          <Route path="about" element={<UserAboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
