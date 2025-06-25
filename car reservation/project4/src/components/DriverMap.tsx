import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Route,
  AlertCircle,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useDriverLiveLocation } from '../methods/useLiveLocation';
import { getRouteWithVia } from '../methods/routes'; 
import api from '../api/axios';
// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom driver location icon (blue dot)
const driverIcon = L.divIcon({
  className: 'driver-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        width: 40px;
        height: 40px;
        background-color: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        position: absolute;
        top: -13px;
        left: -13px;
        animation: pulse 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(0.8); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Custom pickup location icon (green)
const pickupIcon = L.divIcon({
  className: 'pickup-marker',
  html: `
    <div style="
      width: 12px;
      height: 12px;
      background-color: #10B981;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Custom destination icon (red)
const destinationIcon = L.divIcon({
  className: 'destination-marker',
  html: `
    <div style="
      width: 12px;
      height: 12px;
      background-color: #EF4444;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface DriverLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

interface RouteLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface RouteData {
  coordinates: [number, number][]; 
  distance: number;                // in kilometers
  duration: number;                // in minutes
  pickup: RouteLocation;           
  destination: RouteLocation;     
}
interface DriverMapProps {
  driverId: string; 
  RideId?: string;
  onLocationUpdate?: (location: DriverLocation) => void;
  onRouteRequest?: (driverLocation: DriverLocation, pickup: RouteLocation, destination: RouteLocation) => void;
  pickup?: RouteLocation | null;
  destination?: RouteLocation | null;
}

// Component to handle map updates
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

// Component to handle route display
const RouteDisplay: React.FC<{ routeCoordinates: [number, number][] }> = ({ routeCoordinates }) => {
  const map = useMap();
  const routeRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      // Remove existing route
      if (routeRef.current) {
        map.removeLayer(routeRef.current);
      }

      // Add new route
      routeRef.current = L.polyline(routeCoordinates, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(map);

      // Fit map to route bounds
      if (routeCoordinates.length > 1) {
        const bounds = L.latLngBounds(routeCoordinates);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }

    return () => {
      if (routeRef.current) {
        map.removeLayer(routeRef.current);
      }
    };
  }, [map, routeCoordinates]);

  return null;
};

const DriverMap: React.FC<DriverMapProps> = ({ driverId,pickup, destination, onLocationUpdate,RideId,  onRouteRequest}) => {
  const socketLocation = useDriverLiveLocation(driverId);
  const defaultLocation: DriverLocation = {
    lat: 13.0843,
    lng: 80.2705,
    accuracy: 0,
    timestamp: Date.now()
  };
  const driverLocation: DriverLocation = socketLocation?.lat && socketLocation?.lng
    ? {
        lat: socketLocation.lat,
        lng: socketLocation.lng,
      }
    : defaultLocation;
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [locationError] = useState<string | null>(null);
  const isTracking = !!(socketLocation && socketLocation.lat && socketLocation.lng);
  const [otp,setOtp] = useState<string>('');
  const [otpverified,setOtpVerified] = useState<boolean>(false);

  useEffect(() => {
    if (onLocationUpdate && driverLocation) {
      onLocationUpdate(driverLocation);
    }
  }, [driverLocation, onLocationUpdate]);
  useEffect(() => {
    async function fetchRoute() {
      if (pickup && destination && driverLocation &&
      !(
        driverLocation.lat === defaultLocation.lat && 
        driverLocation.lng === defaultLocation.lng
      )) {
        setIsLoadingRoute(true);
        const route = await getRouteWithVia(
          { lat: driverLocation.lat, lng: driverLocation.lng },
          { lat: pickup.lat, lng: pickup.lng },
          { lat: destination.lat, lng: destination.lng }
        );
        setRouteData({
          coordinates: route.coordinates,
          distance: route.distance,
          duration: route.duration,
          pickup,
          destination
        });
        setIsLoadingRoute(false);
      } else {
        setRouteData(null);
      }
  }
  fetchRoute();
}, [pickup, destination, driverLocation.lat, driverLocation.lng]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      const result = await api.post('/driver/verifyotp',{id:RideId,otp:otp});
      if(result.data.message ==='sucess'){
        alert("OTP VERIFIED SUCCESSFULLY");
        setOtpVerified(true);
      }
      else{
        alert("WRONG OTP");
        setOtpVerified(false);
      }
    }
    catch(err){
      console.error('Error verifying OTP:', err);
      alert('Failed to verify OTP');
    }
  }
  const clearRoute = useCallback(() => {
    setRouteData(null);
    setRouteCoordinates([]);
  }, []);
  const currentLocation = driverLocation || defaultLocation;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Map</h1>
            <p className="text-gray-600">Track your location and view routes to passengers</p>
          </div>
          <div className="flex space-x-3">
            {routeData && (
              <button
                onClick={clearRoute}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Clear Route
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Location Status</p>
              <p className={`text-lg font-bold ${isTracking ? 'text-green-600' : 'text-gray-600'}`}>
                {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${isTracking ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Navigation className={`h-6 w-6 ${isTracking ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </div>
          {driverLocation?.accuracy && (
            <p className="text-sm text-gray-500 mt-2">
              Accuracy: ±{Math.round(driverLocation.accuracy)}m
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Current Location</p>
              <p className="text-sm font-medium text-gray-900">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Route Status</p>
              <p className={`text-lg font-bold ${routeData ? 'text-blue-600' : 'text-gray-600'}`}>
                {routeData ? 'Route Active' : 'No Route'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${routeData ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Route className={`h-6 w-6 ${routeData ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {locationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{locationError}</span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="h-96 md:h-[600px]">
          <MapContainer
            center={[currentLocation.lat, currentLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapUpdater 
              center={[currentLocation.lat, currentLocation.lng]} 
              zoom={13} 
            />
            
            {/* Driver Location Marker */}
            <Marker 
              position={[currentLocation.lat, currentLocation.lng]} 
              icon={driverIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Your Location</strong>
                  <br />
                  {isTracking ? 'Live tracking active' : 'Manual location'}
                  <br />
                  <small>
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </small>
                </div>
              </Popup>
            </Marker>

            {/* Route Markers */}
            {routeData && (
              <>
                <Marker 
                  position={[routeData.pickup.lat, routeData.pickup.lng]} 
                  icon={pickupIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Pickup Location</strong>
                      <br />
                      {routeData.pickup.address || 'Pickup Point'}
                    </div>
                  </Popup>
                </Marker>
                
                <Marker 
                  position={[routeData.destination.lat, routeData.destination.lng]} 
                  icon={destinationIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Destination</strong>
                      <br />
                      {routeData.destination.address || 'Destination Point'}
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Route Display */}
            <RouteDisplay routeCoordinates={routeData?.coordinates ?? []} />
          </MapContainer>
        </div>
      </div>

      {/* Route Information */}
      {routeData && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Route</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Pickup Location</h4>
              <p className="text-gray-600">{routeData.pickup.address || 'Pickup Point'}</p>
              <p className="text-sm text-gray-500">
                {routeData.pickup.lat.toFixed(6)}, {routeData.pickup.lng.toFixed(6)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Destination</h4>
              <p className="text-gray-600">{routeData.destination.address || 'Destination Point'}</p>
              <p className="text-sm text-gray-500">
                {routeData.destination.lat.toFixed(6)}, {routeData.destination.lng.toFixed(6)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Distance</h4>
              <p className="text-gray-600">{(routeData.distance|| 'Error Distance')+" Km"}</p>
              <p className="text-sm text-gray-500">
                {routeData.destination.lat.toFixed(6)}, {routeData.destination.lng.toFixed(6)}
              </p>
              <h4 className="font-medium text-gray-700 mb-2">Ride ID</h4>
              <p className="text-gray-600">{RideId }</p>
              {(otpverified===false) &&
              <form className='mt-4' onSubmit={handleVerifyOTP}>
                <input
                  type='text'
                  className='border border-gray-300 rounded-lg p-2 w-full'
                  placeholder='Enter OTP'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  type='submit' // Keep as 'submit'
                  className='mt-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors duration-200'
                >
                  Verify OTP
                </button>
              </form>
              }
              {otpverified && (
                <p className="text-green-600 mt-2">OTP Verified Successfully!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverMap;
export type { DriverLocation, RouteLocation, RouteData, DriverMapProps };