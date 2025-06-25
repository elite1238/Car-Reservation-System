import mongoose from 'mongoose';

const admininfo = new mongoose.Schema({
  email:String,
  username:String,
  password:String,
  role:String
});

export default mongoose.model('adminInfo', admininfo);
