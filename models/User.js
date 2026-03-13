const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    groups: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group" // reference to Club/Project entity
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false
    },
    isActivated: {
        type: Boolean,
        default: false
    },
    profilePic: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    previousLogin: { // This is for user
        type: Date
    },
    lastLogin: { // This is for logic of previousLogin
        type: Date
    },
    lastVerificationRequestTime: {
        type: Date
    },
    verificationRequestCount: {
        type: Number,
        default: 0
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;