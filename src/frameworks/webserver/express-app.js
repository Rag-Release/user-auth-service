const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const globalErrorMiddleware = require("../../interfaces/middlewares/globalError.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(globalErrorMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
