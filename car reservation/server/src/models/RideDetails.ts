import mongoose,{Schema,Types} from 'mongoose';

const rideDetails = new mongoose.Schema({
  client_id:{ type: Types.ObjectId, ref: 'ClientInfo' },
  driver_id:{type:Types.ObjectId, ref:'DriverInfo'},
  sourceaddress: String,
  destaddress: String,
  BookedAt:{ type: Date, default: Date.now },
  StartedAt:{type:Date,default:Date.now},
  ReachedAt:{type:Date,default:Date.now},
  status:String,
  fare:Number,
  rating:{type:Number,default:0},
  isRated:Boolean,
  otp: Number
});

export default mongoose.model('RideDetails', rideDetails);
