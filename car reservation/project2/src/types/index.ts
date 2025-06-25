export interface User {
  _id: string;
  email: string;
  client_id: string;
  username: string;
  phoneno: string;
  firstName: string;
  lastName: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  profilePhoto: string;
  isBlocked: boolean;
  createdAt: Date
  totalRides: number;
}

export interface Booking {
  id: string;
  date: string;
  time: string;
  source: string;
  destination: string;
  status: 'completed' | 'cancelled' | 'ongoing';
  driver: string;
  carType: string;
  amount: number;
  duration: string;
  distance: string;
}

export interface CarType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerKm: number;
  capacity: number;
  features: string[];
  estimatedTime: string;
  image: string;
}

export type ClientSection = 'dashboard' | 'profile' | 'history' | 'book' | 'logout';