import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import styled from '@emotion/styled';

const MapContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
`;

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060 // New York coordinates
};

function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <LoadingContainer>Loading maps...</LoadingContainer>;

  return (
    <MapContainer>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        zoom={13}
        center={defaultCenter}
        options={{
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        <Marker position={defaultCenter} />
      </GoogleMap>
    </MapContainer>
  );
}

export default Map; 