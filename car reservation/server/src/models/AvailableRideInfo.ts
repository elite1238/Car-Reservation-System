import mongoose, { Types } from 'mongoose';
export interface AvailableRide {
  id: string;
  client_id: string;
  bookedAt: string;
  vtype: string;
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
  address: string;
  placeId: string;
}
const tempBookingInfo = new mongoose.Schema({
  client_id:{ type: Types.ObjectId, ref: 'ClientInfo' },
  clientName:String,
  BookedAt:{ type: Date, default: Date.now },
  sourceLocation: {
  lat: Number,
  lng: Number,
  address: String,
  placeId: String
},
  destinationLocation: {
  lat: Number,
  lng: Number,
  address: String,
  placeId: String,
},
  status:{type: String, default: "Booked"},
  distance:{type: Number,default:-1},
  fare:{type:Number,default:-2},
  requestTime:{type:Date,default:Date.now()}
});

export default mongoose.model('AvailableRideInfo', tempBookingInfo);
