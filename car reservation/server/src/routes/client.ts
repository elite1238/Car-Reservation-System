import express from "express";
import { ClientDashboardStats,addRideDetails,clientAuth,fetchClientData,updateProfile,getRideData,getotp} from "../controllers/clientfunctions";
import {AddAvailableBookingInfo,CancelBooking,hadBooked,getDriverIDfromRideDetails,statusUpdate} from '../controllers/Bookingfunctions';

const router = express.Router();

router.post("/dashboard",(req,res,next)=>{
    ClientDashboardStats(req,res).catch(next);
});

router.post("/addRideDetails",(req,res,next)=>{
    addRideDetails(req,res).catch(next);
});

router.get("/clientauth",(req,res,next)=>{
    clientAuth(req,res).catch(next);
});

router.post('/getclientinfo',(req,res,next)=>{
    fetchClientData(req,res).catch(next);
});

router.post('/updateprofile',(req,res,next)=>{
    updateProfile(req,res).catch(next);
});

router.post('/getRideData',(req,res,next)=>{
    getRideData(req,res).catch(next);
});

router.post('/cancelbooking',(req,res,next)=>{
    CancelBooking(req,res).catch(next);
});

router.post('/hadbooked',(req,res,next)=>{
    hadBooked(req,res).catch(next);
});

router.post('/BookRide',(req,res,next)=>{
    AddAvailableBookingInfo(req,res).catch(next);
});

router.post('/getDriverIdfromRides',(req,res,next)=>{
    getDriverIDfromRideDetails(req,res).catch(next);
});

router.post('/changeRideStatus',(req,res,next)=>{
    statusUpdate(req,res).catch(next);
});

router.post('/getotp',(req,res,next)=>{
    getotp(req,res).catch(next);
});
export default router;