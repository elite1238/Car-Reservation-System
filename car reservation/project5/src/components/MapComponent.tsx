import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, RouteData } from '../types/booking';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/744/744465.png', 
  iconSize: [40, 40],           
  iconAnchor: [20, 20],         
  popupAnchor: [0, -20],        
  shadowUrl: '',                
});

interface DriverLocationToMarker{
  lat: number;
  lng: number;
}
interface MapComponentProps {
  source: Location | null;
  destination: Location | null;
  route: RouteData | null;
  center: [number, number];
  zoom: number;
  DriverL?: DriverLocationToMarker | null;
  clickMode?: 'source' | 'destination' | null;
  onMapClick?: (location: Location) => void;
}

interface MapUpdaterProps {
  source: Location | null;
  destination: Location | null;
  route: RouteData | null;
}

const MapUpdater: React.FC<MapUpdaterProps
& {
  clickMode?: 'source' | 'destination' | null;
  onMapClick?: (location: Location) => void;
}
  > = ({ source, destination, route,clickMode,onMapClick }) => {
  const map = useMap();
  const routeLayerRef = useRef<L.Polyline | null>(null);
  useEffect(() => {
    if (!clickMode) return;

    const handleClick = async (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        if (data.display_name) address = data.display_name;
      } catch (error) {
        console.error("Reverse geocoding failed", error);
      }

      onMapClick?.({ lat, lng, address });
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [clickMode, onMapClick, map]);
  useEffect(() => {
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (route && route.coordinates.length > 0) {
      const latLngs: L.LatLngTuple[] = route.coordinates.map(coord => [coord[1], coord[0]]);
      
      routeLayerRef.current = L.polyline(latLngs, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1
      });
      
      routeLayerRef.current.addTo(map);
      
      const group = new L.FeatureGroup([routeLayerRef.current]);
      map.fitBounds(group.getBounds().pad(0.1));
    } else if (source && destination) {
      const group = new L.FeatureGroup();
      const sourceMarker = L.marker([source.lat, source.lng]);
      const destMarker = L.marker([destination.lat, destination.lng]);
      group.addLayer(sourceMarker);
      group.addLayer(destMarker);
      map.fitBounds(group.getBounds().pad(0.1));
    } else if (source) {
      map.setView([source.lat, source.lng], 15);
    }

    return () => {
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
      }
    };
  }, [map, source, destination, route]);

  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  source,
  destination,
  route,
  center,
  zoom,
  clickMode,
  onMapClick,
  DriverL
}) => {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater source={source} destination={destination} route={route} clickMode={clickMode}  onMapClick={onMapClick}/>
        
        {source && (
          <Marker position={[source.lat, source.lng]} icon={sourceIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Pickup Location</strong>
                <br />
                {source.address}
              </div>
            </Popup>
          </Marker>
        )}
        {DriverL && (
          <Marker position={[DriverL.lat, DriverL.lng]} icon={driverIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Driver Location</strong>
                <br />
              </div>
            </Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Drop Location</strong>
                <br />
                {destination.address}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};