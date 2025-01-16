import { useState, useCallback, useRef } from 'react';
import { useLoadScript, GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import styled from '@emotion/styled';
import PlacesAutocomplete from './PlacesAutocomplete';

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 400px;
  background: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const MapContainer = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: #34495e;
    font-weight: bold;
  }
`;

const Button = styled.button`
  background: #2c3e50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  margin: 20px 0;

  &:hover {
    background: #34495e;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const RouteInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const ScenicRatingInfo = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #e8f4f8;
  border-radius: 8px;
  
  h3 {
    color: #2c3e50;
    margin-bottom: 10px;
  }

  ul {
    margin: 10px 0;
    padding-left: 20px;
  }

  li {
    margin: 5px 0;
  }
`;

const InfoItem = styled.div`
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 20px;
    height: 20px;
    color: #2c3e50;
  }
`;

const CheckboxContainer = styled.div`
  margin: 15px 0;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 8px;
  border: 1px solid #cce0ff;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  
  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .tooltip {
    color: #666;
    font-size: 0.9rem;
    margin-top: 5px;
  }
`;

const WaypointInfo = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: #fff3e0;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
  max-height: 50vh;
  overflow-y: auto;

  h4 {
    color: #f57c00;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    position: sticky;
    top: 0;
    background: #fff3e0;
    padding: 5px 0;
  }

  .timeline {
    position: relative;
    padding-left: 20px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ff9800;
    }
  }

  .stop {
    margin: 15px 0;
    padding: 15px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: -24px;
      top: 50%;
      width: 10px;
      height: 10px;
      background: #ff9800;
      border-radius: 50%;
      transform: translateY(-50%);
    }

    .stop-name {
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .stop-type {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 5px;
    }

    .stop-rating {
      color: #f57c00;
      margin-bottom: 5px;
    }

    .stop-status {
      font-size: 0.9em;
      color: ${props => props.isOpen ? '#4caf50' : '#f44336'};
    }
  }
`;

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Key exists' : 'No key found');

