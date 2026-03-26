// components/Footer.jsx

import { useState } from "react"
import emailjs from "@emailjs/browser"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

function Footer({ language }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
  })

  const LIMIT = 3
  const TIME_WINDOW = 60000
  const MAX_CHARS = 1000

  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name =
        language === "es" ? "Ingresa tu nombre" : "Enter your name"
    }

    if (!/^[0-9]{7,15}$/.test(form.phone)) {
      newErrors.phone =
        language === "es"
          ? "Número inválido (solo números, 7 a 15 dígitos)"
          : "Invalid number (only numbers, 7 to 15 digits)"
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email =
        language === "es"
          ? "Correo electrónico inválido"
          : "Invalid email"
    }
    
    if (/https?:\/\//.test(form.subject)) {
      newErrors.subject =
        language === "es"
          ? "No se permiten enlaces"
          : "Links are not allowed"
    }

    const subjectLength = form.subject.trim().length

    if (subjectLength < 5) {
      newErrors.subject =
        language === "es"
          ? "El asunto debe tener al menos 5 caracteres"
          : "Subject must be at least 5 characters"
    } else if (subjectLength > MAX_CHARS) {
      newErrors.subject =
        language === "es"
          ? `Máximo ${MAX_CHARS} caracteres`
          : `Max ${MAX_CHARS} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const now = Date.now()
    const stored = JSON.parse(localStorage.getItem("formAttempts") || "[]")
    const recent = stored.filter((t) => now - t < TIME_WINDOW)

    if (recent.length >= LIMIT) {
      toast.error(
        language === "es"
        ? "Límite alcanzado. Intenta más tarde."
        : "Limit reached. Try again later."
      )
      return
    }

    const cleanText = (text) =>
      text
        .replace(/<[^>]*>?/gm, "")
        .replace(/https?:\/\/\S+/g, "")

    const safeData = {
      name: cleanText(form.name),
      phone: cleanText(form.phone),
      email: cleanText(form.email),
      subject: cleanText(form.subject),
    }

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: safeData.name,
          phone: safeData.phone,
          email: safeData.email,
          subject: safeData.subject,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )

      localStorage.setItem(
        "formAttempts",
        JSON.stringify([...recent, now])
      )

      toast.success(
        language === "es"
          ? "Mensaje enviado correctamente"
          : "Message sent successfully"
      )

      setForm({ name: "", phone: "", email: "", subject: "" })
    } catch (error) {
      toast.error(
        language === "es"
          ? "Error al enviar"
          : "Error sending"
      )
      console.error(error)
    }
  }

  return (
    <footer className="min-h-full flex flex-col justify-start  pt-30 pb-10 px-6 sm:px-10 space-y-12 md:space-y-16">
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-shadow-(--text-shadow-strong)">
          {language === "es"
            ? "¿Tienes alguna inquietud, encontraste un error o quieres aportar algo?"
            : "Do you have any questions, found an error, or want to contribute?"}
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-4 text-left">
          <div>
            <input
              type="text"
              placeholder={language === "es" ? "Nombre" : "Name"}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 rounded-xl bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow)] focus:outline-none"
            />
            {errors.name && (
              <p className="text-(--text-color)/70 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <input
              type="tel"
              placeholder={
                language === "es" ? "Número de contacto" : "Contact number"
              }
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-3 rounded-xl bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow)] focus:outline-none"
            />
            {errors.phone && (
              <p className="text-(--text-color)/70 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              placeholder={language === "es" ? "Correo electrónico" : "Email"}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 rounded-xl bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow)] focus:outline-none"
            />
            {errors.email && (
              <p className="text-(--text-color)/70 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <textarea
              placeholder={
                language === "es"
                  ? "Escribe aquí tu mensaje o asunto..."
                  : "Write your message or subject here..."
              }
              value={form.subject}
              onChange={(e) => {
                const text = e.target.value

                if (text.length <= MAX_CHARS) {
                  setForm({ ...form, subject: text })
                }
              }}
              maxLength={MAX_CHARS}
              rows="4"
              className="w-full p-3 rounded-xl bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow)] focus:outline-none"
            />
            {errors.subject && (
              <p className="text-(--text-color)/70 text-xs mt-1">{errors.subject}</p>
            )}
            <p className="text-xs opacity-60 text-right">
              {form.subject.length} / {MAX_CHARS}
            </p>
          </div>
          <button
            type="submit"
            className="mt-2 py-3 rounded-xl font-semibold bg-(--text-color) text-(--bg-color) hover:transition transform hover:scale-95 [box-shadow:var(--component-shadow)]"
          >
            {language === "es" ? "Enviar mensaje" : "Send message"}
          </button>
        </form>
        <div className="text-sm opacity-70">
          {language === "es"
            ? "¿Necesitas enviar archivos o capturas? Hazlo directamente por Gmail:"
            : "Need to send files or screenshots? Send it directly via Gmail:"}{" "}

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=guillermogallardopino@gmail.com&su=Contacto%20desde%20Focustar&body=Hola%20Guillermo,%0A%0ATe%20contacto%20desde%20Focustar%20Adjunto%20la%20información%20correspondiente.%0A%0ASaludos."
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-100 transition"
          >
            guillermogallardopino@gmail.com
          </a>
        </div>
      </div>
      <div className="space-y-4 text-center">
        <h3 className="text-lg sm:text-md font-semibold text-shadow-(--text-shadow-strong)">
          {language === "es"
            ? "También puedes contactarme aquí"
            : "You can also contact me here"}
        </h3>
        <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
          <a
            href="https://www.facebook.com/just.Gallardo.98"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition duration-300 hover:scale-110 hover:-translate-y-1"
          >
            <img
              src="/icons/Facebook.png"
              alt="Facebook"
              className="w-10 h-10 opacity-80 hover:opacity-100"
            />
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=guillermogallardopino@gmail.com&su=Consulta%20sobre%20Focustar&body=Hola%20Guillermo,%0A%0AEstuve%20usando%20Focustar%20y%20quiero%20hacer%20una%20consulta%20o%20reportar%20un%20problema.%0A%0ADetalles:"
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition duration-300 hover:scale-110 hover:-translate-y-1"
          >
            <img
              src="/icons/Mail.png"
              alt="Email"
              className="w-10 h-10 opacity-80 hover:opacity-100"
            />
          </a>
          <a
            href="https://wa.me/573126968778?text=Hola%20Guillermo,%20estuve%20usando%20Focustar%20y%20quiero%20hacer%20una%20consulta%20o%20reportar%20algo."
            target="_blank"
            rel="noopener noreferrer"
            className="transform transition duration-300 hover:scale-110 hover:-translate-y-1"
          >
            <img
              src="/icons/Wap.png"
              alt="WhatsApp"
              className="w-10 h-10 opacity-80 hover:opacity-100"
            />
          </a>
        </div>
      </div>
      <div className="text-sm opacity-70 pt-6 border-t border-(--text-color)/20 text-center">
        {language === "es"
          ? "© 2026 Focustar — Desarrollado por Guillermo Gallardo. Todos los derechos reservados."
          : "© 2026 Focustar — Developed by Guillermo Gallardo. All rights reserved."}
      </div>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        theme="dark"
        limit={3}
      />
    </footer>
  )
}

export default Footer