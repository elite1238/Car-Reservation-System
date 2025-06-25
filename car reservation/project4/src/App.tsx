import React, { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TripHistory from './components/TripHistory';
import { Driver } from './types/driver';
import api from './api/axios';
import AvailableRides from './components/AvailableRides';
import DriverMap from './components/DriverMap';
import ProtectedDriverRoute from './components/ProtectedDriverRoute';

export interface RouteLocation {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
} 
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Mock driver data - in a real app, this would come from an API
  const [driver, setDriver] = useState<Driver>({
    id: '1',
    email: 'john.driver@example.com',
    username: 'johndriver',
    phoneno: '+1-555-0123',
    firstName: 'John',
    lastName: 'Smith',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States'
    },
    profilePhoto: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
    ratings: 4.8,
    license: {
      licenseLink: '/documents/license.pdf',
      fileType: 'pdf'
    },
    vehicleInfo: {
      Vtype: 'sedan',
      Vno: 'ABC-1234',
      Vinsurance: 'INS-789456',
      rc: 'RC-123789'
    },
    isBlocked: false,
    isAvailable: true,
    createdAt: '2023-01-15T00:00:00.000Z',
    totalRides: 1247
  });
  const [activeRoute, setActiveRoute] = useState<{pickup: RouteLocation, destination: RouteLocation} | null>(null);
  const [RideId, setRideId] = useState<string | null>(null);
  const [id,setID] = useState("");
  useEffect(() => {
    const apicalling = async () => {
      try {
        const authDriver = await api.get('/driver/auth');
        setID(authDriver.data.id);
        const driverData = await api.post('/driver/fetchDriverData',{id:authDriver.data.id});
        setDriver({
          id:id,
          email: driverData.data.email,
          username: driverData.data.username,
          phoneno: driverData.data.phoneno,
          firstName: driverData.data.firstName,
          lastName: driverData.data.lastName,
          address: driverData.data.address,
          profilePhoto: driverData.data.profilePhoto,
          ratings: driverData.data.ratings,
          license: driverData.data.license,
          vehicleInfo: driverData.data.vehicleInfo,
          isBlocked: driverData.data.isBlocked,
          isAvailable: driverData.data.isAvailable,
          createdAt: driverData.data.createdAt,
          totalRides: driverData.data.totalRides
        });
      } catch (error) {
        console.error('Error fetching driver:', error);
      } 
    };
    apicalling();
  }, []);

  const handleAvailabilityToggle = () => {
    setDriver(prev => ({ ...prev, isAvailable: !prev.isAvailable }));
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
    setDriver(updatedDriver);
  };
  const handleShowRouteOnMap = (pickup: RouteLocation, destination: RouteLocation, RideId: string) => {
    setActiveRoute({ pickup, destination });
    setRideId(RideId);
    setActiveTab('DriverMap');
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProtectedDriverRoute><Dashboard driver={driver} id={id} onAvailabilityToggle={handleAvailabilityToggle} /></ProtectedDriverRoute>;
      case 'profile':
        return <ProtectedDriverRoute><Profile driver={driver} onUpdateDriver={handleUpdateDriver} /></ProtectedDriverRoute>;
      case 'trips':
        return <ProtectedDriverRoute><TripHistory /></ProtectedDriverRoute>;
      case 'DriverMap':
        return <ProtectedDriverRoute>
          <DriverMap 
            driverId={driver.id}
            pickup={activeRoute?.pickup}
            destination={activeRoute?.destination} 
            RideId={RideId ?? undefined}
          />
        </ProtectedDriverRoute>;
      case 'RidesAvailable':
        return <ProtectedDriverRoute><AvailableRides onShowRoute={handleShowRouteOnMap}/></ProtectedDriverRoute>;
      default:
        return <ProtectedDriverRoute><Dashboard driver={driver} id={id} onAvailabilityToggle={handleAvailabilityToggle} /></ProtectedDriverRoute>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;