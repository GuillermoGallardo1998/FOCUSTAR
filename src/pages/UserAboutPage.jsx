// pages/UserAboutPage.jsx

import Footer from "../components/Footer";
import { useOutletContext } from "react-router-dom";

function UserAboutPage() {
  const { language } = useOutletContext();

  return (
    <div className=" bg-(--bg-color) text-(--text-color)">
      <div className="max-w-4xl mx-auto pt-30 px-10 pb-6 ">
        <section className="space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl text-center font-bold tracking-tight text-shadow-(--text-shadow-strong)">
            Focustar
          </h1>
          <p className="text-lg text-center">
            {language === "es"
              ? "Focustar es un motor de rutinas inteligentes que lleva el concepto del temporizador tipo Pomodoro a un nivel más estructurado y automático."
              : "Focustar is an intelligent routine engine that elevates the traditional Pomodoro-style timer into a structured and automated productivity system."}
          </p>
          <p className="opacity-85 text-center">
            {language === "es"
              ? "Permite ejecutar bloques de trabajo encadenados automáticamente, guardar rutinas en la nube y mantener el flujo de concentración sin fricciones."
              : "It enables automatic execution of chained work blocks, cloud-based routine storage, and uninterrupted focus flow without friction."}
          </p>
          <p className="opacity-75 text-center">
            {language === "es"
              ? "Diseñada para estudiantes y profesionales que buscan profundidad sin complejidad."
              : "Designed for students and professionals who want depth without unnecessary complexity."}
          </p>
        </section>
        <section className="space-y-4 mb-16">
          <h2 className="text-3xl font-semibold text-center text-shadow-(--text-shadow-strong)">
            {language === "es" ? "El problema" : "The problem"}
          </h2>
          <p className="opacity-85 text-center">
            {language === "es"
              ? "Las herramientas de productividad actuales suelen dividirse en dos extremos: temporizadores demasiado simples que interrumpen el flujo de trabajo, o plataformas excesivamente complejas que requieren más planificación que ejecución."
              : "Modern productivity tools often fall into two extremes: overly simple timers that interrupt workflow, or excessively complex platforms that require more planning than execution."}
          </p>
          <p className="opacity-75 text-center">
            {language === "es"
              ? "Los temporizadores tradicionales no permiten encadenar bloques automáticamente, lo que obliga al usuario a intervenir constantemente y rompe el estado de concentración en rutinas largas."
              : "Traditional timers do not allow automatic chaining of work blocks, forcing users to constantly intervene and breaking concentration during long structured sessions."}
          </p>
          <p className="opacity-65 text-center">
            {language === "es"
              ? "Por otro lado, las herramientas avanzadas suelen añadir fricción innecesaria mediante configuraciones complejas y flujos pesados."
              : "On the other hand, advanced platforms often introduce unnecessary friction through complex configurations and heavy workflows."}
          </p>
        </section>
        <section className="space-y-6 mb-16">
          <h2 className="text-3xl font-semibold text-center text-shadow-(--text-shadow-strong)">
            {language === "es" ? "Características principales" : "Core Features"}
          </h2>
          <ul className="space-y-4 opacity-85">
            <li>
              ⏱ <strong>{language === "es" ? "Temporizador dinámico y configurable" : "Dynamic and configurable countdown timer"}</strong>
              <p className="opacity-70 text-sm mt-1">
                {language === "es"
                  ? "Edición flexible de minutos, control completo de inicio, pausa y reinicio con retroalimentación sonora personalizable."
                  : "Flexible minute editing, full start/pause/reset control with customizable audio feedback."}
              </p>
            </li>
            <li>
              🔁 <strong>{language === "es" ? "Ejecución automática de bloques" : "Automatic block chaining"}</strong>
              <p className="opacity-70 text-sm mt-1">
                {language === "es"
                  ? "Las rutinas se ejecutan de forma continua sin intervención manual, manteniendo el flujo de concentración en sesiones largas."
                  : "Routines execute continuously without manual intervention, preserving focus flow during long structured sessions."}
              </p>
            </li>
            <li>
              ☁️ <strong>{language === "es" ? "Persistencia en la nube multi-dispositivo" : "Cloud-based multi-device persistence"}</strong>
              <p className="opacity-70 text-sm mt-1">
                {language === "es"
                  ? "Las rutinas se almacenan por usuario y se sincronizan entre dispositivos mediante Cloud Firestore."
                  : "User routines are securely stored and synchronized across devices using Cloud Firestore."}
              </p>
            </li>
            <li>
              🔐 <strong>Firebase Authentication</strong>
              <p className="opacity-70 text-sm mt-1">
                {language === "es"
                  ? "Sistema de autenticación con correo y contraseña que permite separar el modo rápido del modo avanzado."
                  : "Email/password authentication system enabling separation between quick-use and advanced modes."}
              </p>
            </li>
          </ul>
        </section>
        <section className="space-y-12 mb-16">
          <h2 className="text-3xl font-semibold text-center text-shadow-(--text-shadow-strong)">
            {language === "es" ? "Arquitectura y tecnologías" : "Architecture & Technologies"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm [box-shadow:var(--component-shadow)]">
              <h3 className="font-semibold mb-3">Frontend</h3>
              <ul className="space-y-1 opacity-85">
                <li>{language === "es" ? "• React + Vite" : "• React + Vite"}</li>
                <li>{language === "es" ? "• JavaScript (ES6+)" : "• JavaScript (ES6+)"}</li>
                <li>{language === "es" ? "• Tailwind CSS" : "• Tailwind CSS"}</li>
                <li>{language === "es" ? "• Arquitectura modular de componentes" : "• Modular component architecture"}</li>
                <li>{language === "es" ? "• Responsive Web Design" : "• Responsive Web Design"}</li>
                <li>{language === "es" ? "• Accesibilidad (ARIA + HTML semántico)" : "• Accessibility (ARIA + semantic HTML)"}</li>
                <li>{language === "es" ? "• Optimización de rendimiento" : "• Performance optimization"}</li>
                <li>{language === "es" ? "• SEO Best Practices" : "• SEO best practices"}</li>
                <li>{language === "es" ? "• Animaciones e interacciones hechas a mano" : "• Hand-crafted animations and interactions"}</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm [box-shadow:var(--component-shadow)]">
              <h3 className="font-semibold mb-3">
                {language === "es" ? "Estado y lógica" : "State & Logic"}
              </h3>
              <ul className="space-y-1 opacity-85">
                <li>{language === "es" ? "• React Hooks (useState, useEffect)" : "• React Hooks (useState, useEffect)"}</li>
                <li>{language === "es" ? "• Zustand (estado global)" : "• Zustand (global state)"}</li>
                <li>{language === "es" ? "• Encadenamiento automático de temporizadores" : "• Automatic timer chaining"}</li>
                <li>{language === "es" ? "• Motor de ejecución por bloques" : "• Block-based execution engine"}</li>
                <li>{language === "es" ? "• Persistencia híbrida (local + nube)" : "• Hybrid persistence (local + cloud)"}</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm [box-shadow:var(--component-shadow)]">
              <h3 className="font-semibold mb-3">
                {language === "es" ? "Backend y Nube" : "Backend & Cloud"}
              </h3>
              <ul className="space-y-1 opacity-85">
                <li>{language === "es" ? "• Firebase Authentication" : "• Firebase Authentication"}</li>
                <li>{language === "es" ? "• Cloud Firestore" : "• Cloud Firestore"}</li>
                <li>{language === "es" ? "• Sincronización multi-dispositivo" : "• Multi-device synchronization"}</li>
                <li>{language === "es" ? "• Firebase Hosting" : "• Firebase Hosting"}</li>
                <li>{language === "es" ? "• EmailJS (automatización de correos / formularios de contacto)" : "• EmailJS (email automation / contact forms)"}</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm [box-shadow:var(--component-shadow)]">
              <h3 className="font-semibold mb-3">
                {language === "es" ? "Calidad y desarrollo" : "Quality & Development"}
              </h3>
              <ul className="space-y-1 opacity-85">
                <li>{language === "es" ? "• ESLint (estandarización de código)" : "• ESLint (code standardization)"}</li>
                <li>{language === "es" ? "• Control de versiones con Git & GitHub" : "• Version control with Git & GitHub"}</li>
                <li>{language === "es" ? "• Arquitectura escalable" : "• Scalable architecture"}</li>
                <li>{language === "es" ? "• Diseño centrado en experiencia de usuario" : "• User-centered design"}</li>
              </ul>
            </div>
          </div>
        </section>
        <section className="space-y-8 border-t border-white/10 pt-10 pb-30 flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl font-semibold text-shadow-(--text-shadow-strong)">
            {language === "es" ? "Sobre el desarrollador" : "About the Developer"}
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-5xl">
            <div className="shrink-0">
              <img
                src="/images/PhotoMemo.jpeg"
                alt="Guillermo Gallardo"
                className="w-48 h-48 object-cover rounded-full border border-(--text-color)/20 [box-shadow:var(--component-shadow)]"
              />
            </div>
            <div className="space-y-5 md:text-left">
              <p className="opacity-85 leading-relaxed">
                {language === "es"
                  ? "Soy Guillermo Andrés Gallardo Pino, desarrollador web enfocado en construir productos funcionales, escalables y centrados en la experiencia del usuario. Focustar representa mi enfoque: identificar fricciones reales, diseñar una arquitectura clara y desarrollar soluciones completas de extremo a extremo."
                  : "I am Guillermo Andrés Gallardo Pino, a web developer focused on building functional, scalable, and user-centered products. Focustar reflects my approach: identifying real friction points, designing clear architectures, and delivering end-to-end solutions."}
              </p>
              <p className="opacity-75 leading-relaxed">
                {language === "es"
                  ? "El proyecto está construido bajo una arquitectura frontend moderna con integración de backend como servicio (BaaS), utilizando React para la capa de presentación y Firebase para autenticación, persistencia y sincronización en la nube."
                  : "The project is built using a modern frontend architecture with Backend-as-a-Service (BaaS) integration, leveraging React for the presentation layer and Firebase for authentication, persistence, and cloud synchronization."}
              </p>
              <p className="opacity-65 leading-relaxed">
                {language === "es"
                  ? "Actualmente busco oportunidades donde pueda aportar valor diseñando y desarrollando aplicaciones web bien estructuradas, mantenibles y preparadas para escalar."
                  : "Currently seeking opportunities where I can contribute by designing and developing well-structured, maintainable, and scalable web applications."}
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer language={language} />
    </div>
  );
}

export default UserAboutPage;