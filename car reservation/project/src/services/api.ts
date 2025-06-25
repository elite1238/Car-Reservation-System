import { Driver, Client, DashboardStats } from '../types';

// Mock data
const mockDrivers: Driver[] = [
  {
    _id: '1',
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'hashedpassword123',
    address: '123 Main St, City',
    phoneno: '+1234567890',
    available: true,
    rating: 4.8,
    totalRides: 150,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    _id: '2',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    password: 'hashedpassword456',
    address: '456 Oak Ave, Town',
    phoneno: '+1987654321',
    available: false,
    rating: 4.6,
    totalRides: 89,
    createdAt: '2024-02-20T14:45:00Z'
  },
  {
    _id: '3',
    email: 'mike.wilson@example.com',
    username: 'mikewilson',
    password: 'hashedpassword789',
    address: '789 Pine Rd, Village',
    phoneno: '+1122334455',
    available: true,
    rating: 4.2,
    totalRides: 45,
    createdAt: '2024-03-10T09:15:00Z'
  },
  {
    _id: '4',
    email: 'sarah.johnson@example.com',
    username: 'sarahjohnson',
    password: 'hashedpassword101',
    address: '321 Elm St, District',
    phoneno: '+1556677889',
    available: true,
    rating: 4.9,
    totalRides: 203,
    createdAt: '2024-03-25T16:20:00Z'
  }
];

const mockClients: Client[] = [
  {
    _id: '1',
    email: 'alice.brown@example.com',
    username: 'alicebrown',
    phoneno: '+1111222333',
    createdAt: '2024-01-10T08:00:00Z',
    totalRides: 25
  },
  {
    _id: '2',
    email: 'bob.davis@example.com',
    username: 'bobdavis',
    phoneno: '+1444555666',
    createdAt: '2024-02-05T12:30:00Z',
    totalRides: 12
  },
  {
    _id: '3',
    email: 'carol.white@example.com',
    username: 'carolwhite',
    phoneno: '+1777888999',
    createdAt: '2024-03-01T15:45:00Z',
    totalRides: 8
  }
];

const mockStats: DashboardStats = {
  totalDrivers: 4,
  totalClients: 3,
  activeDrivers: 3,
  totalRides: 487,
  // totalComplaints: 5,
  // revenue: 28400
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(500);
    return mockStats;
  },

  async getAllDrivers(): Promise<Driver[]> {
    await delay(800);
    return mockDrivers;
  },

  async getDriverById(id: string): Promise<Driver | null> {
    await delay(300);
    return mockDrivers.find(driver => driver._id === id) || null;
  },

  async getAllClients(): Promise<Client[]> {
    await delay(700);
    return mockClients;
  },

  async addDriver(driverData: Omit<Driver, '_id' | 'rating' | 'totalRides' | 'createdAt'>): Promise<Driver> {
    await delay(1000);
    const newDriver: Driver = {
      ...driverData,
      _id: Date.now().toString(),
      rating: 0,
      totalRides: 0,
      createdAt: new Date().toISOString()
    };
    mockDrivers.push(newDriver);
    return newDriver;
  }
};