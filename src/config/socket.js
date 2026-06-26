const initSocketHandler = require("../socket/socketHandler");
const socketAuth = require("../socket/socketAuth");
const onlineUsers = new Set();
const { Server } = require("socket.io");

let io = null;

/**
 * Initialize Socket.IO server
 * @param {import("http").Server} server - The HTTP server instance wrapper
 * @returns {Server} The initialized Socket.IO server instance
 */
const initSocket = (server) => {
    if (io) {
        console.warn("Socket.IO is already initialized.");
        return io;
    }

    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use(socketAuth);

    console.log("Socket.IO server initialized successfully.");

    // Setup base event listeners
    io.on("connection", (socket) => {
        onlineUsers.add(socket.id);

        io.emit("online-users", Array.from(onlineUsers));

        console.log(
            `🟢 User connected: ${socket.user.id} (${socket.id})`
        )

        // Handle client disconnection
        socket.on("disconnect", () => {

            onlineUsers.delete(socket.id);

            io.emit("online-users", Array.from(onlineUsers));

            console.log("⚫ User disconnected:", socket.id);

        });

        socket.on("typing", (username) => {

            socket.broadcast.emit("user-typing", username);

        });

        socket.on("join-room", (roomName) => {

            socket.join(roomName);

            console.log(`${socket.id} joined ${roomName}`);

        });
    });

    return io;
};

/**
 * Get active Socket.IO server instance
 * @returns {Server}
 */
const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Please call initSocket first.");
    }
    return io;
};

module.exports = {
    initSocket,
    getIO
};


