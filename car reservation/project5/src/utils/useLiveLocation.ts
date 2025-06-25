import { useEffect, useState } from 'react';

interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
}

import socket from '../components/socket';
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
