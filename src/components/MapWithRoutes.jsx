import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, DirectionsRenderer, useLoadScript } from '@react-google-maps/api';
import styled from '@emotion/styled';
import PlacesAutocomplete from './PlacesAutocomplete';

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 400px;
  padding: 20px;
  background: #f8f9fa;
  overflow-y: auto;
`;

const MapContainer = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  color: #1976d2;
  margin-bottom: 30px;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    font-size: 1.2em;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background: #95a5a6;
  }
`;

const RouteCard = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.1);
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(25, 118, 210, 0.2);
  }
`;

const RouteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(25, 118, 210, 0.2);

  h4 {
    margin: 0;
    color: #1565c0;
    font-size: 1.4em;
    font-weight: 600;
  }

  .emoji {
    font-size: 1.6em;
  }
`;

const RouteSection = styled.div`
  position: relative;
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border-left: 4px solid #1976d2;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transform: translateX(0);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;

  &:hover {
    background: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: translateX(4px);
  }
`;

const FeatureTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  margin: 4px;
  background: ${props => props.gradient || 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)'};
  color: #1565c0;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.1);
  transform: translateY(0);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(25, 118, 210, 0.2);
  }

  .icon {
    font-size: 1.1em;
  }
`;

const DrivingTip = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 10px;
  font-style: italic;
  color: #e65100;
  font-size: 0.9em;
  box-shadow: 0 2px 8px rgba(230, 81, 0, 0.1);
  transform: translateY(0);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(230, 81, 0, 0.15);
  }
`;

const RouteStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: white;
    border-radius: 8px;
    font-size: 0.9em;
    font-weight: 500;
    color: #1976d2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transform: translateY(0);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: default;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .icon {
      font-size: 1.2em;
    }
  }
`;

const ProTipsCard = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.2);

  h5 {
    margin: 0 0 15px 0;
    font-size: 1.1em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      margin: 8px 0;
      font-size: 0.9em;
      line-height: 1.4;
      
      &::marker {
        color: #90caf9;
      }
    }
  }
`;

// Add a new styled component for the weight selector
const WeightSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 8px;

  label {
    font-size: 0.9em;
    color: #1976d2;
  }

  select {
    padding: 4px 8px;
    border: 1px solid #90caf9;
    border-radius: 4px;
    background: white;
    color: #1976d2;
    cursor: pointer;

    &:hover {
      border-color: #1976d2;
    }
  }
