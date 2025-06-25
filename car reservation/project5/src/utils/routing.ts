import { Location, RouteData } from '../types/booking';

export const calculateDistance = (point1: Location, point2: Location): number => {
  const R = 6371; 
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getRoute = async (source: Location, destination: Location): Promise<RouteData> => {
  try {
    const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car/geojson`, {
      method: 'POST',
      headers: {
        'Authorization': '5b3ce3597851110001cf6248547f645043ca4f8f969070e416785369', 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [[source.lng, source.lat], [destination.lng, destination.lat]],
      }),
    });

    if (!response.ok) {
      throw new Error(`Routing API error: ${response.status}`);
    }

    const data = await response.json();

    const coordinates = data.features[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lng, lat]
    ) as [number, number][];

    const distance = data.features[0].properties.summary.distance / 1000; // in km
    const duration = data.features[0].properties.summary.duration / 60;   // in minutes

    return {
      coordinates,
      distance,
      duration
    };
  } catch (error) {
    console.error('Routing error:', error);
    // fallback to straight-line logic
    const distance = calculateDistance(source, destination);
    return {
      coordinates: [[source.lng, source.lat], [destination.lng, destination.lat]],
      distance,
      duration: Math.round((distance / 40) * 60),
    };
  }
};

export const calculateFare = (distance: number): number => {
  // Basic fare calculation
  const baseFare = 50; // Base fare in rupees
  const perKmRate = 20; // Rate per kilometer
  const minFare = 80; // Minimum fare
  
  const calculatedFare = baseFare + (distance * perKmRate);
  return Math.max(calculatedFare, minFare);
};