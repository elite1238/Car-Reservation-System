import { Request,Response } from "express";
import Users from "../models/Users";
import DriverInfo from "../models/DriverInfo";
import ClientInfo from "../models/ClientInfo";
import cloudinary from '../utils/cloudinary';
import { upload } from '../middleware/multer';
import RideDetails from "../models/RideDetails";


import bcrypt from "bcryptjs";

export const DashboardStats = async (req:Request,res:Response)=>{
    try{
        const totalDrivers = await Users.countDocuments({role:"driver"});
        const totalClients = await Users.countDocuments({role:"client"});
        const activeDrivers = await DriverInfo.countDocuments({isAvailable:true});
        const totalRides = await RideDetails.countDocuments({status:"completed"});
        res.status(200).json({
            totalDrivers,
            totalClients,
            activeDrivers,
            totalRides,
            message:"Successful"
        });
    }
    catch(err){
        res.status(500).json({
            message:"unsuccessful"
        });
    }
};

export const ListDrivers = async(req:Request,res:Response)=>{
    try{
        const drivers = await DriverInfo.find();
        const formattedDrivers = drivers.map(driver=>({
            _id:driver._id.toString(),
            email:driver.email,
            username:driver.username,
            address:driver.address,
            phoneno:driver.phoneno,
            profilePhoto:driver.profilePhoto,
            available:driver.isAvailable,
            rating:driver.ratings,
            totalRides:driver.totalRides,
            createdAt:driver.createdAt.toISOString()
        }));
        res.status(200).json(formattedDrivers);
    }
    catch(err){
        res.status(500).json({
            message:"unsuccessful"
        });
    }
};

export const ListClients = async(req:Request,res:Response)=>{
    try{
        const clients = ClientInfo.find({},{
            email:1,
            username:1,
            phoneno:1,
            createdAt:1,
            totalRides:1
        });
         const formattedClients = (await clients).map(client => ({
            _id: client._id.toString(),
            email: client.email,
            username: client.username,
            phoneno: client.phoneno,
            createdAt: client.createdAt.toISOString(),
            totalRides: client.totalRides
        }));
        res.status(200).json(formattedClients);
    }
    catch(err){
        res.status(500).json({
            message:"unsuccessful"
        });
    }
};

export const SearchDriver = async(req:Request,res:Response)=>{
    const {id} = req.body;
    try{
        const driver = await DriverInfo.findOne({_id:id});
        const noOfRides = await RideDetails.countDocuments({driver_id:id,status:"completed"});
        if(!(driver===null)){
            const formattedDriverData = {
                _id:driver._id.toString(),
                email:driver.email,
                username:driver.username,
                profilePhoto:driver.profilePhoto,
                address:driver.address,
                phoneno:driver.phoneno,
                available:driver.isAvailable,
                rating:driver.ratings,
                totalRides:noOfRides,
                createdAt:driver.createdAt
            };
            res.status(200).json(formattedDriverData);
        }
        else{
            res.status(401).json({message:"No such driver exists"});
        }
    }
    catch(err){
        res.status(500).json({message:"Error finding driver"});
    }

};

export const registerDriver = async (req: Request, res: Response) => {
  try {
    const {
      firstName, lastName, email, username, phoneno,password,vehicletype,vehicleno
    } = req.body;

    let address;
    try {
        address = typeof req.body.address === 'string'
        ? JSON.parse(req.body.address)
        : req.body.address;
    } catch (err) {
        console.error('Invalid address format:', req.body.address);
        return res.status(400).json({ message: 'Invalid address format' });
    }

    const uploadToCloudinary = (fileBuffer: Buffer, folder: string, resourceType: 'image' | 'raw') =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: resourceType, folder },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(fileBuffer);
      });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const profilePhotoResult = await uploadToCloudinary(files.profilePhoto[0].buffer, 'drivers/profile', 'image') as any;
    const licenseResult = await uploadToCloudinary(files.licenseFile[0].buffer, 'drivers/license', 'image') as any;
    const insuranceResult = await uploadToCloudinary(files.vehicleInsurance[0].buffer, 'drivers/insurance', 'image') as any;
    const rcResult = await uploadToCloudinary(files.vehicleRCBook[0].buffer, 'drivers/rcbook', 'image') as any;

    
    const newUser = new Users({
        email,
        username,
        password:bcrypt.hash(password,10),
        phoneno,
        role:"driver",
        createdAt:Date.now(),
        totalRides:0
    });
    newUser.save();
    const newDriver = new DriverInfo({
      email,
      driver_id:newUser._id,
      username,
      phoneno,
      firstName,
      lastName,
      address,
      profilePhoto: profilePhotoResult.secure_url,
      ratings:0,
      license: {
        licenseLink: licenseResult.secure_url,
        fileType: licenseResult.format,
      },
      vehicleInfo: {
        Vtype:vehicletype,
        Vno:vehicleno,
        Vinsurance: insuranceResult.secure_url,
        rc: rcResult.secure_url,
      },
      isBlocked: false,
      isAvailable: true,
      createdAt:newUser.createdAt,
      totalRides:0
    });

    await newDriver.save();
    res.status(200).json({ message: 'Driver registered successfully', data: newDriver });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering driver', error });
  }
};

export const ClientRideData = async(req:Request,res:Response)=>{
    const {id} = req.body;
        try{
            const ridedata = await RideDetails.find({client_id:id});
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