const taskRoutes = require("./routes/taskRoutes");
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { initSocket } = require("./config/socket");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);

// Swagger Docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Test Route
app.get("/", (req, res) => {
  res.send("Task Management Backend Running");
});

// Error handling middleware
app.use(errorMiddleware);

// Port
const PORT = process.env.PORT || 5000;

// Server
app.use("/api/tasks", taskRoutes);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});