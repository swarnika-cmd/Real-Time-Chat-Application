// server/server.js (Updated for Render Deployment)

const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const messageRoutes = require('./routes/messageRoutes'); 
const http = require('http'); 
const { Server } = require('socket.io');

const { notFound, errorHandler } = require('./middleware/errorMiddleware'); 

const app = express();
const server = http.createServer(app);

// 🚨 DEPLOYMENT CHANGE: Use environment variable for CLIENT_ORIGIN
// If process.env.CLIENT_ORIGIN exists (on Render), use it; otherwise, use localhost for local dev.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'; 

// 3. Add CORS middleware configuration for the REST API
app.use(cors({
    // Use the dynamic CLIENT_ORIGIN variable
    origin: CLIENT_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// 4. Create the Socket.io server
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        // Use the dynamic CLIENT_ORIGIN variable for Socket.io
        origin: CLIENT_ORIGIN, 
        methods: ['GET', 'POST'],
    },
});

// Connect to MongoDB
connectDB();

// Middleware to read JSON data
app.use(express.json());

// Sample route to test
app.get('/', (req, res) => {
    res.send('PINSTAGRAM API is running! 🚀');
});

// Routes
app.use('/api/users', userRoutes); 
app.use('/api/messages', messageRoutes); 

// ------------------------------------------------------------
// Implement Error Middleware (Must be after all routes)
app.use(notFound); 
app.use(errorHandler);
// ------------------------------------------------------------


const port = process.env.PORT || 5000; // 🚨 DEPLOYMENT CHANGE: Use Render's PORT variable
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`CORS/Socket.io allowed origin: ${CLIENT_ORIGIN}`);
});

// 6. Add Socket.io Connection Logic
io.on('connection', (socket) =>{
    console.log('Socket.io: A user connected');

    socket.on('join_chat', (roomId) =>{ 
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('new_message', (data) =>{
        // Broadcast the message to all users in the room EXCEPT the sender
        socket.to(data.roomId).emit('message_received', data); 
    });

    socket.on('disconnect', () => {
        console.log('Socket.io: User disconnected');
    });
});