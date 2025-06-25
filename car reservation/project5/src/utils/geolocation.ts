import { Location } from '../types/booking';

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const address = await reverseGeocode(latitude, longitude);
          resolve({
            lat: latitude,
            lng: longitude,
            address: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
        } catch (error) {
          resolve({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
        }
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300 
      }
    );
  });
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

export const searchLocations = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=IN`
    );
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: item.display_name,
      placeId: item.place_id?.toString()
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};