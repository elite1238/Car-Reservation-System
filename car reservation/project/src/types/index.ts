export interface Driver {
  _id: string;
  email: string;
  username: string;
  // password: string;
  address?: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  };
  profilePhoto:string;
  phoneno?: string;
  available: boolean;
  rating: number;
  totalRides: number;
  createdAt: string;
}

export interface Client {
  _id: string;
  email: string;
  username: string;
  phoneno?: string;
  createdAt: string;
  totalRides: number;
}

export interface DashboardStats {
  totalDrivers: number;
  totalClients: number;
  activeDrivers: number;
  totalRides: number;
  // totalComplaints: number;
  // revenue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinDate: string;
  totalRides: number;
  rating: number;
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
  rating?: number;
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

export type ClientSection = 'dashboard' | 'profile' | 'history' | 'book';