function MapWithRoutes() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maxFun, setMaxFun] = useState(false);
  const [waypoints, setWaypoints] = useState([]);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const onMapLoad = useCallback((map) => {
    mapInstanceRef.current = map;
  }, []);

  const calculateFunRating = (route) => {
    const steps = route.legs[0].steps.length;
    const distance = route.legs[0].distance.value;
    const duration = route.legs[0].duration.value;
    
    const avgSpeed = distance / duration;
    const stepDensity = steps / (distance / 1000);
    
    let rating = Math.min(Math.round(stepDensity / 2), 5);
    if (avgSpeed < 40) rating = Math.min(rating + 1, 5);
    
    return rating;
  };

  const getFunWaypoints = async (startLoc, endLoc) => {
    if (!mapInstanceRef.current) return [];

    const service = new google.maps.places.PlacesService(mapInstanceRef.current);
    const directionsService = new google.maps.DirectionsService();

    try {
      // Single initial route calculation
      const initialRoute = await directionsService.route({
        origin: startLoc,
        destination: endLoc,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      const totalDuration = initialRoute.routes[0].legs[0].duration.value;
      const numberOfStops = Math.min(Math.max(Math.floor(totalDuration / (90 * 60)), 1), 3);

      const path = initialRoute.routes[0].overview_path;
      const stopPoints = [];

      // Calculate all stop points at once
      for (let i = 1; i <= numberOfStops; i++) {
        const pointIndex = Math.floor((path.length * i) / (numberOfStops + 1));
        stopPoints.push(path[pointIndex]);
      }

      // Batch process nearby search
      const searchPromises = stopPoints.map((point, index) => 
        new Promise((resolve) => {
          service.nearbySearch({
            location: point,
            radius: '3000', // Reduced radius
            rankBy: google.maps.places.RankBy.RATING,
            type: ['tourist_attraction', 'amusement_park', 'park'] // Reduced types
          }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
              resolve({
                ...results[0],
                location: results[0].geometry.location,
                distanceFromStart: `Stop ${index + 1}`
              });
            } else {
              resolve(null);
            }
          });
        })
      );

      const places = await Promise.all(searchPromises);
      const validPlaces = places.filter(place => place !== null);
      
      setWaypoints(validPlaces);
      
      return validPlaces.map(place => ({
        location: place.location,
        stopover: true
      }));

    } catch (error) {
      console.error('Error finding fun waypoints:', error);
      setWaypoints([]);
      return [];
    }
  };

  const calculateFun = useCallback(async () => {
    if (!source || !destination) return;

    setLoading(true);
    const directionsService = new google.maps.DirectionsService();

    try {
      let routeOptions = {
        origin: source,
        destination: destination,
        provideRouteAlternatives: true,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      if (maxFun) {
        const waypoints = await getFunWaypoints(source, destination);
        if (waypoints.length > 0) {
          routeOptions.waypoints = waypoints;
          routeOptions.optimizeWaypoints = true;
        }
      }

      const result = await directionsService.route(routeOptions);
      const routes = result.routes;
      let funRoute = routes[0];
      
      if (routes.length > 1) {
        funRoute = routes.reduce((prev, current) => {
          return prev.legs[0].steps.length > current.legs[0].steps.length ? prev : current;
        });
      }

      const totalDistance = funRoute.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
      const totalDuration = funRoute.legs.reduce((sum, leg) => sum + leg.duration.value, 0);
      const totalSteps = funRoute.legs.reduce((sum, leg) => sum + leg.steps.length, 0);

      let funRating = calculateFunRating(funRoute);
      if (maxFun && routeOptions.waypoints) {
        funRating = Math.min(funRating + routeOptions.waypoints.length, 5);
      }

      setDirections({ ...result, routes: [funRoute] });
      setRouteInfo({
        distance: `${Math.round(totalDistance / 1000)} km`,
        duration: `${Math.round(totalDuration / 60)} mins`,
        steps: totalSteps,
        funRating,
        hasDetours: maxFun && routeOptions.waypoints?.length > 0
      });
    } catch (error) {
      console.error('Detailed routing error:', error);
      alert('Could not calculate route. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  }, [source, destination, maxFun]);

  if (loadError) {
    console.error('Maps load error:', loadError);
    return <div>Error loading maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <Container>
      <Sidebar>
        <Title>Fun Route Finder 🎉</Title>
        
        <InputGroup>
          <label>Starting Point</label>
          <PlacesAutocomplete
            value={source}
            onChange={setSource}
            placeholder="Enter starting location"
          />
        </InputGroup>

        <InputGroup>
          <label>Destination</label>
          <PlacesAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder="Enter destination"
          />
        </InputGroup>

        <CheckboxContainer>
          <Checkbox>
            <input
              type="checkbox"
              checked={maxFun}
              onChange={(e) => setMaxFun(e.target.checked)}
            />
            <div>
              <div>Maximum Fun Route 🎢</div>
              <div className="tooltip">
                Adds exciting detours to interesting places along the way!
              </div>
            </div>
          </Checkbox>
        </CheckboxContainer>

        <Button 
          onClick={calculateFun}
          disabled={loading || !source || !destination}
        >
          {loading ? 'Calculating...' : 'Find Fun Route'}
        </Button>
        
        {routeInfo && (
          <>
            <RouteInfo>
              <InfoItem>
                <span>🛣️ Distance:</span> {routeInfo.distance}
              </InfoItem>
              <InfoItem>
                <span>⏱️ Duration:</span> {routeInfo.duration}
              </InfoItem>
              <InfoItem>
                <span>🎈 Fun Rating:</span> {routeInfo.funRating}/5
                {routeInfo.hasDetours && ' (Includes fun detours!)'}
              </InfoItem>
            </RouteInfo>

            {maxFun && waypoints.length > 0 && (
              <WaypointInfo>
                <h4>
                  <span>🎯 Fun Stops Along the Way</span>
                </h4>
                <div className="timeline">
                  {waypoints.map((place, index) => (
                    <div key={index} className="stop">
                      <div className="stop-name">
                        {index + 1}. {place.name}
                      </div>
                      <div className="stop-type">
                        {place.types?.[0]?.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>
                      {place.rating && (
                        <div className="stop-rating">
                          ⭐ {place.rating} / 5
                        </div>
                      )}
                      <div className="stop-distance">
                        {place.distanceFromStart} into journey
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                  Stops are spaced approximately 90 minutes apart for optimal fun! 🎉
                </p>
              </WaypointInfo>
            )}
          </>
        )}

        <ScenicRatingInfo>
          <h3>How We Calculate Fun Routes</h3>
          <p>Our fun rating (1-5) is based on several factors:</p>
          <ul>
            <li>Number of interesting turns and stops</li>
            <li>Variety of roads and paths</li>
            <li>Route adventure level</li>
            {maxFun && (
              <li>
                <strong>Bonus fun stops</strong> - We'll add exciting detours to 
                highly-rated attractions along your route!
              </li>
            )}
          </ul>
          <p>A higher rating suggests:</p>
          <ul>
            <li>More varied terrain</li>
            <li>Less boring highway driving</li>
            <li>More interesting places along the way</li>
          </ul>
        </ScenicRatingInfo>
      </Sidebar>

      <MapContainer>
        <GoogleMap
          ref={mapRef}
          onLoad={onMapLoad}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          zoom={13}
          center={{ lat: 40.7128, lng: -74.0060 }} // Default to NYC
          options={{
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#2c3e50',
                  strokeWeight: 5,
                },
              }}
            />
          )}
        </GoogleMap>
      </MapContainer>
    </Container>
  );
}

export default MapWithRoutes; 