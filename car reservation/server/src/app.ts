import express from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import Authroutes from './routes/auth';
import Adminroutes from './routes/admin';
import Clientroutes from './routes/client';
import DriverRoutes from './routes/driver';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177'] ,
  //Put your local host Links
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/",Authroutes);
app.use("/admin",Adminroutes);
app.use("/client",Clientroutes);
app.use('/driver',DriverRoutes);

export default app;
