import { Request,Response } from "express";
import bcrypt from 'bcryptjs';
import  jwt  from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken';
import Users from "../models/Users";
import AdminInfo from "../models/AdminInfo";
import ClientInfo from "../models/ClientInfo";

interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}
export const loginuser = async (req:Request,res:Response)=>{
    const {email,password} = req.body;
    try{
        let admin = await AdminInfo.findOne({ email });
        if (admin && admin.password && (await bcrypt.compare(password, admin.password))) {
            const token = generateToken(admin._id.toString(), "admin");
            res.cookie('token',token,{
                httpOnly:true,
                secure:false,
                sameSite:'lax',
                maxAge:30*24*60*60  *1000,
            });
            return res.json({ token, user: { id: admin._id, role: "admin" } });
        }

        let user = await Users.findOne({email});
        if(user && user.password && (await bcrypt.compare(password,user.password))){
            const token = generateToken(user._id.toString(), user.role!);
            res.cookie('token',token,{
                httpOnly:true,
                secure:false,
                sameSite:'lax',
                maxAge:30*24*60*60  *1000,
            });
            return res.json({ token, user: { id: user._id, role: user.role } });
        }
        res.status(401).json({ message: "Invalid email or password" });

    }
    catch(err){
        res.status(500).json({ message: 'Server error' });
    }
};

export const registeruser= async (req:Request,res:Response)=>{
    const {username,email,phoneno,password,fname,lname} = req.body;
    try{
        const checkadmin =await AdminInfo.findOne({email});
        const checkuser = await Users.findOne({email});
        if(checkadmin || checkuser){
            return res.status(400).json({message:"email already exists"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newClient = new Users({
            email,
            username,
            password:hashedPassword,
            phoneno,
            role:"client",
            createdAt:Date.now(),
            totalRides:0,
        });
        await newClient.save();
        const newClientInfo = new ClientInfo({
            email,
            client_id:newClient._id,
            username,
            phoneno,
            firstName:fname,
            lastName:lname,
            address:{
                street:"No street mentioned",
                city:"No city mentioned",
                state:"No state mentioned",
                postalCode:"No postalCode mentioned",
                country:"No country mentioned"
            },
            profilePhoto:"https://res.cloudinary.com/dikocp7lu/image/upload/v1749723681/defaultprofilepic_zf8bc4.jpg",
            isBlocked:false,
            createdAt:newClient.createdAt,
            totalRides:0
        });
        await newClientInfo.save();
        const token = generateToken(newClient._id.toString(),"client");
        res.cookie('token',token,{
            httpOnly:true,
            secure:false,
            sameSite:'lax',
            maxAge:30*24*60*60  *1000*1000,
        });
        return res.status(201).json({
            message: 'Client registered successfully',
        token,
        });
    }
    catch(err){
        return res.status(500).json({message:"server error during authentication"});
    }
};

export const adminauth = async (req:Request,res:Response)=>{
    const token = req.cookies.token;
    let roledata;
    if(!token){
        return res.status(401).json({message:"Not logged in"});
    }
    try{
        const decoded = jwt.verify(token, "fightclub");
        roledata= decoded;
        if (typeof decoded === "object" && decoded !== null && "role" in decoded && (decoded as any).role === "admin") {
            return res.status(200).json({ role: (decoded as any).role });
        } else {
            return res.status(401).json({ message: "Invalid Role" });
        }
    }
    catch(err){
        return res.status(501).json({message:"Invalid Token",role:roledata,cookie:token});
    }

};

export const logout = async(req:Request,res:Response)=>{
    res.clearCookie('token', {
        httpOnly: true,
        secure: false, 
        sameSite: 'lax', 
        path: '/',
    });
    res.status(200).json({ message: 'Logged out, cookies cleared' });
};