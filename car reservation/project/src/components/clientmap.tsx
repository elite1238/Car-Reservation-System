import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// @ts-ignore
import 'leaflet-routing-machine';
// @ts-ignore
import 'leaflet-control-geocoder';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// TypeScript declaration for leaflet-routing-machine
declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
  }
}

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

type LatLngTuple = [number, number];

const RoutingMachine: React.FC<{
  source: LatLngTuple;
  destination: LatLngTuple;
}> = ({ source, destination }) => {
  const map = useMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (controlRef.current) {
      map.removeControl(controlRef.current);
    }
    const instance = L.Routing.control({
      waypoints: [
        L.latLng(source[0], source[1]),
        L.latLng(destination[0], destination[1]),
      ],
      fitSelectedRoutes: true,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      lineOptions: { styles: [{ color: 'blue', weight: 4 }] },
    });
    controlRef.current = instance;
    instance.addTo(map);
  }, [source, destination, map]);

  return null;
};

const GeocoderControl: React.FC<{
  placeholder: string;
  onSelect: (latlng: LatLngTuple) => void;
}> = ({ placeholder, onSelect }) => {
  const map = useMap();

  useEffect(() => {
    const geocoder = (L.Control as any).Geocoder.nominatim();
    const control = (L.Control as any).geocoder({
      geocoder,
      placeholder,
      collapsed: false,
    })
      .on('markgeocode', (e: any) => {
        const center = e.geocode.center;
        onSelect([center.lat, center.lng]);
        map.setView(center, 13);
      })
      .addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, onSelect, placeholder]);

  return null;
};

const MapView: React.FC = () => {
  const [source, setSource] = useState<LatLngTuple | null>(null);
  const [destination, setDestination] = useState<LatLngTuple | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setSource([pos.coords.latitude, pos.coords.longitude]),
      err => alert('Failed to get location: ' + err.message),
      { enableHighAccuracy: true }
    );
  }, []);

  return source ? (
    <MapContainer
      center={source as LatLngExpression}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        attribution="&copy; Stadia Maps"
      />

      <GeocoderControl
        placeholder="Search source or use your live location"
        onSelect={setSource}
      />
      <GeocoderControl
        placeholder="Search destination"
        onSelect={setDestination}
      />

      {source && (
        <Marker position={source as LatLngExpression}>
          <Popup>Source Location</Popup>
        </Marker>
      )}
      {destination && (
        <Marker position={destination as LatLngExpression}>
          <Popup>Destination</Popup>
        </Marker>
      )}
      {source && destination && (
        <RoutingMachine source={source} destination={destination} />
      )}
    </MapContainer>
  ) : (
    <div>Fetching your location…</div>
  );
};

export default MapView;



















// const RoutingMachine: React.FC<{
//   source: LatLngTuple;
//   destination: LatLngTuple;
// }> = ({ source, destination }) => {
//   const map = useMap();
//   const controlRef = useRef<any>(null);

//   useEffect(() => {
//     if (controlRef.current) {
//       map.removeControl(controlRef.current);
//     }
//     const instance = L.Routing.control({
//       waypoints: [
//         L.latLng(source[0], source[1]),
//         L.latLng(destination[0], destination[1]),
//       ],
//       fitSelectedRoutes: true,
//       show: false,
//       addWaypoints: false,
//       draggableWaypoints: false,
//       lineOptions: { styles: [{ color: 'blue', weight: 4 }] },
//     });
//     controlRef.current = instance;
//     instance.addTo(map);
//   }, [source, destination, map]);

//   return null;
// };

// const GeocoderControl: React.FC<{
//   setDestination: React.Dispatch<React.SetStateAction<LatLngTuple | null>>;
// }> = ({ setDestination }) => {
//   const map = useMap();
//   useEffect(() => {
//     const geocoder = (L.Control as any).Geocoder.nominatim();
//     const control = (L.Control as any).geocoder({
//       geocoder,
//       placeholder: 'Search destination...',
//       collapsed: false,
//     })
//       .on('markgeocode', (e: any) => {
//         const center = e.geocode.center;
//         setDestination([center.lat, center.lng]);
//         map.setView(center, 13);
//       })
//       .addTo(map);
//   }, [map, setDestination]);

//   return null;
// };

// const MapView: React.FC = () => {
//   const [source, setSource] = useState<LatLngTuple | null>(null);
//   const [destination, setDestination] = useState<LatLngTuple | null>(null);

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       pos => setSource([pos.coords.latitude, pos.coords.longitude]),
//       err => alert('Failed to get location: ' + err.message),
//       { enableHighAccuracy: true }
//     );
//   }, []);

//   return source ? (
//     <MapContainer
//       center={source as LatLngExpression}
//       zoom={13}
//       style={{ height: '100vh', width: '100%' }}
//     >
//       <TileLayer
//         url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
//         attribution="&copy; Stadia Maps"
//       />
//       <GeocoderControl setDestination={setDestination} />
//       <Marker position={source as LatLngExpression}>
//         <Popup>Your live location</Popup>
//       </Marker>
//       {destination && (
//         <Marker position={destination as LatLngExpression}>
//           <Popup>Destination</Popup>
//         </Marker>
//       )}
//       {source && destination && (
//         <RoutingMachine source={source} destination={destination} />
//       )}
//     </MapContainer>
//   ) : (
//     <div>Fetching your location…</div>
//   );
// };

// export default MapView;
