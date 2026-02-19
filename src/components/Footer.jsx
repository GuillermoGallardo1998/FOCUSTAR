// Footer.jsx

import { useState } from "react"

function Footer({ language }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
  })

  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!form.name.trim())
      newErrors.name =
        language === "es" ? "Ingresa tu nombre" : "Enter your name"

    if (!/^[0-9]{7,15}$/.test(form.phone))
      newErrors.phone =
        language === "es"
          ? "Número inválido (solo números, 7 a 15 dígitos)"
          : "Invalid number (only numbers, 7 to 15 digits)"

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email =
        language === "es"
          ? "Correo electrónico inválido"
          : "Invalid email"

    if (form.subject.trim().length < 5)
      newErrors.subject =
        language === "es"
          ? "El asunto debe tener al menos 5 caracteres"
          : "Subject must be at least 5 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    alert(
      language === "es"
        ? "Mensaje validado ✅ (aquí luego lo conectamos para enviarlo)"
        : "Message validated ✅ (we will connect sending later)"
    )

    setForm({ name: "", phone: "", email: "", subject: "" })
  }

  return (
    <footer className="min-h-full flex flex-col justify-start border-t border-(--text-color) pt-30 px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-16">
      {/* 🔹 FORMULARIO */}
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
              className="w-full p-3 rounded bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow)]"
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
              className="w-full p-3 rounded bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow)]"
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
              className="w-full p-3 rounded bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow)]"
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
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              rows="4"
              className="w-full p-3 rounded bg-(--bg-color) border-2 border-(--text-color)/50 text-(--text-color) placeholder-(--text-color)/40 [box-shadow:var(--component-shadow)]"
            />
            {errors.subject && (
              <p className="text-(--text-color)/70 text-xs mt-1">{errors.subject}</p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 py-3 rounded-lg font-semibold bg-(--text-color) text-(--bg-color) hover:transition transform hover:scale-95"
          >
            {language === "es" ? "Enviar mensaje" : "Send message"}
          </button>
        </form>











        <div className="text-sm opacity-70">
          {language === "es"
            ? "¿Necesitas enviar archivos o capturas? Hazlo directamente por Gmail:"
            : "Need to send files or screenshots? Send it directly via Gmail:"}{" "}

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=guillermogallardopino@gmail.com&su=Contacto%20desde%20Focustar&body=Hola%20Guillermo,%0A%0ATe%20contacto%20desde%20tu%20portafolio.%20Adjunto%20la%20información%20correspondiente.%0A%0ASaludos."
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
              className="w-10 h-10 opacity-80 hover:opacity-10"
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

      <div className="text-sm opacity-70 pt-6 border-t border-white/5 text-center">
        {language === "es"
          ? "© 2026 Focustar — Desarrollado por Guillermo Gallardo. Todos los derechos reservados."
          : "© 2026 Focustar — Developed by Guillermo Gallardo. All rights reserved."}
      </div>
    </footer>
  )
}

export default Footer
