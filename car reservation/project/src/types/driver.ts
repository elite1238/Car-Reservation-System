export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface License {
  licenseLink: string;
  fileType: string;
}

export interface VehicleInfo {
  Vtype: string;
  Vno: string;
  Vinsurance: string;
  rc: string;
}

export interface Trip {
  id: string;
  date: string;
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  fare: number;
  rating: number;
  status: 'completed' | 'cancelled' |'confirmed' | 'ongoing';
}

export interface Driver {
  id: string;
  email: string;
  username: string;
  phoneno: string;
  firstName: string;
  lastName: string;
  address: Address;
  profilePhoto: string;
  ratings: number;
  license: License;
  vehicleInfo: VehicleInfo;
  isBlocked: boolean;
  isAvailable: boolean;
  createdAt: string;
  totalRides: number;
}

export interface EarningsData {
  today: number;
  week: number;
  month: number;
  total: number;
  dailyEarnings: Array<{ date: string; amount: number }>;
}
export interface AvailableRide {
  id: string;
  client_id: string;
  bookedAt: string;
  // vtype: string;
  sourceLocation: Location;
  destinationLocation: Location;
  status: string;
  distance: number;
  fare: number;
  requestTime: string;
  distanceToClient: number;
  estimatedPickupTime: number;
  clientName?: string;
  // clientRating?: number;
}
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}
export interface RouteData {
  coordinates: [number, number][];
  distance: number;   // in kilometers
  duration: number;   // in minutes
  source?: Location;
  destination?: Location;
}