// HomePage.jsx

import { useState } from "react"
import Header from "../components/Header"
import HomeTimer from "../components/HomeTimer"
import Footer from "../components/Footer"
import HomeInformation from "../components/HomeInformation"

function HomePage() {
  const [language, setLanguage] = useState("es")

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "es" ? "en" : "es"))
  }

  return (
    <>
      <Header language={language} toggleLanguage={toggleLanguage} />
      <HomeTimer language={language} />
      <HomeInformation language={language} />
      <Footer language={language} />
    </>
  )
}

export default HomePage
