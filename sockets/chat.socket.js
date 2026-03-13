const redis = require("../config/redis");
const messageController = require('../controllers/message.controller');

function chatSocket(io, socket) {
    try {
        socket.on("message", async function (data) {
            data.senderId = socket.data.userId;
            const messageData = data;
            // if (!messageData || !messageData._id || !messageData.receiverId || messageData.receiverId === '') throw Error("Invalid data");
            const acknowledgementData = { messageId: messageData._id };
            try {
                const receiverSocketId = await redis.getCache().hGet("userSocketMap", messageData.receiverId);

                if (!io.sockets.sockets.has(receiverSocketId)) {
                    acknowledgementData.status = 'Sent';
                    messageData.status = 'Sent';
                } else {
                    io.to(receiverSocketId).emit('message', data);
                    acknowledgementData.status = 'Delivered';
                    messageData.status = 'Delivered';
                }

                // Save message to DB
                messageController.saveMessage(messageData);
                socket.emit("acknowledgement", acknowledgementData);
            } catch (error) {
                console.log("Error: ", error);
                socket.emit("bug", "Something went wrong!");
            }
        });

        socket.on("updateMessageStatus", async function (messageData) {
            try {
                // If Person A sends message and person b reads it, Person B will fire socket event with sender id as Person A (as Person A was sender of message)
                const messageSenderSocketId = await redis.getCache().hGet("userSocketMap", messageData.senderId);
                if (io.sockets.sockets.has(messageSenderSocketId)) io.to(messageSenderSocketId).emit('updateMessageStatus', messageData);
                
                // Update status to DB
                messageController.updateMessageStatus(messageData);
            } catch (error) {
                console.log("Error: ", error);
                socket.emit("bug", "Something went wrong!");
            }
        })
    } catch (error) {
        console.log("Error: ", error);
    }
}

module.exports = chatSocket;