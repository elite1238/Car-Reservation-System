import { Request,Response } from "express";
import tempbooking from '../models/AvailableRideInfo';
import RideDetails from "../models/RideDetails";
import ClientInfo from "../models/ClientInfo";
import AvailableRideInfo from "../models/AvailableRideInfo";
import mongoose from "mongoose";


export const AddAvailableBookingInfo = async(req:Request,res:Response)=>{
    const {client_id,sourceLocation,destinationLocation,distance,estimatedFare,requestTime} = req.body;
    try{
        const clientdata = await ClientInfo.findOne({_id:client_id});
        const formattedBookingInfo = {
           client_id,
           clientName:clientdata?.username,
           sourceLocation,
           BookedAt:Date.now(),
           destinationLocation,
           distance,
           fare:estimatedFare,
           requestTime,
           status:"Booked"// Booked | Confirmed | Ongoing | completed | cancelled
        };
        const response = await tempbooking.insertOne(formattedBookingInfo);
        res.status(200).json({message:"Booking added","id":response.id});
    }
    catch(err){
        res.status(500).json({message:"Error cannot add Booking info"});
    }
};

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
}

export const ShowAvailableRideInfo = async(req:Request,res:Response)=>{
    try{
        const AvailableData = await tempbooking.find();
        const filteredData = AvailableData.map(RideData=>({
            id:RideData._id,
            client_id:RideData.client_id,
            bookedAt:RideData.BookedAt,
            sourceLocation:RideData.sourceLocation,
            destinationLocation:RideData.destinationLocation,
            status:RideData.status,
            distance:RideData.distance,
            fare:RideData.fare,
            requestTime: timeAgo(new Date(RideData.requestTime).getTime()),
            ClientName:RideData.clientName
        }));
        res.status(200).json(filteredData);
    }
    catch(err){
        res.status(500).json({message:"Error Cannot show Available Rides Details"});
    }
};

export const CancelBooking = async(req:Request,res:Response)=>{
    const {id} = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid booking ID format" });
    }
    try{
        const result = await AvailableRideInfo.deleteOne({_id:id});
        if(result.deletedCount ===0){
            res.status(200).json({message:"No such ID exists"});
        }
        else{
            res.status(200).json({message:"Sucessfully deleted"});
        }
    }
    catch(err){
        console.error("Error while cancelling booking:", err);
        res.status(500).json({message:"Error while cancelling booking"});
    }
};

export const hadBooked = async(req:Request,res:Response)=>{
    const {id} =req.body;
    try{
        const result = await AvailableRideInfo.findOne({client_id:id});
        if(!result){
            res.status(200).json({message:"Not booked",canBook:true});
        }
        else{
            res.status(200).json({
                message:"Already Booked",
                canBook:false,
                bookingInfo:result
            });
        }
    }
    catch(err){
        res.status(500).json({
            message:"Error in booking",
            canBook:false
        });
    }
};

export const getDriverIDfromRideDetails = async(req:Request,res:Response)=>{
    const {id} = req.body;
    try{
        const rideDetail = await RideDetails.findOne({_id:id});
        if(!rideDetail){
            res.status(400).json({message:"No such Ride details"});
        }
        else{
            res.status(200).json({message:"Found driver",driver_id:rideDetail.driver_id});
        }
    }
    catch(err){
        res.status(500).json({message:"Error finding driver details"});
    }
};


export const statusUpdate = async(req:Request,res:Response)=>{
    const {id,newStatus} = req.body;
    try{
        const response = await RideDetails.updateOne({_id:id},{$set:{
            status:newStatus
        }});
        res.status(200).json({message:"Status Updated as "+newStatus});
    }
    catch{
        res.status(500).json({message:"Error updating status as "+newStatus});
    }
};

