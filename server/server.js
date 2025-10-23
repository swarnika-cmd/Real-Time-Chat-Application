require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
// 1. Import the User Routes module
const userRoutes = require('./routes/userRoutes'); 

// Import the CORS package
const cors = require('cors');
const messageRoutes = require('./routes/messageRoutes'); // 👈 Import message routes

//2)a. Import http and socket.io
const http = require('http'); 
const { Server } = require('socket.io');


const app = express();
//2)b. Create the HTTP server using the Express app
const server = http.createServer(app);

//Add CORS middleware configuration
const frontendOrigin = 'http://localhost:5173'; // Your Vite frontend port!

app.use(cors({
    origin: frontendOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

///2)c.Create the Socket.io server (CORS is needed for the frontend)
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:5173', //This explicitly allows the frontend
        // we can replace with our frontend URL later
        methods: ['GET', 'POST'],
    },
});

// Connect to MongoDB
connectDB();

// Middleware to read JSON data
app.use(express.json());


// Sample route to test
app.get('/', (req, res) => {
    res.send('Chat App is running ! yay');
});

// 2. Define the base path for User Routes
// All routes in userRoutes will start with /api/users
app.use('/api/users', userRoutes); 

// Message Routes 
app.use('/api/messages', messageRoutes); // 👈 Use message routes


const port = 5000;
// 2)d. CHANGE: Use server.listen, not app.listen
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

//2)e. Add Socket.io Connection Logic
io.in('connection', (socket) =>{
    console.log('Socket.io : A user connected');

    ///Example 1: Join a chat room
    socket.io('join_chat', (roomId) =>{
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    ///Example 2: Handle incomming messages and broadcast it 
    socket.on('new_message', (data) =>{
        //Broadcast the message to all users in the room EXCEPT the sender
        socket.to(data.roomId).emit('message_received', data);
    });

    // NOTE: In a real app, you would save the message to MongoDB here first,
    // but since we have a REST API for sending, we just broadcast for now.

    socket.on('disconnect', () => {
        console.log('Socket.io: User disconnected');
    });
});