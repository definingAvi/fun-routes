import MapWithRoutes from './components/MapWithRoutes'
import { LoadScript } from '@react-google-maps/api'

// Define libraries array outside component
const libraries = ['places', 'geometry'];

function App() {
  return (
    <LoadScript 
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <MapWithRoutes />
    </LoadScript>
  )
}

export default App
