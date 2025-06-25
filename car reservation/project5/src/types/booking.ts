export interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export interface BookingData {
  source: Location | null;
  destination: Location | null;
  distance: number;
  duration: string;
  estimatedFare: number;
}

export interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

export interface BookingRequest {
  client_id:String,
  sourceLocation: Location;
  destinationLocation: Location;
  distance: number;
  estimatedFare: number;
  requestTime: string;
}

export interface ApiResponse {
  success: boolean;
  id:string;
  data?: any;
  message?: string;
  bookingId?: string;
}