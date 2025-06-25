import { User, Booking, CarType } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  joinDate: '2023-01-15',
  totalRides: 47,
  rating: 4.8
};

export const mockBookings: Booking[] = [
  {
    id: '1',
    date: '2024-01-15',
    time: '09:30 AM',
    source: 'Times Square, New York',
    destination: 'Central Park, New York',
    status: 'completed',
    driver: 'Michael Smith',
    carType: 'Comfort',
    amount: 18.50,
    duration: '22 min',
    distance: '3.2 km',
    rating: 5
  },
  {
    id: '2',
    date: '2024-01-12',
    time: '02:15 PM',
    source: 'Brooklyn Bridge',
    destination: 'Wall Street',
    status: 'completed',
    driver: 'Sarah Wilson',
    carType: 'Premium',
    amount: 24.75,
    duration: '18 min',
    distance: '2.8 km',
    rating: 4
  },
  {
    id: '3',
    date: '2024-01-10',
    time: '07:45 PM',
    source: 'JFK Airport',
    destination: 'Manhattan Hotel',
    status: 'completed',
    driver: 'David Brown',
    carType: 'Executive',
    amount: 65.20,
    duration: '45 min',
    distance: '26.1 km',
    rating: 5
  },
  {
    id: '4',
    date: '2024-01-08',
    time: '11:20 AM',
    source: 'Greenwich Village',
    destination: 'SoHo District',
    status: 'cancelled',
    driver: 'Emma Davis',
    carType: 'Comfort',
    amount: 0,
    duration: '0 min',
    distance: '0 km'
  }
];

export const carTypes: CarType[] = [
  {
    id: '1',
    name: 'Comfort',
    description: 'Affordable rides with reliable drivers',
    basePrice: 3.50,
    pricePerKm: 1.20,
    capacity: 4,
    features: ['AC', 'Music', 'Phone Charger'],
    estimatedTime: '3-5 min',
    image: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg'
  },
  {
    id: '2',
    name: 'Premium',
    description: 'Higher-end cars with top-rated drivers',
    basePrice: 5.00,
    pricePerKm: 1.80,
    capacity: 4,
    features: ['AC', 'Premium Music', 'Phone Charger', 'WiFi'],
    estimatedTime: '2-4 min',
    image: 'https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg'
  },
  {
    id: '3',
    name: 'Executive',
    description: 'Luxury vehicles for special occasions',
    basePrice: 8.00,
    pricePerKm: 2.50,
    capacity: 4,
    features: ['AC', 'Premium Music', 'Phone Charger', 'WiFi', 'Refreshments'],
    estimatedTime: '5-8 min',
    image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg'
  },
  {
    id: '4',
    name: 'SUV',
    description: 'Spacious rides for groups',
    basePrice: 6.50,
    pricePerKm: 2.00,
    capacity: 7,
    features: ['AC', 'Music', 'Phone Charger', 'Extra Space'],
    estimatedTime: '4-7 min',
    image: 'https://images.pexels.com/photos/136872/pexels-photo-136872.jpeg'
  }
];