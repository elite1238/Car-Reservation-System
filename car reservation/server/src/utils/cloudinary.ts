import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,//put your cloud_name          |     FOR
  api_key: process.env.CLOUDINARY_API_KEY!, // put your api key                 | CLOUDINARY
  api_secret: process.env.CLOUDINARY_API_SECRET!, //put yout api secret key     |
});

export default cloudinary;
