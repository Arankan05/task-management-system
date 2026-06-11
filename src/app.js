const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (req, res) => { res.send("Task Management Backend Running"); });
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => { console.log("Server running on port " + PORT); });
