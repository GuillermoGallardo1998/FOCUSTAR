// components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../services/firebaseConfig";

export default function ProtectedRoute({ children, uidParam }) {
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
