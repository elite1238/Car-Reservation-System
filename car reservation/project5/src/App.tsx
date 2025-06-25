import  { useState } from 'react';
import { BookingSystem } from './components/BookingSystem';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { MapBooked } from './components/MapBooked';

import { Location, RouteData} from './types/booking';

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
function App() {
  const [source, setSourcestate] = useState<Location | null>(null);
  const [destination, setDestinationstate] = useState<Location | null>(null);
  const [route, setRoutestate] = useState<RouteData | null>(null);
  const [mapCenter, setMapCenterstate] = useState<[number, number] | null>(null);
  const [hasBookedData,sethasBookedData] = useState<BookedData | null>(null);
  const [ID,setid] = useState("");
  const callbackfunc = (
    source: Location | null,
    destination: Location | null,
    route: RouteData | null,
    hasBookedData: BookedData | null,
    ID :string
  ) => {
    setSourcestate(source);
    setDestinationstate(destination);
    setRoutestate(route);
    setMapCenterstate(source ? [source.lat, source.lng] : [13.0843, 80.2705]);
    sethasBookedData(hasBookedData);
    setid(ID);
};

  return(<div>
  <BrowserRouter>
      <div >
        <Routes>
          {/* mapfunction={callbackfunc} */}
          <Route path="/" element={<BookingSystem mapfunction={callbackfunc} />} />
          <Route path="/bookedRide" element={<MapBooked source={source} destination={destination} route={route} mapCenter={mapCenter ?? [13.0843, 80.2705]} hasBookedData={hasBookedData} driverID={ID}></MapBooked>} />
        </Routes>
      </div>
    </BrowserRouter>
    </div>
    );
}

export default App;