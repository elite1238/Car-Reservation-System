// utils/generateToken.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (userId: string, role: string):string => {
  const payload ={id:userId,role};
  const secret = process.env.JWT_SECRET; //Put yout secret Key
  if (!secret) {
    throw new Error('JWT_SECRET not defined in environment variables');
  }
  const options: SignOptions = {
    expiresIn:'4h',
  };

  const token = jwt.sign(payload, "fightclub", options);

  return token;
};
