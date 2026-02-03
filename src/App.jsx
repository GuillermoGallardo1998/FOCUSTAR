// App.jsx
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";
import { useState, useEffect } from "react";
import { auth } from "./services/firebaseConfig";

// 🔹 ProtectedRoute definido aquí mismo
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

  // 🔹 Solo permite acceso si el usuario está logueado y el UID coincide
  if (!user || user.uid !== uidParam) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// 🔹 Wrapper para capturar UID desde la URL
function ProtectedUserPageWrapper() {
  const { uid } = useParams();
  return (
    <ProtectedRoute uidParam={uid}>
      <UserPage />
    </ProtectedRoute>
  );
}

// 🔹 Wrapper para /user que redirige al UID del usuario logueado
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

  if (!user) {
    return <Navigate to="/" replace />; // no logueado → home
  }

  // logueado → redirige a su UID
  return <Navigate to={`/user/${user.uid}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Redirigir /user → /user/:uid del usuario logueado */}
        <Route path="/user" element={<UserRedirectWrapper />} />

        {/* Ruta dinámica protegida */}
        <Route path="/user/:uid" element={<ProtectedUserPageWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

