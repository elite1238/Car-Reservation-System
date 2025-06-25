import { BookingRequest, ApiResponse } from '../types/booking';
import api
 from '../api/axios';
export const createBookingRequest = async (bookingData: BookingRequest): Promise<ApiResponse> => {
  try {
    const response = await api.post('/client/BookRide',bookingData);
    return {
      success: true,
      id:response.data.id,
      message: 'Booking created successfully'
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      id:"Failure",
      success: true,
      bookingId: `BK${Date.now()}`,
      message: 'Booking confirmed! (Demo mode)',
      data: {
        estimatedArrival: '5-8 minutes',
        driverName: 'Rajesh Kumar',
        vehicleNumber: 'KA-01-AB-1234',
        vehicleModel: 'Maruti Swift Dzire'
      }
    };
  }
};
//Not used this one Directly done in the component itself
export const cancelBooking = async (bookingId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_AUTH_TOKEN',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      id:"Cancelled",
      success: true,
      data: data,
      message: 'Booking cancelled successfully'
    };
  } catch (error) {
    console.error('Cancel API Error:', error);
    return {
      id:"Cancelled Error",
      success: false,
      message: 'Failed to cancel booking'
    };
  }
};
//Same as above for this one
export const getBookingStatus = async (bookingId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`/api/bookings/${bookingId}/status`, {
      headers: {
        'Authorization': 'Bearer YOUR_AUTH_TOKEN',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      id:"getBookingStatus",
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Status API Error:', error);
    return {
      id:"getBookingStatus Failed",
      success: false,
      message: 'Failed to get booking status'
    };
  }
};