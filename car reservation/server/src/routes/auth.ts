import express from "express";
import {loginuser,registeruser,adminauth,logout} from '../controllers/authentication';

const router = express.Router();

router.post('/login',(req,res,next)=>{
    loginuser(req,res).catch(next);
});

router.post('/register',(req,res,next)=>{
    registeruser(req,res).catch(next);
});

router.get('/checkadmin',(req,res,next)=>{
    adminauth(req,res).catch(next);
});

router.get('/logout',(req,res,next)=>{
    logout(req,res).catch(next);
})

export default router;