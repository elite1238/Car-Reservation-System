import React, { useEffect, useState } from 'react';
import { Car, MapPin, Clock, IndianRupee, CheckCircle, Loader2 } from 'lucide-react';
import { MapComponent } from './MapComponent';
import { LocationInput } from './LocationInput';
import { Location, BookingData, RouteData, BookingRequest } from '../types/booking';
import { getRoute, calculateFare } from '../utils/routing';
import { createBookingRequest } from '../utils/api';
import api from '../api/axios';
import socket from './socket';
import { useNavigate } from 'react-router-dom';
import { reverseGeocode } from '../utils/geolocation';

interface BookedData{
    sourceLocation:Location;
    destinationLocation:Location;
    _id:string;
    client_id:string;
    clientName:string;
    BookedAt:Date;
    status:string;
    distance:Number;
    fare:Number;
    requestTime:Date
};
interface BookingSystemProps {
  mapfunction: (source: Location | null, destination: Location | null, route: RouteData | null,hasBookedData:BookedData | null,ID:string) => void;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({ mapfunction }) => {
  const [sourceInput, setSourceInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [source, setSource] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [routeForMap,setrouteForMap] = useState<RouteData | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [ID,setID] = useState("");
  const [ClientID,setClientID] = useState("");
  const [HasBooked,setHasBooked] = useState(false);
  const [hasBookedData,sethasBookedData] = useState<BookedData | null>(null);
  const navigate = useNavigate();
  const [refreesh,setrefresh] = useState(false);
  const [clickMode,setClickMode] = useState<'source' | 'destination' | null>(null);

  useEffect(() => {
    if(ID===""){
      console.error("ID is empty");
      return;
    }
    else{
      socket.emit('listenToBooking', { bookingId:ID });
      socket.on(
        'rideConfirmed',
        ({ bookingId: bookingId, rideId }: { bookingId: string; rideId: string }) => {
          if (bookingId === ID) {
            mapfunction(hasBookedData?.sourceLocation ?? null, hasBookedData?.destinationLocation ?? null, routeForMap, hasBookedData ?? null, rideId);
            navigate('/bookedRide');
          }
        }
      );

      return () => {
        socket.off('rideConfirmed');
      };
    }
  }, [ID,refreesh]);
  useEffect(() => {
    const fetchAuthClient = async () => {
      try {
        const authClient = await api.get('/client/clientAuth');
        setClientID(authClient.data.id);
        const result = await api.post('/client/hadbooked',{id:authClient.data.id});
        if(result.data.canBook){
          setHasBooked(false);
        }
        else if(result.data.message==='Already Booked'){
          sethasBookedData(result.data.bookingInfo );
          setID(result.data.bookingInfo._id); 
          setHasBooked(true);
        }
      } catch (err) {
        console.error("Error in checking if Client has already booked");
      }
    };
    fetchAuthClient();
  }, [refreesh]);
  
  const handleSourceSelect = async (location: Location) => {
    setSource(location);
    setSourceInput(await reverseGeocode(location.lat, location.lng) || 'Error fetching address'); 
    if (destination) {
      calculateRoute(location, destination);
    }
  };

  const handleDestinationSelect = async (location: Location) => {
    setDestination(location);
    setDestinationInput(await reverseGeocode(location.lat, location.lng) || 'Error fetching address'); 
    if (source) {
      calculateRoute(source, location);
    }
  };

  const calculateRoute = async (src: Location, dest: Location) => {
    setIsLoadingRoute(true);
    try {
      const routeData = await getRoute(src, dest);
      setRoute(routeData);
      setrouteForMap(routeData);
      const fare = calculateFare(routeData.distance);
      setBookingData({
        source: src,
        destination: dest,
        distance: routeData.distance,
        duration: `${routeData.duration.toFixed(2)} min`,
        estimatedFare: Number(fare.toFixed(0))
      });
    } catch (error) {
      console.error('Route calculation error:', error);
    }
    setIsLoadingRoute(false);
  };
  

  const handleBookNow = async () => {
    if (!bookingData || !source || !destination || bookingComplete) return;
    setIsBooking(true);
    try {
        const bookingRequest: BookingRequest = {
          client_id:ClientID,
          sourceLocation: source,
          destinationLocation: destination,
          distance: bookingData.distance,
          estimatedFare: bookingData.estimatedFare,
          requestTime: new Date().toISOString()
      };

      const result = await createBookingRequest(bookingRequest);
      setID(result.id);
      if (result.success && result.id!=='Failure') {
        setBookingComplete(true);
      } else {
        alert(result.message || 'Booking failed. Please try again.');
      }
      setrefresh(prev=> !prev);
      setTimeout(()=>{
             setrefresh(prev=>!prev);
        },1000);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    }
    setIsBooking(false);
  };
  //Not used but can be used to reset the booking form
  const resetBooking = () => {
    setSourceInput('');
    setDestinationInput('');
    setSource(null);
    setDestination(null);
    setRoute(null);
    setBookingData(null);
    setBookingComplete(false);
  };
  const cancelBooking = async() =>{
    try{
      const result = await api.post('/client/cancelbooking',{id:ID});
      alert("Booking Canceled");
    }
    catch(err){
      console.error("Error cancelling booking "+ID);
      alert("Error cancelling Booking");
    }
    window.location.reload();
  };
  const mapCenter: [number, number] = source 
    ? [source.lat, source.lng] 
    : [13.0843, 80.2705]; 
  if(HasBooked && hasBookedData){
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {/* <ClientBookingListener bookingId={ID}></ClientBookingListener> */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booked Waiting For Drivers</h2>
            <p className="text-gray-600">Booking ID: {hasBookedData._id}</p>
          </div>
          
          {hasBookedData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
              <p className="text-sm text-gray-600">Name: {hasBookedData.clientName}</p>
              <p className="text-sm text-gray-600">Source Location: {hasBookedData.sourceLocation.address}</p>
              <p className="text-sm text-gray-600">Destination Location: {hasBookedData.destinationLocation.address}</p>
              <p className="text-sm text-gray-600">Status: {hasBookedData.status}</p>
              <p className="text-sm text-gray-600">Distance: {hasBookedData.distance.toFixed(2)} km</p>
              <p className="text-sm text-gray-600">Fare: ₹{hasBookedData.fare.toString()}</p>
              {/* <p className="text-sm text-gray-600">BookedAt: {hasBookedData.BookedAt.getDate().toString()}</p> */}
            </div>
          )}
          <div className="space-y-4">
            <a href="http://localhost:5174/">
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go To HomePage
              </button>
            </a>
            <button
              onClick={cancelBooking}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Cancel Booking
            </button>
            <button
              onClick={()=>{setrefresh(!refreesh)}}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Booking Form */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <Car className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Book Your Ride</h1>
              </div>

              <div className="space-y-4">
                <LocationInput
                  label="Pickup Location"
                  placeholder="Enter pickup location"
                  value={sourceInput}
                  onChange={setSourceInput}
                  onLocationSelect={handleSourceSelect}
                  showCurrentLocation={true}
                  icon={<MapPin className="h-5 w-5 text-green-500" />}
                />

                <LocationInput
                  label="Drop Location"
                  placeholder="Enter destination"
                  value={destinationInput}
                  onChange={setDestinationInput}
                  onLocationSelect={handleDestinationSelect}
                  icon={<MapPin className="h-5 w-5 text-red-500" />}
                />
              </div>

              {isLoadingRoute && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                  <span className="text-blue-600">Calculating route...</span>
                </div>
              )}

              {bookingData && !isLoadingRoute && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-medium">{bookingData.distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {bookingData.duration }
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Estimated Fare:</span>
                      <span className="font-bold text-lg flex items-center text-green-600">
                        <IndianRupee className="h-5 w-5" />
                        {bookingData.estimatedFare}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                disabled={!bookingData || isBooking}
                className={`w-full mt-6 py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                  bookingData && !isBooking
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isBooking ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  'Book Now'
                )}
              </button>
              <button
                className={`w-full mt-6 py-4 rounded-lg font-semibold text-blue transition-all duration-200 `}
              >
                {/* Set this href link to your hompage link */}
                <a href='http://localhost:5174/'>Go To HomePage</a>
              </button>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:w-2/3">
            <div className="h-96 lg:h-full min-h-[500px]">
              <button onClick={() => setClickMode('source')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-md transition-all duration-200">Set Pickup by Map</button>
              <button onClick={() => setClickMode('destination')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-2xl shadow-md transition-all duration-200">Set Drop by Map</button>

              <MapComponent
                source={source}
                destination={destination}
                route={route}
                center={mapCenter}
                zoom={13}
                clickMode={clickMode}
                onMapClick={(location: Location) => {
                  if (clickMode === 'source') handleSourceSelect(location);
                  if (clickMode === 'destination') handleDestinationSelect(location);
                  setClickMode(null); 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};