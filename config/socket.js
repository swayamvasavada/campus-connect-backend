const redis = require('./redis');

const socketAuth = require('../middleware/SocketAuthentication');
const chatSocket = require('../sockets/chat.socket');
const messageController = require('../controllers/message.controller');

async function socketAuthentication(socket, next) {
    const authHeader = socket.request.headers['authorization'];
    if (!authHeader) return;

    try {
        const userId = await socketAuth(authHeader);

        if (!userId) return;
        socket.data.userId = userId;
        await redis.getCache().hSet("userSocketMap", socket.data.userId, socket.id);
        // await redis.getCache().expire("userSocketMap", 30);
        next();
    } catch (error) {
        socket.emit("error", "Internal server error");
    }
}

function connectSocket(io) {
    io.use(socketAuthentication);
    io.on("connection", function (socket) {
        console.log("Socket connected: ", socket.id);
        messageController.sendPendingMessage(io, socket);
        chatSocket(io, socket);

        socket.on("disconnect", async function () {
            console.log("User disconnected: ", socket.id); 
            await redis.getCache().hDel("userSocketMap", socket.data.userId);
        });
    });

}

module.exports = connectSocket;