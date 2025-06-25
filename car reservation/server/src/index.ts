import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 5000; //put yout port

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
    //put your orgin stuff
    credentials: true,
  },
});

const bookingSocketMap: Record<string, string> = {}; 


io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('driverLocation', ({ driverId, lat, lng }) => {
    io.emit('driverLocation', { driverId, lat, lng });
  });

  socket.on('listenToBooking', ({ bookingId }) => {
    bookingSocketMap[bookingId] = socket.id;
    console.log(`Client is now listening to booking ${bookingId}`);
    console.log(bookingSocketMap);
  });

   socket.on('driverAcceptedRide', ({ bookingId, rideId }) => {
    const clientSocketId = bookingSocketMap[bookingId];
    if (clientSocketId) {
      io.to(clientSocketId).emit('rideConfirmed', {
        bookingId,
        rideId,
      });
      console.log(`Sent rideConfirmed to client for booking ${bookingId} rideId is ${rideId}`);
    } else {
      console.log(`No client found listening for booking ${bookingId}`);
    }
  });

   socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    for (const bookingId in bookingSocketMap) {
      if (bookingSocketMap[bookingId] === socket.id) {
        delete bookingSocketMap[bookingId];
        break;
      }
    }
  });

});
mongoose.connect(process.env.MONGODB_URI!) // Put your monogdb url
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❗ Error connecting to MongoDB:', error);
  });
