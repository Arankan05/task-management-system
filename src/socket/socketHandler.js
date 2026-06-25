const socketAuth = require("./socketAuth");
const { isWorkspaceMember, canAccessProject } = require("../services/accessService");
const prisma = require("../config/db");

const onlineUsers = new Map(); // socket.id -> { userId, name }

const initSocketHandler = (io) => {
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = socket.user?.id;
    let userName = "Teammate";

    try {
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        });
        userName = dbUser?.name || dbUser?.email || "Teammate";
        
        onlineUsers.set(socket.id, { userId, name: userName });
        
        // Broadcast unique user list to all connected clients
        io.emit("online-users", Array.from(new Set(Array.from(onlineUsers.values()).map(u => u.name))));
        
        // Auto-join user's private room
        socket.join(`user:${userId}`);
      }
    } catch (err) {
      console.error("Socket connection initialization error:", err);
    }

    console.log(`✅ Socket connected: ${socket.id} user: ${userId} (${userName})`);

    socket.on("join:user", (uId) => {
      if (uId !== userId) {
        socket.emit("error", { code: "FORBIDDEN", message: "Cannot join another user's room" });
        return;
      }
      socket.join(`user:${uId}`);
    });

    socket.on("join:workspace", async (workspaceId) => {
      const allowed = await isWorkspaceMember(userId, workspaceId);
      if (!allowed) {
        socket.emit("error", { code: "FORBIDDEN", message: "Not a member of this workspace" });
        return;
      }
      socket.join(`workspace:${workspaceId}`);
    });

    socket.on("join:project", async (projectId) => {
      const { allowed } = await canAccessProject(userId, projectId);
      if (!allowed) {
        socket.emit("error", { code: "FORBIDDEN", message: "Cannot access this project" });
        return;
      }
      socket.join(`project:${projectId}`);
    });

    socket.on("join:task", (taskId) => {
      socket.join(`task:${taskId}`);
    });

    // Handle user typing
    socket.on("typing", (username) => {
      socket.broadcast.emit("user-typing", username);
    });

    // Handle join-room legacy trigger (used by Dashboard.jsx fallback)
    socket.on("join-room", (roomName) => {
      socket.join(roomName);
    });

    socket.on("ping", () => {
      socket.emit("pong", { message: "Socket is working!" });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
      onlineUsers.delete(socket.id);
      io.emit("online-users", Array.from(new Set(Array.from(onlineUsers.values()).map(u => u.name))));
    });
  });

  io.engine.on("connection_error", (err) => {
    if (err.message === "UNAUTHORIZED") {
      console.log("Socket connection rejected: unauthorized");
    }
  });
};

module.exports = initSocketHandler;
