import { useState } from "react";
import { auth, googleProvider, signInWithPopup, db } from "../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

export default function LoginSidebar({ isOpen, onClose, language }) {
  const navigate = useNavigate();

  // Estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 🔹 Google login
  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      navigate(`/user/${result.user.uid}`);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Login con email
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Completa todos los campos");

    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      navigate(`/user/${userCred.user.uid}`);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Funciones para username único
  const reserveUsername = async (username) => {
    const ref = doc(db, "takenUsernames", username);
    const snap = await getDoc(ref);
    if (snap.exists()) return false;
    await setDoc(ref, { reservedAt: new Date() });
    return true;
  };

  const releaseUsername = async (username) => {
    await deleteDoc(doc(db, "takenUsernames", username));
  };

  // 🔹 Registro con email
  const handleRegister = async () => {
    if (loading) return;
    if (!username || !firstName || !lastName || !email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const reserved = await reserveUsername(username);
      if (!reserved) {
        setError("El username ya está en uso");
        setLoading(false);
        return;
      }

      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Actualizar displayName
      await updateProfile(userCred.user, { displayName: username });

      // Guardar usuario en Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        username,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        createdAt: new Date(),
        bio: "",
        profilePicture: "",
        role: "user",
      });

      navigate(`/user/${userCred.user.uid}`);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al registrarse: " + err.message);
      await releaseUsername(username);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-6 z-50 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        {isRegistering
          ? language === "es" ? "Registrarse" : "Register"
          : language === "es" ? "Iniciar sesión" : "Sign In"}
      </h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Toggle Login/Register */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsRegistering(false)}
          className={`px-2 py-1 rounded ${!isRegistering ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          {language === "es" ? "Login" : "Login"}
        </button>
        <button
          onClick={() => setIsRegistering(true)}
          className={`px-2 py-1 rounded ${isRegistering ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          {language === "es" ? "Registro" : "Register"}
        </button>
      </div>

      {!isRegistering ? (
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-2 mb-4">
          <input
            type="email"
            placeholder={language === "es" ? "Correo electrónico" : "Email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border rounded"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={language === "es" ? "Contraseña" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 border rounded w-full"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Cargando..." : language === "es" ? "Iniciar sesión" : "Sign In"}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder={language === "es" ? "Nombre" : "First Name"}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder={language === "es" ? "Apellido" : "Last Name"}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 border rounded w-full"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            onClick={handleRegister}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Procesando..." : language === "es" ? "Registrarse" : "Register"}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <hr className="flex-1 border-gray-300" />
        <span className="text-sm text-gray-500">{language === "es" ? "o" : "or"}</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        disabled={loading}
      >
        {loading ? "Cargando..." : language === "es" ? "Iniciar con Google" : "Sign in with Google"}
      </button>

      <button
        onClick={onClose}
        className="mt-4 w-full px-4 py-2 border rounded hover:bg-gray-100"
      >
        {language === "es" ? "Cerrar" : "Close"}
      </button>
    </div>
  );
}
