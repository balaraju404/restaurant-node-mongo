require('dotenv').config(); // Load environment variables
require('./app/utils/config');
require('./app/utils/constants');
const { mongoConnect } = require('./app/db-conn/db-conn');
const routes = require('./app/routes/index');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define allowed origins from config
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// Set up CORS for the Express server
app.use((req, res, next) => {
 const origin = req.headers.origin || 'default';
 if (!req.headers.origin || allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
 }
 res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
 res.setHeader('Access-Control-Allow-Credentials', 'true');
 next();
});

// Set up routes
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

// Connect to the database
mongoConnect(() => {
 console.log('Database connected successfully.');

 app.get('/', (req, res) => {
  res.json({ message: 'Hello World', dbStatus: 'Connected' });
 });

 // Create server
 const appServer = http.createServer(app);

 // Socket.IO setup with CORS
 const io = new Server(appServer, {
  cors: {
   origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
     callback(null, true);
    } else {
     callback(new Error('Not allowed by CORS'));
    }
   },
   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type'],
  }
 });

 // A simple mapping to store user_id -> array of socketIds
 const userSocketMap = {};
 const resSocketMap = {};
 const adminSocketMap = {};

 io.on('connection', (socket) => {
  const { role_id = 0, res_id = '', user_id = '' } = socket.handshake.auth || {};
  if (role_id == 2 && res_id) {
   if (resSocketMap[res_id]) {
    resSocketMap[res_id].push(socket.id);
   } else {
    resSocketMap[res_id] = [socket.id];
   }
  } else if (role_id == 3 && user_id) {
   console.log(`User ${user_id} connected with socket id: ${socket.id}`);

   // Ensure we store multiple socket ids for a user (in case of multiple tabs)
   if (userSocketMap[user_id]) {
    userSocketMap[user_id].push(socket.id);
   } else {
    userSocketMap[user_id] = [socket.id];
   }
  } else if (role_id == 1 && user_id) {
   console.log(`Admin ${user_id} connected with socket id: ${socket.id}`);
   if (adminSocketMap[user_id]) {
    adminSocketMap[user_id].push(socket.id);
   } else {
    adminSocketMap[user_id] = [socket.id];
   }
  } else {
   console.log('Unknown role', role_id);
  }

  // Handle orderData event (broadcast to all clients)
  socket.on('orderData', (data) => {
   io.emit('orderData', JSON.stringify(data)); // Broadcast to all connected clients
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
   if (user_id && userSocketMap[user_id]) {
    // Remove the socket id from the user's list
    userSocketMap[user_id] = userSocketMap[user_id].filter((socketId) => socketId !== socket.id);
    if (userSocketMap[user_id].length === 0) {
     delete userSocketMap[user_id];
    }
    console.log(`User ${user_id} disconnected`);
   }
  });
 });

 // Function to send data to a particular user by their user_id
 function sendToUser(user_id, data) {
  const socketIds = userSocketMap[user_id];
  if (socketIds && socketIds.length > 0) {
   // Emit data to each socket ID associated with the user
   socketIds.forEach((socketId) => {
    io.to(socketId).emit('orderData', JSON.stringify(data));
   });
   console.log(`Sent data to user ${user_id}`);
  } else {
   console.log(`User ${user_id} is not connected`);
  }
 }

 // Start server
 appServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
 });
});

// Error handling middleware
app.use((err, req, res, next) => {
 console.error(err.stack);
 res.status(500).json({ error: 'Something went wrong!' });
});
