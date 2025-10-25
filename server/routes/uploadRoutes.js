// server/routes/uploadRoutes.js (NEW FILE)

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// Configuration for file storage (using local disk for simplicity)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 🚨 IMPORTANT: You must create a folder named 'uploads' in your server directory
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Use user ID + timestamp to ensure unique filename
        cb(null, `${req.user._id}-${Date.now()}-${file.originalname}`);
    }
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    Upload an image and save it as a message
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        
        if (!req.file || !receiverId) {
            res.status(400).json({ message: 'File and receiver ID are required.' });
            return;
        }

        const newMessage = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content: content || '',
            messageType: 'image',
            // In a real app, you'd use a cloud URL here (e.g., S3 link)
            fileUrl: `/uploads/${req.file.filename}` 
        });

        // Populate and return the message for the frontend
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'username avatar avatarType _id')
            .populate('receiver', 'username avatar avatarType _id');
            
        res.status(201).json(populatedMessage);

    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ message: error.message || 'Image upload failed.' });
    }
});

module.exports = router;