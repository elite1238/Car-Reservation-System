import mongoose,{Schema,Types} from 'mongoose';

const clientinfo = new mongoose.Schema({
  email:String,
  client_id:{ type: Types.ObjectId, ref: 'Users' },
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
  profilePhoto:{type:String, default:"https://res.cloudinary.com/dikocp7lu/image/upload/v1749723681/defaultprofilepic_zf8bc4.jpg"},
  isBlocked:Boolean,
  createdAt:{ type: Date, default: Date.now },
  totalRides:{ type: Number, default: 0 },
});

export default mongoose.model('ClientInfo', clientinfo);
