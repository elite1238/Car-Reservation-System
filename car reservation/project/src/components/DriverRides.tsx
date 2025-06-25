import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Star, 
  Calendar,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { Trip } from '../types/driver';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';

const DriverRide: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const [trips,setTrips] = useState<Trip[] | null>(null);
   useEffect(() => {
    const apicalling = async () => {
      try {
        const pastridedata = await api.post("/driver/pastrides",{id:id});
        setTrips(pastridedata.data);
      } catch (error) {
        console.error('Error fetching driver:', error);
      } 
    };
    apicalling();
  }, []);
  
  const filteredTrips = (trips ?? []).filter(trip => {
    const matchesSearch = trip.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalEarnings = (trips ?? []).filter(t => t.status === 'completed').reduce((sum, trip) => sum + trip.fare, 0);
  const completedTrips = (trips ?? []).filter(t => t.status === 'completed').length;
  const cancelledTrips = (trips ?? []).filter(t => t.status === 'cancelled').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/drivers')}
          className="flex items-center text-gray-400 hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Drivers
        </button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Trip History</h1>
        <p className="text-gray-200">View Driver's ride history and earnings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">₹{totalEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed Trips</p>
              <p className="text-2xl font-bold text-blue-600">{completedTrips}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cancelled Trips</p>
              <p className="text-2xl font-bold text-red-600">{cancelledTrips}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="confirmed">Confirmed</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Trips ({filteredTrips.length})</h2>
        </div>
        <div className="overflow-hidden">
          {filteredTrips.map((trip, index) => (
            <div key={trip.id} className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${index !== filteredTrips.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">Trip #{trip.id}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (trip.status === 'completed' || trip.status ==='confirmed' || trip.status === 'ongoing')
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{trip.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center text-gray-700">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="font-medium">{trip.pickup}</span>
                    </div>
                    <div className="flex-1 border-t border-dashed border-gray-300"></div>
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium">{trip.destination}</span>
                      <div className="w-3 h-3 bg-red-500 rounded-full ml-2"></div>
                    </div>
                  </div>
                </div>

                <div className="ml-6 text-right">
                  <div className={`text-2xl font-bold ${
                    (trip.status === 'completed'|| trip.status==='confirmed' || trip.status === 'ongoing')? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {(trip.status === 'completed' || trip.status==='confirmed' || trip.status === 'ongoing')? `₹${trip.fare.toFixed(2)}` : 'Cancelled'}
                  </div>
                  {trip.status === 'completed' && trip.rating > 0 && (
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < trip.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredTrips.length === 0 && (
            <div className="p-12 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverRide;