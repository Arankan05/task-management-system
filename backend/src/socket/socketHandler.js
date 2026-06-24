const socketAuth = require("./socketAuth");
const { isWorkspaceMember, canAccessProject } = require("../services/accessService");

const initSocketHandler = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id, "user:", socket.user?.id);

    socket.on("join:user", (userId) => {
      if (userId !== socket.user.id) {
        socket.emit("error", { code: "FORBIDDEN", message: "Cannot join another user's room" });
        return;
      }
      socket.join(`user:${userId}`);
    });

    socket.on("join:workspace", async (workspaceId) => {
      const allowed = await isWorkspaceMember(socket.user.id, workspaceId);
      if (!allowed) {
        socket.emit("error", { code: "FORBIDDEN", message: "Not a member of this workspace" });
        return;
      }
      socket.join(`workspace:${workspaceId}`);
    });

    socket.on("join:project", async (projectId) => {
      const { allowed } = await canAccessProject(socket.user.id, projectId);
      if (!allowed) {
        socket.emit("error", { code: "FORBIDDEN", message: "Cannot access this project" });
        return;
      }
      socket.join(`project:${projectId}`);
    });

    socket.on("join:task", (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on("ping", () => {
      socket.emit("pong", { message: "Socket is working!" });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  io.engine.on("connection_error", (err) => {
    if (err.message === "UNAUTHORIZED") {
      console.log("Socket connection rejected: unauthorized");
    }
  });
};

module.exports = initSocketHandler;
