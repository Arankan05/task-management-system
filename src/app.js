const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const projectNestedRoutes = require("./routes/projectRoutes");
const projectRoutes = require("./routes/taskRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const initsocketHandler = require("./socket/socketHandler");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    },
});

initsocketHandler(io);

//make io accessible in controllers
app.set("io", io);

//CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATHCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces/:workspaceId/projects", projectNestedRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/projects", projectRoutes);

//Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Test Route
app.get("/", (req, res) => { 
    res.send("TASKPULSE Backend Running"); 
});

//Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => { 
    console.log("Server running on port " + PORT); 
});
