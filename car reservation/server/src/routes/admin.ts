import express from "express";
import { DashboardStats,ListDrivers,ListClients,SearchDriver,registerDriver,ClientRideData } from "../controllers/adminfunctions";
import { upload } from "../middleware/multer";

const router = express.Router();

router.get("/dashboard",(req,res,next)=>{
    DashboardStats(req,res).catch(next);
});

router.get("/driverlist",(req,res,next)=>{
    ListDrivers(req,res).catch(next);
});

router.get("/clientlist",(req,res,next)=>{
    ListClients(req,res).catch(next);   
});

router.post('/registerdriver',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'licenseFile', maxCount: 1 },
    { name: 'vehicleInsurance', maxCount: 1 },
    { name: 'vehicleRCBook', maxCount: 1 },
  ]),
  (req, res, next) => {
    registerDriver(req, res).catch(next);
  }
);

router.post("/searchdriver",(req,res,next)=>{
    SearchDriver(req,res).catch(next);
});

router.post("/ClientPastRides",(req,res,next)=>{
  ClientRideData(req,res).catch(next);
});

export default router;