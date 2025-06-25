import mongoose,{Schema,Types} from 'mongoose';

const driverinfo = new mongoose.Schema({
  email:String,
  driver_id:{ type: Types.ObjectId, ref: 'Users' },
  username:String,
  phoneno:String,
  firstName:String,
  lastName:String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },

  profilePhoto:String,
  ratings:Number, //calculate and use dynamically

  license:{
    licenseLink:String,
    fileType:String
  },
  vehicleInfo:{
    Vtype:String,
    Vno:String,
    Vinsurance:String,
    rc:String
  },
  isBlocked:Boolean,
  isAvailable:Boolean,
  createdAt:{ type: Date, default: Date.now },
  totalRides:{ type: Number, default: 0 },
});

export default mongoose.model('DriverInfo', driverinfo);
