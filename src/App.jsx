// App.jsx

import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./services/firebaseConfig";

import NotFoundPage from "./pages/NotFoundPage";
import HomePage from "./pages/HomePage";
import UserLayout from "./pages/UserLayout";
import UserWelcomePage from "./pages/UserWelcomePage";
import UserDataPage from "./pages/UserDataPage";
import UserTasksPage from "./pages/UserTasksPage";
import UserAboutPage from "./pages/UserAboutPage";

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

  if (loading) return (
    <div className="flex items-center justify-center h-dvh">
      <div 
        className="w-16 h-16 border-8 border-(--smoke-white) border-t-red-700 rounded-full animate-spin">
      </div>
    </div>
  );

  if (!user || user.uid !== uidParam) return <Navigate to="/" replace />;

  return children;
}

function ProtectedUserWrapper() {
  const { uid } = useParams();

  return (
    <ProtectedRoute uidParam={uid}>
      <UserLayout />
    </ProtectedRoute>
  );
}

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

  if (loading) return (
    <div className="flex items-center justify-center h-dvh">
      <div 
        className="w-16 h-16 border-8 border-(--smoke-white) border-t-red-700 rounded-full animate-spin">
      </div>
    </div>
  );

  if (!user) return <Navigate to="/" replace />;

  return <Navigate to={`/user/${user.uid}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user" element={<UserRedirectWrapper />} />
          <Route path="/user/:uid/*" element={<ProtectedUserWrapper />}>
            <Route index element={<UserWelcomePage />} />
            <Route path="welcome" element={<UserWelcomePage />} />
            <Route path="data" element={<UserDataPage />} />
            <Route path="tasks" element={<UserTasksPage />} />
            <Route path="about" element={<UserAboutPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
