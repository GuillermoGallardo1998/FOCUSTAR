// components/HomeInformation.jsx

import { useState } from "react";

function HomeInformation({ language }) {
  const [hovered, setHovered] = useState(null);

  const text = {
    title: language === "es" ? "Descubre todas las funciones" : "Discover all features",
    page1Title: language === "es" ? "Creación de Rutinas" : "Routine Creation",
    page1Desc: language === "es"
      ? "Crea rutinas personalizadas, edítalas, organízalas y elimina lo que no necesites. Controla alarmas y bloques de enfoque para optimizar tu productividad."
      : "Create personalized routines, edit, organize, and remove what you don't need. Control alarms and focus blocks to optimize your productivity.",
    page2Title: language === "es" ? "Listas de Tareas" : "Task Lists",
    page2Desc: language === "es"
      ? "Crea listas con nombre propio, cambia colores, organiza y elimina tareas, marca como hechas y conoce el progreso de cada lista."
      : "Create named lists, change colors, organize and delete tasks, mark them as done, and track progress of each list.",
  };

  const images = [
    { id: 1,
      src: language === "es" ? "/images/RoutineList.png" : "/images/RoutineList-EN.png",
      alt: "Routine creation",
      scrollPercent: 50
    },
    { id: 2,
      src: language === "es" ? "/images/TaskList.png" : "/images/TaskList-EN.png",
      alt: "Task lists",
      scrollPercent: 30
    }
  ];

  return (
    <div className="w-full flex flex-col items-center gap-15 md:gap-30 p-10 pb-30 md:pb-50 md:p-20 bg-(--bg-color)">
      <h2 className="text-3xl md:text-4xl font-bold text-(--text-color) text-center text-shadow">{text.title}</h2>
      {images.map((img, index) => (
        <div
          key={img.id}
          className={`flex flex-col md:flex-row ${index === 1 ? 'md:flex-row-reverse' : ''} items-center gap-10 max-w-6xl`}
        >
          <div
            className="overflow-hidden rounded-lg component-shadow w-75 h-100 sm:w-100 sm:h-125 lg:w-150  lg:h-170"
            onMouseEnter={() => setHovered(img.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-auto transition-transform duration-5000 ease-in-out"
              style={{
                transform: hovered === img.id ? `translateY(-${img.scrollPercent}%)` : "translateY(0%)"
              }}
            />
          </div>
          <div className="flex flex-col gap-4 sm:w-120 md:w-1/2 text-(--text-color) text-center text-shadow">
            <h3 className="text-2xl font-semibold">{index === 0 ? text.page1Title : text.page2Title}</h3>
            <p>{index === 0 ? text.page1Desc : text.page2Desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HomeInformation;