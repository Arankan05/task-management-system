const initSocketHandler = require("../socket/socketHandler");
const { Server } = require("socket.io");

let io = null;

/**
 * Initialize Socket.IO server
 * @param {import("http").Server} server - The HTTP server instance wrapper
 * @returns {import("socket.io").Server} The initialized Socket.IO server instance
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

    console.log("Socket.IO server initialized successfully.");

    // Delegate authorization and socket events to socketHandler
    initSocketHandler(io);

    return io;
};

/**
 * Get active Socket.IO server instance
 * @returns {import("socket.io").Server}
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
