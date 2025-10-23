/*
Purpose: This file contains the business logic—the functions that handle the incoming requests, interact with the database (using the User model), and send back the response. It keeps the route files clean.
*/

//-----------------------------------------------------------------------------------------------------------------



const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // 4. to generate the tokens after successful login

// Adding a helper function to generate JWT
const generateToken = (id) => {
    // 🐛 FIX 1: Change 'JsonWebTokenError.sign' to 'jwt.sign'
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn : '30d' , //Token expires in 30 days
    });
}

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // Extract data from the request body
    const { username, email, password } = req.body;

    // --- Basic Validation ---
    if (!username || !email || !password) {
        res.status(400); // Bad Request
        throw new Error('Please enter all required fields: username, email, and password.');
    }

    // --- Check if user exists (Username/Email must be unique) ---
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
        res.status(400); // Bad Request
        throw new Error('User with this email or username already exists.');
    }

    // --- Hash Password ---
    const salt = await bcrypt.genSalt(10); // Generate salt (random data for hashing)
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- Create User in Database ---
    const user = await User.create({
        username,
        email,
        password: hashedPassword, // Store the HASHED password
        // avatar will use the default value defined in the User model
    });

    // --- Send Response ---
    if (user) {
        // Send back user data (excluding the password hash)
        res.status(201).json({ // 201 Created
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            // 💡 Optional: Generate a token on registration for immediate login
            // token: generateToken(user._id),
            message: 'User registered successfully',
        });
    } else {
        res.status(500); // Server Error
        throw new Error('Invalid user data received.');
    }
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Check for user email
    const user = await User.findOne({ email });

    // 2. Check if user exists AND if password matches
    if (user && (await bcrypt.compare(password, user.password))) {
        
        // 3. SUCCESS: Send token and user data
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id), // 👈 This generates the token
        });
    } else {
        // 4. FAILURE
        res.status(401); 
        throw new Error('Invalid email or password');
    }
});


// @desc    Get current user profile data
// @route   GET /api/users/profile
// @access  Private (Requires token)
const getMyProfile = asyncHandler(async (req, res) => {
    // req.user is set by the protect middleware. 
    // req.user has the Mongoose object. We use ._id, not .id (though Express often converts it)
    res.status(200).json({
        _id: req.user._id, // 💡 Correction: Use ._id for consistency with Mongoose
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
    });
});


module.exports = {
    registerUser,
    authUser,
    getMyProfile, 
};