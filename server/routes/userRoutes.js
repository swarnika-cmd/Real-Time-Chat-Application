/* 
Purpose: This file defines the endpoints (the URLs) and maps them to the correct function in the controller.
*/

// ----------------------------------------------------------------------------------------------------------------------

// server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, authUser, getMyProfile } = require('../controllers/userController'); // 👈 Add getMyProfile
const { protect } = require('../middleware/authMiddleware'); // 👈 Import middleware

// Public Routes (Registration and Login don't need a token)
router.post('/register', registerUser);
router.post('/login', authUser);

// Private Route (Requires a valid token)
// 💡 The 'protect' middleware runs before 'getMyProfile'
router.get('/profile', protect, getMyProfile); 

module.exports = router;