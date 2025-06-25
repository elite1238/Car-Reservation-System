import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Navigation,User,Car,CheckCircle,XCircle,RefreshCw,AlertCircle} from 'lucide-react';
import { AvailableRide } from '../types/driver';
import api from '../api/axios';
import socket from '../socketfold/socket';
import { haversine } from '../methods/haversine';
import { useDriverLiveLocation } from '../methods/useLiveLocation';

const AvailableRides: React.FC<{ onShowRoute?: (pickup: any, destination: any, RideId: string) => void }> = ({ onShowRoute }) => {
  const [rides, setRides] = useState<AvailableRide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptingRide, setAcceptingRide] = useState<string | null>(null);
  function getMockDistanceAndTime(   
    source: { lat: number; lng: number },
      driver: { lat: number; lng: number } = { lat: 12.9, lng: 80.1 }
  ): { distanceToClient: number; estimatedPickupTime: number } {
    return {
      distanceToClient: 1.2, // static dummy
      estimatedPickupTime: 5, // static dummy
    };
}
  const calculateETA = (distance: number) => {
    return Math.round((distance / 25) * 60);
  };
  const [mockRides, setMockRides] = useState<AvailableRide[]>([]);
  const [ID,setID] = useState("");
  const [refresh,setrefresh] = useState(true);
  const socketLocation = useDriverLiveLocation(ID);
  useEffect(() => {
    setIsLoading(true);
    const fetchRides = async () => {
      try {
        const res = await api.get('/driver/ShowAvailableRides'); 
        const data = res.data;
        const transformed: AvailableRide[] = data.map((ride: any) => {
          const { distanceToClient, estimatedPickupTime } = getMockDistanceAndTime(ride.sourceLocation);
          return {
            id: ride.id,
            client_id: ride.client_id,
            bookedAt: ride.bookedAt,
            sourceLocation: ride.sourceLocation,
            destinationLocation: ride.destinationLocation,
            status: ride.status,
            distance: ride.distance,
            fare: ride.fare,
            requestTime: ride.requestTime,
            distanceToClient,
            estimatedPickupTime,
            clientName: ride.ClientName,
          };
        });
        setMockRides(transformed);
        if (socketLocation) {
          setRides(
            transformed.filter(
              ride =>
                haversine(
                  ride.sourceLocation.lat,
                  ride.sourceLocation.lng,
                  socketLocation.lat,
                  socketLocation.lng
                ) <= 5
            )
          );
        } else {
          setRides(transformed);
        }
      } catch (err) {
        console.error('Error fetching rides:', err);
      }
      finally{
        setIsLoading(false);
      }
    };
    const authdriver = async () => {
      try{
        const res = await api.get('/driver/auth');
        setID(res.data.id);
      }
      catch(err){
        console.error("Error Driver ID not Loaded");
      }
    };
    authdriver();
    fetchRides();
  }, [refresh,socketLocation]);
  const [D_ID,setD_ID] = useState("");
  const handleAcceptRide = async (rideId: string) => {
    setAcceptingRide(rideId);
    const acceptedRide = mockRides.find(ride => ride.id === rideId);
    
    setRides(prev => prev.filter(ride => ride.id !== rideId));
    try{
      const RideData = rides.find(ride => ride.id===rideId);
      if(RideData===undefined){
        console.error("No such Ride exists");
        alert("No such ride exists");
        return;
      }
      const response = await api.post('/client/addRideDetails',{
          clientID:RideData.client_id,
          driverID:ID,
          sourceaddress:RideData.sourceLocation.address,
          destaddress:RideData.destinationLocation.address,
          status:"confirmed",
          fare:RideData.fare,
          rating:0,
          isRated:false,
      });
      socket.emit('driverAcceptedRide', {
        bookingId: rideId,     
        rideId: response.data.id 
      });
      setD_ID(response.data.id);
      const res = await api.post('/client/cancelbooking',{id:rideId});
      setAcceptingRide(null);
      if (acceptedRide && onShowRoute) {
        onShowRoute(acceptedRide.sourceLocation, acceptedRide.destinationLocation, response.data.id);
      } else {
        alert('Ride accepted! Navigate to active ride screen.');
      }
    } 
    catch(err){
      console.error("Error Putting RideDetails into the database");
    }
    
  };
  const handleDeclineRide = (rideId: string) => {
    setRides(prev => prev.filter(ride => ride.id !== rideId));
  };

  const refreshRides = () => {
    setIsLoading(true);
    setrefresh(!refresh);
  };
  

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Rides</h1>
            <p className="text-gray-600">Accept ride requests from nearby passengers</p>
          </div>
          <button
            onClick={refreshRides}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Available Rides</p>
              <p className="text-2xl font-bold text-blue-600">{rides.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Potential Earnings</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{rides.reduce((sum, ride) => sum + ride.fare, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Distance</p>
              <p className="text-2xl font-bold text-purple-600">
                {rides.length > 0 ? (rides.reduce((sum, ride) => sum + ride.distance, 0) / rides.length).toFixed(1  ) : '0'} km
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Navigation className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Rides List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading available rides...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rides available</h3>
            <p className="text-gray-500 mb-4">Check back in a few minutes for new ride requests</p>
            <button
              onClick={refreshRides}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Refresh Now
            </button>
          </div>
        ) : (
          rides.map((ride) => (
            <div key={ride.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ride.clientName}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">₹{ride.fare}</div>
                    <div className="text-sm text-gray-500">{ride.requestTime}</div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          Pickup Location
                        </div>
                        <p className="font-medium text-gray-900">{ride.sourceLocation.address}</p>
                      </div>
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          Destination
                        </div>
                        <p className="font-medium text-gray-900">{ride.destinationLocation.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Navigation className="h-4 w-4 text-gray-500 mr-1" />
                    </div>
                    <p className="text-sm text-gray-500">Trip Distance</p>
                    <p className="font-semibold text-gray-900">{ride.distance.toFixed(2)} km</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAcceptRide(ride.id)}
                    disabled={acceptingRide === ride.id}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {acceptingRide === ride.id ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Accept Ride
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeclineRide(ride.id)}
                    disabled={acceptingRide === ride.id}
                    className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AvailableRides;