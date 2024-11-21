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

    // Socket.IO connection
    io.on('connection', (socket) => {
        console.log('New WebSocket client connected:', socket.id);

        socket.on('orderData', (data) => {
            io.emit('orderData', JSON.stringify(data));
        });

        socket.on('disconnect', () => {
            console.log('WebSocket client disconnected:', socket.id);
        });
    });

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
