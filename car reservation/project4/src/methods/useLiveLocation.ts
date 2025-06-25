import { useEffect, useState } from 'react';
import io from 'socket.io-client';

interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
}

const socket = io('http://localhost:5000');

export const useDriverLiveLocation = (driverId: string) => {
  const [location, setLocation] = useState<DriverLocation | null>(null);

  useEffect(() => {
    const handleLocationUpdate = (data: DriverLocation) => {
      if (data.driverId === driverId) {
        setLocation(data);
      }
    };

    socket.on('driverLocation', handleLocationUpdate);

    return () => {
      socket.off('driverLocation', handleLocationUpdate);
    };
  }, [driverId]);

  return location;
};
