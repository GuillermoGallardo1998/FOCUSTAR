// LoginSidebar.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  googleProvider,
  signInWithPopup,
  db,
} from "../services/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginSidebar({ isOpen, onClose, language }) {
  const navigate = useNavigate();
  const isES = language === "es";

  // 🔹 Estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // 🔹 Refs para inputs
  const formRef = useRef();

  // 🔹 Textos traducibles centralizados
  const t = {
    login: isES ? "Iniciar sesión" : "Sign In",
    register: isES ? "Registrarse" : "Register",
    email: isES ? "Correo electrónico" : "Email",
    password: isES ? "Contraseña" : "Password",
    username: isES ? "Usuario" : "Username",
    firstName: isES ? "Nombre" : "First Name",
    lastName: isES ? "Apellido" : "Last Name",
    close: isES ? "Cerrar" : "Close",
    loading: isES ? "Cargando..." : "Loading...",
    processing: isES ? "Procesando..." : "Processing...",
    google: isES ? "Iniciar con Google" : "Sign in with Google",
    completeFields: isES
      ? "Completa todos los campos"
      : "Fill in all fields",
    usernameTaken: isES
      ? "El usuario ya está en uso"
      : "Username is already taken",
    invalidCredentials: isES
      ? "Correo o contraseña incorrectos"
      : "Incorrect email or password",
    userNotFound: isES ? "Usuario no encontrado" : "User not found",
    wrongPassword: isES ? "Contraseña incorrecta" : "Wrong password",
    emailAlreadyInUse: isES
      ? "Este correo ya está registrado"
      : "This email is already registered",
    weakPassword: isES
      ? "La contraseña debe tener al menos 8 caracteres, con número y mayúscula"
      : "Password must be at least 8 characters with number and uppercase",
    invalidEmail: isES ? "Correo inválido" : "Invalid email",
    invalidUsername: isES
      ? "Usuario inválido (solo letras, números y guion bajo)"
      : "Invalid username (letters, numbers, underscores only)",
    genericError: isES
      ? "Ocurrió un error. Intenta nuevamente."
      : "An error occurred. Please try again.",
    confirmEmailText: isES ? "Confirmar correo" : "Confirm Email",
    confirmPasswordText: isES ? "Confirmar contraseña" : "Confirm Password",
    emailMismatch: isES ? "Los correos no coinciden" : "Emails do not match",
    passwordMismatch: isES ? "Las contraseñas no coinciden" : "Passwords do not match",

  };

  // 🔹 Validaciones
  const isValidUsername = (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username);
  const isValidPassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🔹 Traducción de errores Firebase
  const getAuthErrorMessage = (code) => {
    const errors = {
      "auth/invalid-credential": t.invalidCredentials,
      "auth/user-not-found": t.userNotFound,
      "auth/wrong-password": t.wrongPassword,
      "auth/email-already-in-use": t.emailAlreadyInUse,
      "auth/weak-password": t.weakPassword,
      "auth/invalid-email": t.invalidEmail,
    };
    return errors[code] || t.genericError;
  };

  // 🔹 Limpiar error al escribir en cualquier input del sidebar
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handleInput = () => setError("");
    form.addEventListener("input", handleInput);
    return () => form.removeEventListener("input", handleInput);
  }, []);

  // 🔹 Google login
  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      navigate(`/user/${result.user.uid}`);
      onClose();
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t.completeFields);
      return;
    }

    if (!isValidEmail(email)) {
      setError(t.invalidEmail);
      return;
    }

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      navigate(`/user/${userCred.user.uid}`);
      onClose();
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reservar username único
  const reserveUsername = async (username) => {
    const ref = doc(db, "takenUsernames", username);
    const snap = await getDoc(ref);
    if (snap.exists()) return false;
    await setDoc(ref, { reservedAt: new Date() });
    return true;
  };

  // 🔹 Registro
  const handleRegister = async () => {
    if (loading) return;

    if (!username || !firstName || !lastName || !email || !password) {
      setError(t.completeFields);
      return;
    }

    if (!isValidUsername(username)) {
      setError(t.invalidUsername);
      return;
    }

    if (!isValidPassword(password)) {
      setError(t.weakPassword);
      return;
    }

    if (!isValidEmail(email)) {
      setError(t.invalidEmail);
      return;
    }

    if (email !== confirmEmail) {
      setError(t.emailMismatch);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }


    setLoading(true);
    setError("");

    try {
      // Crear usuario
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Reservar username
      const reserved = await reserveUsername(username);
      if (!reserved) {
        setError(t.usernameTaken);
        await userCred.user.delete();
        setLoading(false);
        return;
      }

      // Actualizar displayName
      await updateProfile(userCred.user, { displayName: username });

      // Crear documento en Firestore
      await setDoc(doc(db, "users", uid), {
        uid,
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

      navigate(`/user/${uid}`);
      onClose();
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(""); // limpiar errores previos

    if (!email) {
      setError(isES ? "Ingresa tu correo para recuperar la contraseña" : "Enter your email to reset password");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setError(isES ? "Correo de recuperación enviado" : "Password reset email sent");
    } catch (err) {
      console.error(err);
      // Mapeo de errores comunes de Firebase
      if (err.code === "auth/user-not-found") {
        setError(isES ? "Usuario no encontrado" : "User not found");
      } else if (err.code === "auth/invalid-email") {
        setError(isES ? "Correo inválido" : "Invalid email");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };


  // 🔹 Early return si el sidebar no está abierto
  if (!isOpen) return null;

  return (
    <div
      ref={formRef}
      className="fixed top-0 right-0 w-1/4 min-w-100 h-full flex flex-col justify-baseline items-center bg-(--bg-color) text-(--text-color) shadow-2xl p-8 pt-30 z-60 overflow-y-auto border-l border-(--text-color)/10"
    >
      <h2 className="text-xl text-center font-semibold mb-4">
        {isRegistering ? t.register : t.login}
      </h2>

      {error && (
        <p className="w-full text-center text-white mb-3 text-sm bg-red-800 p-4 rounded shadow-2xl">
          {error}
        </p>
      )}

      {/* Toggle Login/Register */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsRegistering(false)}
          className={`px-3 py-1 rounded text-sm ${
            !isRegistering ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          {t.login}
        </button>
        <button
          onClick={() => setIsRegistering(true)}
          className={`px-3 py-1 rounded text-sm ${
            isRegistering ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          {t.register}
        </button>
      </div>

      {/* Formulario */}
      {!isRegistering ? (
        <form
            onSubmit={handleEmailLogin}
            className="flex flex-col gap-3 mb-4 text-(--text-color)"
          >
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded bg-(--bg-color) border border-white/20 focus:outline-none text-(--text-color)"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 rounded bg-(--bg-color) border border-white/20 w-full focus:outline-none text-(--text-color)"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-(--text-color)"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 text-(--text-color)"
            >
              {loading ? t.loading : t.login}
            </button>
            {/* Botón "Olvidé mi contraseña" */}
            <button
              type="button"
              onClick={handleForgotPassword}
              className="mt-2 text-sm text-(--text-color) hover:underline self-start"
            >
              {isES ? "Olvidé mi contraseña" : "Forgot Password"}
            </button>
          </form>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder={t.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-3 py-2 rounded bg-white/10 border border-white/20"
          />
          <input
            type="text"
            placeholder={t.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="px-3 py-2 rounded bg-white/10 border border-white/20"
          />
          <input
            type="text"
            placeholder={t.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="px-3 py-2 rounded bg-white/10 border border-white/20"
          />
          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 rounded bg-white/10 border border-white/20"
          />
          <input
            type="email"
            placeholder={t.confirmEmailText}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="px-3 py-2 rounded bg-white/10 border border-white/20"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 rounded bg-white/10 border border-white/20 w-full"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.confirmPasswordText}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-3 py-2 rounded bg-white/10 border border-white/20 w-full"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? t.processing : t.register}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <hr className="flex-1 border-white/20" />
        <span className="text-xs opacity-60">or</span>
        <hr className="flex-1 border-white/20" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? t.loading : t.google}
      </button>

      <button
        onClick={onClose}
        className="mt-4 w-full px-4 py-2 border border-white/20 rounded hover:bg-white/10"
      >
        {t.close}
      </button>
    </div>
  );
}
