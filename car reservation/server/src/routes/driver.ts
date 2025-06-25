import express from "express";
import { getpastRides,DriverAuth,fetchDriverData,updateDriver,AvailableToggle,verifyOtp} from "../controllers/driverfunctions";
import {ShowAvailableRideInfo} from '../controllers/Bookingfunctions';
const router = express.Router();

router.post('/pastrides',(req,res,next)=>{
    getpastRides(req,res).catch(next);
});

router.get('/auth',(req,res,next)=>{
    DriverAuth(req,res).catch(next);
});

router.post('/fetchDriverData',(req,res,next)=>{
    fetchDriverData(req,res).catch(next);
});

router.post('/updateProfile',(req,res,next)=>{
    updateDriver(req,res).catch(next);
});

router.post("/toggleAvailable",(req,res,next)=>{
    AvailableToggle(req,res).catch(next);
});

router.get("/ShowAvailableRides",(req,res,next)=>{
    ShowAvailableRideInfo(req,res).catch(next);
});

router.post("/verifyOtp",(req,res,next)=>{
    verifyOtp(req,res).catch(next);
});

export default router;