import { Request,Response } from "express";
import RideDetails from "../models/RideDetails";
import mongoose from "mongoose";
import  jwt  from 'jsonwebtoken';
import ClientInfo from "../models/ClientInfo";

export const ClientDashboardStats = async (req:Request,res:Response)=>{
    const {id} = req.body;
    try{
        const totalRides = await RideDetails.countDocuments({client_id:id});
        const totalspentagg = await RideDetails.aggregate([
            {   
            $match: { client_id: new mongoose.Types.ObjectId(id as string),
                    status:"completed", },
            },
            {
                $group: {
                    _id: null,
                    totalRide: { $sum: "$fare" },
                },
            },
        ]);
        const totalSpent = totalspentagg[0]?.totalRide || 0;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const ridesThisMonth = await RideDetails.countDocuments({
            client_id: id,
            BookedAt: { $gte: firstDayOfMonth },
            status:"completed"
        });
        const ridesCompleted = await RideDetails.countDocuments({
            client_id:id,
            status:"completed"
        });
        res.status(200).json({
            totalRides,
            totalSpent,
            ridesThisMonth,
            ridesCompleted,
            message:"Successful"
        });
    }
    catch(err){
        res.status(500).json({
            message:"Error Loading Dashboard"
        });
    }
};

const getRandomIntInclusive =(min:number, max:number)=> {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getotp = async(req:Request,res:Response)=>{
    const {id} = req.body;
    try{
        const result = await RideDetails.findOne({_id:id});
        res.status(200).json({message:"Sucess",otp:result?.otp});
    }
    catch(err){
        res.status(500).json({message:"Error finding otp"});
    }
};

export const addRideDetails = async(req:Request,res:Response)=>{
    const {clientID,driverID,sourceaddress,destaddress,status,fare,rating,isRated} = req.body;
    const randomInteger = getRandomIntInclusive(1000, 9999);
    const newRideDetails = new RideDetails({
        client_id:clientID,
          driver_id:driverID,
          sourceaddress,
          destaddress,
          BookedAt:Date.now(),
          StartedAt:Date.now(),
          ReachedAt:Date.now(),
          status,
          fare,
          rating,
          isRated,
          otp:randomInteger
    });
    try{
        newRideDetails.save();
        res.status(200).json({
            message:"Data added successfully",
            id:newRideDetails._id
        });
    }
    catch(err){
        console.error("Not Inserted");
        res.status(500).json({
            message:"Data not inserted"
        });
    }
};

export const clientAuth = async (req:Request,res:Response)=>{
    const token = req.cookies.token;
    let roledata;
    if(!token){
        return res.status(401).json({message:"Not logged in"});
    }
    try{
        const decoded = jwt.verify(token, "fightclub");
        roledata= decoded;
        if (typeof decoded === "object" && decoded !== null && "role" in decoded && (decoded as any).role === "client") {
            const clientInfoDetails = await ClientInfo.findOne({client_id:decoded.id});
            return res.status(200).json({ role: (decoded as any).role,id:clientInfoDetails!._id});
        } else {
            return res.status(401).json({ message: "Invalid Role" });
        }

    }
    catch(err){
        return res.status(501).json({message:"Invalid Token",role:roledata,cookie:token});
    }

};

export const fetchClientData = async(req:Request,res:Response)=>{
    const {id} = req.body;
    try{
        const clientData = await ClientInfo.findOne({_id:id});
        const noOfRides = await RideDetails.countDocuments({client_id:id,status:"completed"});
        const formattedData = {
            _id:clientData?._id,
            email: clientData?.email,
            client_id: clientData?.client_id,
            username:clientData?.username,
            phoneno:clientData?.phoneno,
            firstName:clientData?.firstName,
            lastName:clientData?.lastName,
            address:clientData?.address,
            profilePhoto:clientData?.profilePhoto,
            isBlocked:clientData?.isBlocked,
            createdAt:clientData?.createdAt,
            totalRides:noOfRides,
            __v:clientData?.__v
        }
        res.status(200).json(formattedData);
    }
    catch(err){
        res.status(500).json({
            message:"Error fetching Client Data"
        });
    }
};

export const getRideData = async(req:Request,res:Response)=>{
    const {id} = req.body;
    let temp=-1;
    try{
        const ridedata = await RideDetails.find({client_id:id})
        .populate('client_id')
        .populate('driver_id');
        const formattedData = ridedata.map(ride => ({
            id: ride._id,
            date: ride.BookedAt?.toLocaleDateString(),
            time: ride.BookedAt?.toLocaleTimeString(),
            source: ride.sourceaddress,
            destination: ride.destaddress,
            status: ride.status,
            driver: (ride.driver_id as any)?.username,
            carType: (ride.driver_id as any)?.vehicleInfo.Vtype,
            amount: ride.fare,
            duration:"NaN",
            distance:"NaN",
        }));
        temp=ridedata.length;
        res.status(200).json(formattedData);
    }   
    catch(err){
        res.status(500).json({message:"Error getting ride Data",error:err,temp});
    }
};

export const updateProfile = async(req:Request,res:Response)=>{
    const {id,firstName,lastName,username,phoneno,address} = req.body;
    try{
        const result = await ClientInfo.updateOne({_id:id},{$set:{
            firstName,
            lastName,
            username,
            phoneno,
            address
        }});
        if(result.matchedCount===0){
            return res.status(400).json({message:"Profile not updated"});
        }
        else if(result.modifiedCount===0)
            return res.status(200).json({message:"Same data"});
        return res.status(200).json({message:"Profile Updated Successfully",firstName,lastName,username,phoneno});
    }
    catch(err){
        return res.status(500).json({message:"Error updating Profile"});
    }
};