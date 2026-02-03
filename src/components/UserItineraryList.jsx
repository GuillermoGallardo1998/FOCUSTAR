// UserItineraryList.jsx

function UserItineraryList({language}) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <h2>{language === "es" ? "Nuevo Itinerario" : "New Itinerary"}</h2>
    
    </div>
  )
}

export default UserItineraryList
