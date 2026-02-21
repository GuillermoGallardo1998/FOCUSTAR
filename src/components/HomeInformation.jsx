// HomeInformation.jsx

function HomeInformation({language}) {
  return (
    <div className="h-screen w-full mb-4 flex gap-2 border-t border-(--text-color)">
      <h2>{language === "es" ? "seccion informativa" : "Information section"}</h2>
    </div>
  )
}

export default HomeInformation

