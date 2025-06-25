import mongoose from 'mongoose';

const userinfo = new mongoose.Schema({
  email:String,
  username:String,
  password:String,
  phoneno:String,
  role:String,
  createdAt:{ type: Date, default: Date.now },
  totalRides:{ type: Number, default: 0 },
});

export default mongoose.model('Users', userinfo);
