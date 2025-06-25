import { Location, RouteData } from '../types/driver';

export const getRouteWithVia = async (
  driver: Location,
  pickup: Location,
  destination: Location
): Promise<RouteData> => {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
      {
        method: 'POST',
        headers: {
          'Authorization': '5b3ce3597851110001cf6248547f645043ca4f8f969070e416785369',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [driver.lng, driver.lat],
            [pickup.lng, pickup.lat],
            [destination.lng, destination.lat],
          ],
        }),
      }
    );
    if (!response.ok) throw new Error(`Routing API error: ${response.status}`);
    const data = await response.json();
    const coordinates = data.features[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    ) as [number, number][];
    const distance = data.features[0].properties.summary.distance / 1000;
    const duration = data.features[0].properties.summary.duration / 60;

    return { coordinates, distance, duration };
  } catch (error) {
    console.error('Routing error:', error);
    const straightLine = [
      [driver.lat, driver.lng],
      [pickup.lat, pickup.lng],
      [destination.lat, destination.lng],
    ] as [number, number][];
    return {
      coordinates: straightLine,
      distance: 0,
      duration: 0,
    };
  }
};