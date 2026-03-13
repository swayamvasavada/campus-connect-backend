const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Sent", "Delivered", "Seen"],
            default: "Sent",
        }
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;