`;

const SCENIC_QUERIES = [
  'scenic overlook',
  'vista point',
  'scenic viewpoint',
  'mountain pass',
  'scenic drive',
  'lookout point'
];

function MapWithRoutes() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Add state for feature weights
  const [weights, setWeights] = useState({
    'Hairpin Turns': 2,
    'Elevation Changes': 2,
    'Scenic Views': 2,
    'Switchbacks': 2,
    'Long Sweepers': 2,
    'Low Traffic': 2,
    'Forest Route': 2,
    'Mountain Road': 2
  });

  // Add maximum detour time state (in minutes)
  const [maxDetourTime] = useState(120); // 2 hours default

  const onMapLoad = useCallback((map) => {
    mapInstanceRef.current = map;
  }, []);

  const getFunWaypoints = async (startLoc, endLoc) => {
    if (!mapInstanceRef.current) return [];

    try {
      const service = new google.maps.places.PlacesService(mapInstanceRef.current);
      const directionsService = new google.maps.DirectionsService();

      const initialRoute = await directionsService.route({
        origin: startLoc,
        destination: endLoc,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      if (!initialRoute.routes || initialRoute.routes.length === 0) {
        throw new Error('No initial route found');
      }

      const path = initialRoute.routes[0].overview_path;
      const totalDistance = initialRoute.routes[0].legs[0].distance.value;
      
      const numberOfStops = Math.min(
        Math.max(Math.floor(totalDistance / 40000), 2),
        4
      );

      console.log(`Searching for ${numberOfStops} scenic locations...`);

      const waypoints = [];
      for (let i = 1; i <= numberOfStops; i++) {
        const pointIndex = Math.floor((path.length * i) / (numberOfStops + 1));
        const searchPoint = path[pointIndex];
        
        // Try multiple queries for each point
        let foundPlace = null;
        for (const query of SCENIC_QUERIES) {
          if (foundPlace) break;

          const searchPromise = new Promise((resolve) => {
            const request = {
              query: query,
              location: {
                lat: searchPoint.lat(),
                lng: searchPoint.lng()
              },
              radius: 20000,
              rankBy: google.maps.places.RankBy.RATING
            };

            service.textSearch(request, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results?.length > 0) {
                // Filter results for places with actual names
                const validResults = results.filter(place => 
                  place.name && 
                  !place.name.toLowerCase().includes('unnamed') &&
                  !place.name.toLowerCase().includes('point') &&
                  place.rating
                );

                if (validResults.length > 0) {
                  resolve(validResults[0]);
                } else {
                  resolve(null);
                }
              } else {
                resolve(null);
              }
            });
          });

          const result = await searchPromise;
          if (result) {
            foundPlace = {
              location: result.geometry.location,
              name: result.name,
              rating: result.rating || 4.0,
              distanceFromStart: `${Math.round((i / (numberOfStops + 1)) * 100)}%`,
              placeId: result.place_id
            };
          }
        }

        // If no specific place found, use fallback
        if (!foundPlace) {
          foundPlace = {
            location: searchPoint,
            name: `Scenic Point ${i}`,
            rating: 4.0,
            distanceFromStart: `${Math.round((i / (numberOfStops + 1)) * 100)}%`
          };
        }

        console.log(`Found waypoint: ${foundPlace.name}`);
        waypoints.push(foundPlace);
      }

      return waypoints.map(wp => ({
        location: wp.location,
        stopover: true
      }));

    } catch (error) {
      console.warn('Error in getFunWaypoints:', error);
      return [];
    }
  };

  const calculateFunRating = useCallback((route) => {
    try {
      const steps = route.legs.reduce((sum, leg) => sum + leg.steps.length, 0);
      const distance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
      const duration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);
      
      // More steps per km indicates more turns/complexity
      const complexity = steps / (distance / 1000);
      // Average speed (lower is better, indicates twisty roads)
      const avgSpeed = distance / duration;
      
      let rating = Math.min(Math.round(complexity / 1.5), 5);
      if (avgSpeed < 50) rating = Math.min(rating + 1, 5); // Bonus for slower, twistier routes
      if (waypoints.length > 0) rating = Math.min(rating + waypoints.length, 5);
      
      return Math.max(rating, 3); // Minimum rating of 3
    } catch (error) {
      console.warn('Error calculating fun rating:', error);
      return 3; // Default rating if calculation fails
    }
  }, [waypoints]);

  const calculateRouteStats = useCallback((route) => {
    try {
      const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
      const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);
      const avgSpeed = totalDistance / totalDuration;
      const turns = route.legs.reduce((sum, leg) => 
        sum + leg.steps.filter(step => 
          step.maneuver && ['turn', 'roundabout'].some(type => 
            step.maneuver.includes(type)
          )
        ).length, 0);

      return {
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        avgSpeed: Math.round(avgSpeed * 3.6), // Convert to km/h
        turns,
        elevation: Math.round(100 + Math.random() * 400),
        funRating: calculateFunRating(route),
        detourTime: waypoints.reduce((sum, wp) => sum + (wp.estimatedDetour || 0), 0)
      };
    } catch (error) {
      console.warn('Error calculating route stats:', error);
      return {
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        funRating: 3
      };
    }
  }, [calculateFunRating, waypoints]);

  const calculateRoute = useCallback(async () => {
    if (!source || !destination) return;

    setLoading(true);
    const directionsService = new google.maps.DirectionsService();

    try {
      let routeOptions = {
        origin: source,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      };

      // Always try to get fun waypoints now
      const funWaypoints = await getFunWaypoints(source, destination);
      if (funWaypoints && funWaypoints.length > 0) {
        routeOptions.waypoints = funWaypoints;
        routeOptions.optimizeWaypoints = false;
        setWaypoints(funWaypoints.map((wp, index) => ({
          ...wp,
          name: `Scenic Point ${index + 1}`,
          type: 'scenic_point',
          rating: 4.0,
          distanceFromStart: `${Math.round(((index + 1) / (funWaypoints.length + 1)) * 100)}%`
        })));
      }

      const result = await directionsService.route(routeOptions);
      setDirections(result);
      
      const route = result.routes[0];
      const stats = calculateRouteStats(route);
      setRouteInfo(stats);

    } catch (error) {
      console.error('Route calculation error:', error);
      alert('Could not calculate route. Please try different locations.');
      setDirections(null);
      setRouteInfo(null);
      setWaypoints([]);
    } finally {
      setLoading(false);
    }
  }, [source, destination]);

  const generateDrivingFeatures = useCallback((place) => {
    const possibleFeatures = [
      { icon: '↪️', text: 'Hairpin Turns' },
      { icon: '⛰️', text: 'Elevation Changes' },
      { icon: '🌄', text: 'Scenic Views' },
      { icon: '🔄', text: 'Switchbacks' },
      { icon: '📏', text: 'Long Sweepers' },
      { icon: '🚥', text: 'Low Traffic' },
      { icon: '🌲', text: 'Forest Route' },
      { icon: '🏔️', text: 'Mountain Road' }
    ];

    // Select 3-4 random features
    return possibleFeatures
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 2));
  }, []);

  const generateDrivingTip = useCallback((place) => {
    const tips = [
      "Perfect for early morning drives with minimal traffic",
      "Watch for cyclists on weekends",
      "Great sunset views along this section",
      "Multiple photo opportunities at viewpoints",
      "Challenging corners - take it easy first time",
      "Popular among local driving enthusiasts",
      "Road surface is well maintained",
      "Good coffee stop nearby for a break"
    ];

    return "💡 " + tips[Math.floor(Math.random() * tips.length)];
  }, []);

  const estimateSegmentLength = (place) => {
    // Simulate segment length based on position
    return Math.floor(10 + Math.random() * 15);
  };

  const estimateElevationChange = (place) => {
    // Simulate elevation changes
    return Math.floor(100 + Math.random() * 400);
  };

  // Update getFeatureGradient to use weights
  const getFeatureGradient = useCallback((featureType) => {
    const weight = weights[featureType] || 2;
    const gradients = {
      'Hairpin Turns': {
        1: '#bbdefb 0%, #90caf9 100%',
        2: '#90caf9 0%, #42a5f5 100%',
        3: '#42a5f5 0%, #1976d2 100%'
      },
      'Elevation Changes': {
        1: '#c8e6c9 0%, #a5d6a7 100%',
        2: '#a5d6a7 0%, #66bb6a 100%',
        3: '#66bb6a 0%, #388e3c 100%'
      },
      'Scenic Views': {
        1: '#fff3e0 0%, #ffe0b2 100%',
        2: '#ffe0b2 0%, #ffb74d 100%',
        3: '#ffb74d 0%, #f57c00 100%'
      },
      'Switchbacks': {
        1: '#e1bee7 0%, #ce93d8 100%',
        2: '#ce93d8 0%, #ab47bc 100%',
        3: '#ab47bc 0%, #7b1fa2 100%'
      },
      'Long Sweepers': {
        1: '#b3e5fc 0%, #81d4fa 100%',
        2: '#81d4fa 0%, #29b6f6 100%',
        3: '#29b6f6 0%, #0288d1 100%'
      },
      'Low Traffic': {
        1: '#dcedc8 0%, #c5e1a5 100%',
        2: '#c5e1a5 0%, #aed581 100%',
        3: '#aed581 0%, #689f38 100%'
      },
      'Forest Route': {
        1: '#c8e6c9 0%, #a5d6a7 100%',
        2: '#a5d6a7 0%, #66bb6a 100%',
        3: '#66bb6a 0%, #388e3c 100%'
      },
      'Mountain Road': {
        1: '#d1c4e9 0%, #b39ddb 100%',
        2: '#b39ddb 0%, #7e57c2 100%',
        3: '#7e57c2 0%, #512da8 100%'
      }
    };

    return gradients[featureType]?.[weight] || '#bbdefb 0%, #90caf9 100%';
  }, [weights]);

  useEffect(() => {
    document.title = 'Fun Routes';
  }, []);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
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

        <Button 
          onClick={calculateRoute}
          disabled={loading || !source || !destination}
        >
          {loading ? 'Calculating...' : 'Find Route'}
        </Button>

        {routeInfo && (
          <div style={{ marginTop: '20px' }}>
            <div>Distance: {routeInfo.distance}</div>
            <div>Duration: {routeInfo.duration}</div>
          </div>
        )}

        {waypoints.length > 0 && (
          <RouteCard>
            <RouteHeader>
              <span className="emoji">🎯</span>
              <h4>Epic Adventure Route</h4>
            </RouteHeader>
            
            {waypoints.map((place, index) => (
              <RouteSection key={index}>
                <div className="place-name">
                  <span className="number">{index + 1}</span>
                  {place.name}
                </div>
                {place.rating && (
                  <div className="rating">
                    ⭐ {place.rating.toFixed(1)} / 5
                  </div>
                )}
                <div className="distance">
                  {place.distanceFromStart} along the route
                </div>
              </RouteSection>
            ))}
          </RouteCard>
        )}
      </Sidebar>

      <MapContainer>
        <GoogleMap
          ref={mapRef}
          onLoad={onMapLoad}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          zoom={13}
          center={{ lat: 40.7128, lng: -74.0060 }}
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
                suppressMarkers: false,
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