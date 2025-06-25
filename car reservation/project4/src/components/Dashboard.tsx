import React, { useEffect, useRef, useState } from 'react';
import { Power, Star, MapPin, Clock,Users} from 'lucide-react';
import { Driver, Trip } from '../types/driver';
import api from '../api/axios';
import { useDriverLiveLocation } from '../methods/useLiveLocation';
import socket from '../socketfold/socket';

interface DashboardProps {
  driver: Driver;
  id:String;
  onAvailabilityToggle: () => void;
}
  const Dashboard: React.FC<DashboardProps> = ({ driver,id, onAvailabilityToggle }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [ID,SETID] = useState("");
  const location = useDriverLiveLocation(ID); 
  const handleToggle = async () => {
    setIsToggling(true);
    try{
      const response = await api.post('/driver/toggleAvailable',{id:ID});
      if (!driver.isAvailable) {
        startLiveLocation();
        setIsTracking(true);
    } else {
        stopLiveLocation();
        setIsTracking(false);
    }
    onAvailabilityToggle();
    }
    catch(err){
      console.error("Error in Toggling");
    }
    setIsToggling(false);
  };
  const [recentTrips,setRecentTrips] = useState<Trip[] | null>(null);
  useEffect(() => {
    startLiveLocation();
    const apicalling = async () => {
      try {
        const authDriver = await api.get('/driver/auth');
        await SETID(authDriver.data.id);
        const pastridedata = await api.post("/driver/pastrides",{id:authDriver.data.id});
        setRecentTrips(pastridedata.data);
      } catch (error) {
        console.error('Error fetching driver:', error);
      }
    };
    apicalling();
  }, [location]);
  
  const [isTracking, setIsTracking] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const startLiveLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('driverLocation', {
          driverId: ID,
          lat: latitude,
          lng: longitude,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };
  const stopLiveLocation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };
  const avgRating = driver.ratings;
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {driver.firstName}!
        </h1>
        <p className="text-gray-600">Here's your driving activity overview</p>
      </div>

      {/* Availability Toggle */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${driver.isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Power className={`h-6 w-6 ${driver.isAvailable ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Status: {driver.isAvailable ? 'Available' : 'Offline'}
              </h2>
              <p className="text-gray-600">
                {driver.isAvailable 
                  ? 'You are currently accepting ride requests' 
                  : 'You are offline and not receiving requests'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
              driver.isAvailable
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isToggling ? 'Updating...' : (driver.isAvailable ? 'Go Offline' : 'Go Online')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Rides</p>
              <p className="text-2xl font-bold text-gray-900">{driver.totalRides}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>  
          <div className="flex items-center mt-2">
            <span className="text-gray-500 text-sm">Lifetime trips completed</span>
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Trips</h2>
          <p className="text-gray-600 mt-1">Your latest completed rides</p>
        </div>
        <div className="overflow-hidden">
          {recentTrips?.map((trip, index) => (
            <div key={trip.id} className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${index !== recentTrips.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{trip.pickup}</span>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{trip.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{trip.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < trip.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    ₹{trip.fare.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

