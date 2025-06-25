import React, { useEffect, useState } from 'react';
import { Filter, ChevronDown, Car } from 'lucide-react';
import { Booking } from '../types';
import api from '../api/axios';

const BookingHistory: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled' | 'confirmed' | 'ongoing'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [id,setid] = useState("");
  const [mockBookings,setBookings] = useState<Booking[] | null>(null);
  useEffect(()=>{
    const getBookingData = async()=>{
      try{
        const res = await api.get('/client/clientAuth');
        const clientData = res.data as { id: string };
        const clientId = clientData.id;
        setid(clientId); 
        const Booking = await api.post('/client/getRideData',{id:clientId});
        setBookings(Booking.data as Booking[]);
      }
      catch(err){
        console.error("Error getting Booking History");
      }
    };
    getBookingData();
  },[]);
  const filteredBookings = (mockBookings ?? []).filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip History</h1>
        <p className="text-gray-600">View and manage your previous bookings</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Filter trips:</span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="capitalize">{filter === 'all' ? 'All trips' : `${filter} trips`}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  {['all', 'completed', 'cancelled','confirmed','ongoing'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setFilter(option as any);
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors capitalize"
                    >
                      {option === 'all' ? 'All trips' : `${option} trips`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-600">No trips match your current filter criteria.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          booking.status === 'completed' ? 'bg-green-500' :
                          booking.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                      </div>
                      <div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.date} at {booking.time} • {booking.carType}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{booking.amount.toFixed(2)}
                      </p>
                      {/* <p className="text-sm text-gray-500">{booking.duration}</p> */}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">From</p>
                        <p className="text-sm text-gray-600 truncate">{booking.source}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">To</p>
                        <p className="text-sm text-gray-600 truncate">{booking.destination}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Driver: {booking.driver}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredBookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{filteredBookings.length}</p>
              <p className="text-sm text-gray-600">Total Trips</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {filteredBookings.filter(b => b.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                ₹{filteredBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;