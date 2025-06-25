import React, { useEffect, useState } from 'react';
import { MapPin, Clock, TrendingUp, Car, CreditCard } from 'lucide-react';
import api from '../api/axios';
import { Booking } from '../types';

interface USER{
  _id: String,
  email: String,
  client_id: String,
  username: String,
  phoneno: String,
  firstName: String,
  lastName: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  profilePhoto: String,
  isBlocked: Boolean,
  createdAt: Date,
  totalRides: Number
};
interface DASHBOARD{
  totalRides:String,
  totalSpent:Number,
  ridesThisMonth:Number,
  ridesCompleted:Number
};
const Dashboard: React.FC = () => {
  

  const [dashboardData,setdashBoardData] = useState<DASHBOARD | null>(null);
  const [mockUser,setuserdata] = useState<USER | null>(null);
  const [loading, setLoading] = useState(true);
  const [id,setid] = useState("");
  const [recentBookings, setRecentBookings] = useState<Booking[] | null>(null);
  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await api.get('/client/clientAuth');
      const clientData = res.data as { id: string };
      const clientId = clientData.id;
      setid(clientId); 

      const userDataRes = await api.post('/client/getclientinfo', { id: clientId });
      setuserdata(userDataRes.data as USER);

      const dashboardRes = await api.post('/client/dashboard', { id: clientId });
      setdashBoardData(dashboardRes.data as DASHBOARD);
      
      const recentB = await api.post('/client/getRideData',{id:clientId});
      setRecentBookings((recentB.data as Booking[]).slice(0,3));
    } catch (error) {
      console.error('Error fetching client data or dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);

  const stats = [
    {
      icon: Car,
      label: 'Total Rides',
      value: dashboardData?.totalRides.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: CreditCard,
      label: 'Total Spent',
      value: `₹${dashboardData?.totalSpent.toFixed(2)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: 'This Month',
      value: dashboardData?.ridesThisMonth+' rides',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Clock,
      label: 'Completed',
      value: dashboardData?.ridesCompleted.toString(),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error loading dashboard data</p>
      </div>
    );
  }
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {mockUser?.firstName}!
        </h1>
        <p className="text-gray-600">
          Ready for your next journey? Here's your activity overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Trips</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentBookings && recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    booking.status === 'completed' ? 'bg-green-500' :
                    booking.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.source}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    to {booking.destination}
                  </p>
                  <p className="text-xs text-gray-400">
                    {booking.date} • {booking.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{booking.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{booking.carType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 transition-colors"
               onClick={() => window.location.href = 'http://localhost:5176/'}>
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">Book a Ride Now</span>
              </div>
            </button>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Car className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Account Status: Active</h3>
                  <p className="text-sm text-gray-600">
                    You have completed {dashboardData?.totalRides} rides. Keep exploring!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;