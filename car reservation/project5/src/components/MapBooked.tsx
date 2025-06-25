import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Location, RouteData } from '../types/booking';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import api from '../api/axios';
import { MapComponent } from './MapComponent';
import { useDriverLiveLocation } from '../utils/useLiveLocation';

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
interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
}
export const MapBooked: React.FC<{
  source: Location | null;
  destination: Location | null;
  route: RouteData | null;
  mapCenter: [number, number];
  hasBookedData: BookedData | null;
  driverID:string
}> = ({ source, destination, route, mapCenter,hasBookedData,driverID }) => {
    const [driver_ID,setdriver_ID] = useState("");
    const [drivername,setdrivername] = useState("");
    const [driverphoneno,setdriverphoneno] = useState("");
    const [vehicleno,setvehicleno] = useState("");
    const [refresh,setrefresh] = useState(true);
    const [ongoingRide,setongoingRide] = useState(false);
    const [completedRide,setcompletedRide] = useState(false);
    const [DriverLocationData,setDriverLocationData] = useState<DriverLocation | null>(null);
    const [otp,setotp] = useState("");
    const setStatus = async(newstatus:String)=>{
      try{
        const res = await api.post('/client/changeRideStatus',{id:driverID,newStatus:newstatus});
        if(newstatus==='ongoing')
          setongoingRide(true);
        else if(newstatus==='completed')
          setcompletedRide(true);
      }
      catch(err){
        console.error("Error Changing Ride Status");
      }
    };
    useEffect(()=>{
        const getDriverID = async ()=>{
            try{
                const result = await api.post('/client/getDriverIdfromRides',{id:driverID});
                if(result.data.message == "Found driver"){
                    setdriver_ID(result.data.driver_id);
                }
                else{
                    console.error("API call successfull but the rideID is Incorrect");
                }
            }
            catch(err){
                console.error("Error in getting driver id");
            }
        };
        getDriverID();
        const getDriverInfo = async ()=>{
            try{
                const driverdetails = await api.post('/driver/fetchDriverData',{id:driver_ID});
                setdrivername(driverdetails.data.username);
                setdriverphoneno(driverdetails.data.phoneno);
                setvehicleno(driverdetails.data.vehicleInfo.Vno);
                const res = await api.post('/client/getotp',{id:driverID});
                setotp(res.data.otp);
            }
            catch(err){
                console.error("Error getting driver details "+driver_ID);
            }
        };
        getDriverInfo();
    },[refresh,driver_ID]); 
    const driverLiveLocation = useDriverLiveLocation(driver_ID);
    useEffect(() => {
      if (driverLiveLocation) {
        setDriverLocationData(driverLiveLocation);
      }
    }, [driverLiveLocation,refresh]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Map Section */}
      <div className="lg:w-2/3 w-full rounded-lg shadow-lg overflow-hidden bg-white">
        <div className="h-72 lg:h-[80vh] w-full">
          <MapComponent
            source={source}
            destination={destination}
            route={route}
            center={mapCenter}
            zoom={13}
            DriverL={{
              lat: DriverLocationData ? DriverLocationData.lat : 13.0843,
              lng: DriverLocationData ? DriverLocationData.lng : 80.2705,
            }}
          />
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
              <h1>OTP</h1>
              <p className='font-semibold text-blue-600'>{otp}</p>
            </div>
      </div>

      <div className="lg:w-1/3 w-full flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2 text-blue-600">Ride Details</h2>
          <div className="mb-4">
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Source Location:</span>
              <span className="font-semibold">{source?.address}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Destination Location:</span>
              <span className="font-semibold">{destination?.address}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Fare:</span>
              <span className="font-semibold">{hasBookedData?.fare.toString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Distance:</span>
              <span className="font-semibold">{hasBookedData?.distance.toString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2 text-green-600">Driver Details</h2>
          <div className="mb-4">
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Driver name:</span>
              <span className="font-semibold">{drivername}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Driver phone no:</span>
              <span className="font-semibold">{driverphoneno}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Vehicle no:</span>
              <span className="font-semibold">{vehicleno}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <button onClick={()=>{setrefresh(!refresh)}}>Refresh</button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
            {(completedRide==false) && (
              <>
                <button className='bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700' onClick={() => setStatus("completed")}>Mark Ride as Completed</button>
                <div className='h-2'></div>
                <button className='bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700' onClick={() => {setStatus("cancelled");window.location.href = 'http://localhost:5174';}}>Cancel the Ride</button>
              </>
            ) }
            <div className='bg-white rounded-lg shadow p-6'>
              <p>{DriverLocationData ? `Driver is at: ${DriverLocationData.lat}, ${DriverLocationData.lng}` : 'Fetching driver location...'}</p>
            </div>
        </div>
        
      </div>
    </div>
  );
};