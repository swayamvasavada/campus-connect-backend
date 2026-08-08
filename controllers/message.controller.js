const mongoose = require('mongoose');
const message = require('../models/Message');
const redis = require('../config/redis');

async function saveMessage(messageData) {

    try {
        if (!messageData || messageData.senderId == "" || messageData.receiverId == "") {
            throw new Error("Incomplete information");
        }
        console.log("Incoming message data: ", messageData);

        await message.insertOne(messageData);
        return;
    } catch (error) {
        throw error;
    }
}

async function sendPendingMessage(io, socket) {
    try {
        const pendingMessages = await message.find({ receiverId: socket.data.userId, status: 'Sent' });
        if (pendingMessages.length === 0) return;

        const messageIds = pendingMessages.map(msg => msg._id);
        await Promise.all(
            pendingMessages.map(async (msg) => {
                const messageData = {
                    _id: msg._id,
                    senderId: msg.senderId,
                    receiverId: msg.receiverId,
                    content: msg.content
                };

                socket.emit("message", messageData);

                const acknowledgementData = {
                    messageId: msg._id,
                    senderId: msg.senderId,
                    receiverId: msg.receiverId,
                    status: 'Delivered'
                };

                const senderSocketId = await redis.getCache().hGet("userSocketMap", msg.senderId.toString());

                if (senderSocketId != null)
                    io.to(senderSocketId).emit('acknowledgement', acknowledgementData);
            })
        );

        await message.updateMany({ _id: { $in: messageIds } }, { $set: { status: 'Delivered' } });
        return;
    } catch (error) {
        throw error;
    }
}

async function fetchRecentMessage(req, res, next) {
    try {
        const { userId, page = 1, limit = 20 } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const recentChats = await message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userObjectId },
                        { receiverId: userObjectId }
                    ]
                }
            },
            {
                $addFields: {
                    conversationId: {
                        $cond: [
                            { $gt: ["$senderId", "$receiverId"] },
                            { $concat: [{ $toString: "$receiverId" }, "_", { $toString: "$senderId" }] },
                            { $concat: [{ $toString: "$senderId" }, "_", { $toString: "$receiverId" }] }
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$conversationId",
                    latestMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiverId", userObjectId] },
                                        { $ne: ["$status", "Seen"] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    receiverId: {
                        $cond: [
                            { $eq: ["$latestMessage.senderId", userObjectId] },
                            "$latestMessage.receiverId",
                            "$latestMessage.senderId"
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "receiver"
                }
            },
            {
                $project: {
                    _id: 0,
                    latestMessage: 1,
                    unreadCount: 1,
                    userDetails: { $arrayElemAt: ["$receiver", 0] }
                }
            },
            { $sort: { "latestMessage.createdAt": -1 } },
            { $skip: (pageNumber - 1) * limitNumber },
            { $limit: limitNumber }
        ]);

        return res.json({
            hasError: false,
            recentChats
        });
    } catch (error) {
        next(error);
    }
}

async function fetchMessages(req, res, next) {
    const userId = res.locals.userId;
    const secondaryUser = req.query.userId;

    if (!userId || !secondaryUser) return res.status(400).json({
        hasError: true,
        message: 'Incomplete user information'
    });

    try {
        console.log("User id: ", userId, " Secondary user: ", secondaryUser);

        const messages = await message.find({ $or: [{ senderId: userId, receiverId: secondaryUser }, { senderId: secondaryUser, receiverId: userId }] }).sort({ createdAt: 1 })
        if (!messages) return res.json({
            hasError: true,
            message: 'Failed fetching messages'
        });

        return res.json({
            hasError: false,
            messages
        });
    } catch (error) {
        next(error);
    }
}

async function markMessageSeen(messageData) {
    try {
        console.log("Entering into Message controller => markMessageSeen...");
        await message.updateMany({
            senderId: new mongoose.Types.ObjectId(messageData.senderId),
            receiverId: new mongoose.Types.ObjectId(messageData.receiverId), status: { $ne: 'Seen' }
        }, { $set: { status: 'Seen' } });
        console.log("Exiting into Message controller => markMessageSeen...");
    } catch (error) {
        console.log("Error: ", error);
    }
}

module.exports = { saveMessage, sendPendingMessage, fetchRecentMessage, fetchMessages, markMessageSeen };