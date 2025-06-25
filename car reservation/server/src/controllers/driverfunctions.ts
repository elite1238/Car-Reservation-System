import { Request,Response } from "express";
import RideDetails from "../models/RideDetails";
import  jwt  from 'jsonwebtoken';
import DriverInfo from "../models/DriverInfo";


export const AvailableToggle = async (req:Request,res:Response)=>{
    const {id} = req.body;
    try{
        const driverdata = await DriverInfo.findOne({_id:id});
        const driverinfo = await DriverInfo.updateOne({_id:id},{
            $set:{
                isAvailable:!(driverdata?.isAvailable),
            }
        });
        res.status(200).json({message:"Successfully Toggled"});
    }
    catch(err){
        res.status(500).json({message:"Toggle Error"});
    }
    
};

export const getpastRides = async(req:Request,res:Response)=>{
    const {id} = req.body;
    try{
        const ridedata = await RideDetails.find({driver_id:id});
        const formattedData = ridedata.map(ride=>({
            id:ride._id,
            date:ride.BookedAt?.toLocaleDateString(),
            pickup:ride.sourceaddress,
            destination:ride.destaddress,
            distance:'NaN',
            duration:'NaN',
            fare:ride.fare,
            rating :ride.rating,
            status:ride.status
        }));
        res.status(200).json(formattedData);
    }
    catch(err){
        res.status(500).json({message:"Error cannot get past ride data"});
    }
};

export const DriverAuth = async(req:Request,res:Response)=>{
    const token = req.cookies.token;
    let roledata;
    if(!token){
        return res.status(401).json({message:"Not logged in"});
    }
    try{
        const decoded = jwt.verify(token, "fightclub");
        roledata= decoded;
        if (typeof decoded === "object" && decoded !== null && "role" in decoded && (decoded as any).role === "driver") {
            const driverInfoDetails = await DriverInfo.findOne({driver_id:decoded.id});
            return res.status(200).json({ role: (decoded as any).role,id:driverInfoDetails!._id});
        } else {
            return res.status(401).json({ message: "Invalid Role" });
        }
    }
    catch(err){
        return res.status(501).json({message:"Invalid Token",role:roledata,cookie:token});
    }
};

export const fetchDriverData = async(req:Request,res:Response)=>{
    const {id} = req.body;
    try{
        const driverData = await DriverInfo.findOne({_id:id});
        const noOfRides = await RideDetails.countDocuments({driver_id:id,status:"completed"});
        const formattedData = {
            _id:driverData?._id,
            address:driverData?.address,
            license:driverData?.license,
            vehicleInfo:driverData?.vehicleInfo,
            email:driverData?.email,
            driver_id:driverData?.driver_id,
            username:driverData?.username,
            phoneno:driverData?.phoneno,
            firstName:driverData?.firstName,
            lastName:driverData?.lastName,
            profilePhoto:driverData?.profilePhoto,
            ratings:driverData?.ratings,
            isBlocked:driverData?.isBlocked,
            isAvailable:driverData?.isAvailable,
            createdAt:driverData?.createdAt,
            totalRides:noOfRides,
            __v:driverData?.__v
        };
        res.status(200).json(formattedData);
    }
    catch(err){
        res.status(500).json({
            message:"Error fetching Client Data"
        });
    }
};

export const updateDriver = async(req:Request,res:Response)=>{
    const {id,firstName,lastName,phoneno,address} = req.body;
        try{
            const result = await DriverInfo.updateOne({_id:id},{$set:{
                firstName,
                lastName,
                phoneno,
                address
            }});
            if(result.matchedCount===0){
                return res.status(400).json({message:"Profile not updated"});
            }
            else if(result.modifiedCount===0)
                return res.status(200).json({message:"Same data"});
            return res.status(200).json({message:"Profile Updated Successfully",firstName,lastName,phoneno});
        }
        catch(err){
            return res.status(500).json({message:"Error updating Profile"});
        }
};

export const verifyOtp = async(req:Request,res:Response)=>{
    const {id,otp} = req.body;
    try{
        const response = await RideDetails.findOne({_id:id});
        if(otp===response?.otp?.toString()){
            res.status(200).json({message:"sucess"});
            const result = await RideDetails.updateOne({_id:id},{$set:{
                status:"ongoing"
            }});
        }
        else{
            res.status(400).json({message:"Wrong Otp"});
        }
    }
    catch(err){
        res.status(500).json({
            message:"Error verifying otp"
        })
    }
};