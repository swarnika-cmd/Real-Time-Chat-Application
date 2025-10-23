/*
After successfully completing the authentication part, the next step is to build the core chat functionality: managing messages and conversations

We will start with  the Rouiites and controllers for messaging 
*/

//----------------------------------------------------------------------------------------------------------------


const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const User = require('../models/User'); // Needed to confirm user existence

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    //1. Get sender ID from the middleware (req.user) and data from the body
    const{ receiverId, content, messageType} = req.body;
    const senderId = req.user._id;

    ///2. Basic validation
    if(!receiverId || !content){
        res.status(400);
        throw new Error('Please include both receiverId and message content.')
    }

    //3. Verify receiver exists or not 
    const receiver = await User.findById(receiverId);
    if(!receiverId){
        res.status(404);
        throw new Error('Receiver user not found');
    }

    //4. Create and save the new message document 
    const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        messageType: messageType || 'Text'
    });

    //5. Populate sender/receiver data for  the response
    // we populate the fields to return the full user objects instead of just IDs
    const populatedMessage = await Message.findById(newMessage._id).
    populate('sender', 'username avatar'). //  only include username and avatar from sender
    populate('receiver', 'username avatar'); //Only include username and avatar from the receiver

    if(populatedMessage){
        res.status(201).json(populatedMessage)
    }else{
        res.status(500);
        throw new Error('Failed to save message.');
    }

});

// @desc    Get all messages between two users (conversation history)
// @route   GET /api/messages/:receiverId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const receiverId = req.params.receiverId; // Get the ID from the URL parameter

    // 1. Basic Validation
    if (!receiverId) {
        res.status(400);
        throw new Error('Receiver ID must be provided in the URL.');
    }

    // 2. Query the database
    // Find messages where:
    // (sender = userId AND receiver = receiverId) 
    // OR 
    // (sender = receiverId AND receiver = userId)
    const messages = await Message.find({
        $or: [
            { sender: userId, receiver: receiverId },
            { sender: receiverId, receiver: userId },
        ],
    })
    .sort({ createdAt: 1 }) // Sort by creation date (oldest first)
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar');

    // 3. Send the history back
    if (messages) {
        res.status(200).json(messages);
    } else {
        res.status(404);
        throw new Error('No messages found for this conversation.');
    }
});

module.exports = { sendMessage, getMessages };
