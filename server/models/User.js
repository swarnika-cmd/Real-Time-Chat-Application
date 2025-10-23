/* For a chat app, we typically need:

 User Model - Store user information (username, email, password)
 Message Model - Store chat messages
 Conversation/Room Model - Store chat rooms or conversations (optional, depends on your app)
*/

//----------------------------------------------------------------------------------------------------------------------------------

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    isOnline: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
