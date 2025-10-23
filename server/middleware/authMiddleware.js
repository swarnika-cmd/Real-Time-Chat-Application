/*
Protecting Private Routes (Middleware)
Now that users can get a token, we need a way to use that token to verify their identity and allow them to access private information (like their own profile data, or in the future, chat history).

This is done using middleware, a function that runs before the main controller logic
*/

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Check if the Authorization header exists and starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Extract the token (e.g., "Bearer TOKEN_STRING" -> "TOKEN_STRING")
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify token using the JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find user by ID from the decoded payload, but exclude the password field
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Move to the next middleware or controller function
            next();
        } catch (error) {
            console.error(error);
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed');
        }
    }

    // If no token is found in the header
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };