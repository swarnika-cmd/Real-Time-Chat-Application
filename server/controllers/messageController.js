/*
After successfully completing the authentication part, the next step is to build the core chat functionality: managing messages and conversations

We will start with  the Rouiites and controllers for messaging 
*/

//----------------------------------------------------------------------------------------------------------------


const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User'); 

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    // 1. Get sender ID from the middleware (req.user) and data from the body
    const { receiverId, content, messageType } = req.body;
    const senderId = req.user._id;

    // 2. Basic validation
    if (!receiverId || !content) {
        res.status(400);
        throw new Error('Please include both receiverId and message content.');
    }

    // 3. Verify receiver exists or not 
    const receiver = await User.findById(receiverId);
    // 🐛 FIX 1: The condition was checking the variable 'receiverId' instead of the result 'receiver'
    if (!receiver) { 
        res.status(404);
        throw new Error('Receiver user not found');
    }

    // 4. Create and save the new message document 
    const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        // 🐛 FIX 2: Mongoose schema uses 'text' (lowercase) by default, using 'Text' might cause issues
        messageType: messageType || 'text' 
    });

    // 5. Populate sender/receiver data for the response
    // 🐛 FIX 3: Include '_id' in populate to ensure frontend socket logic has the ID for display/routing
    const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username avatar _id') 
        .populate('receiver', 'username avatar _id'); 

    if (populatedMessage) {
        res.status(201).json(populatedMessage)
    } else {
        res.status(500);
        throw new Error('Failed to save message.');
    }
});

// @desc    Get all messages between two users (conversation history)
// @route   GET /api/messages/:receiverId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const receiverId = req.params.receiverId; 

    // 1. Basic Validation
    if (!receiverId) {
        res.status(400);
        throw new Error('Receiver ID must be provided in the URL.');
    }

    // 2. Query the database
    const messages = await Message.find({
        $or: [
            { sender: userId, receiver: receiverId },
            { sender: receiverId, receiver: userId },
        ],
    })
    .sort({ createdAt: 1 }) 
    // 🐛 FIX 4: Include '_id' in populate for consistency
    .populate('sender', 'username avatar _id') 
    .populate('receiver', 'username avatar _id'); 

    // 3. Send the history back
    // 🐛 FIX 5: Send an empty array (200 OK) if no messages are found, rather than throwing a 404 error
    // Throwing an error for an empty history can unnecessarily crash the frontend's fetch logic.
    res.status(200).json(messages); 
});

module.exports = { sendMessage, getMessages };
