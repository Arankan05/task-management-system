const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const projectNestedRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const joinRequestRoutes = require("./routes/joinRequestRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const invitationRoutes = require("./routes/invitationRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const { initSocket } = require("./config/socket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

initsocketHandler(io);
app.set("io", io);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
// Initialize Socket.IO
const io = initSocket(server);

// Make io accessible in controllers
app.set("io", io);

// CORS Configuration
app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces/:workspaceId/projects", projectNestedRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/projects", taskRoutes);
app.use("/api/tasks", taskRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("TASKPULSE Backend Running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces/:workspaceId/projects", projectNestedRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invitations", invitationRoutes);

// Swagger Docs
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// Test Route
app.get("/", (req, res) => {
    res.send("TASKPULSE Backend Running");
});

// Error Middleware
app.use(errorMiddleware);

// Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
