// server/server.js

const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const messageRoutes = require('./routes/messageRoutes'); 
// 1. Import http and socket.io
const http = require('http'); 
const { Server } = require('socket.io');

// 🐛 FIX 1: Import Error Handling Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); 


const app = express();
// 2. Create the HTTP server using the Express app
const server = http.createServer(app);

// 3. Add CORS middleware configuration for the REST API
const frontendOrigin = 'http://localhost:5173'; 

app.use(cors({
    origin: frontendOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// 4. Create the Socket.io server
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: frontendOrigin, // Using the variable for consistency
        methods: ['GET', 'POST'],
    },
});

// Connect to MongoDB
connectDB();

// Middleware to read JSON data (Must be before routes)
app.use(express.json());

// Sample route to test
app.get('/', (req, res) => {
    res.send('Chat App is running ! yay');
});

// Routes
app.use('/api/users', userRoutes); 
app.use('/api/messages', messageRoutes); 

// ------------------------------------------------------------
// 🐛 FIX 2: Implement Error Middleware
// These MUST be placed after all routes.
app.use(notFound); 
app.use(errorHandler);
// ------------------------------------------------------------


const port = 5000;
// 5. Use server.listen, not app.listen
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// 6. Add Socket.io Connection Logic
io.on('connection', (socket) =>{
    console.log('Socket.io: A user connected');

    ///Example 1: Join a chat room
    socket.on('join_chat', (roomId) =>{ 
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    ///Example 2: Handle incoming messages and broadcast it 
    socket.on('new_message', (data) =>{
        // Broadcast the message to all users in the room EXCEPT the sender
        // The data object should contain the roomId from the frontend (Chat.jsx)
        // The frontend sends the saved message data.
        socket.to(data.roomId).emit('message_received', data); 
    });

    socket.on('disconnect', () => {
        console.log('Socket.io: User disconnected');
    });
});