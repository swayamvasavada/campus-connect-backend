const express = require("express");
const cors = require("cors");
const app = express();

const initDB = require('./config/db');
const checkAuth = require("./middleware/AuthMiddleware");

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const groupRoutes = require('./routes/group.routes');
const taskRoutes = require('./routes/task.routes');

if (process.env.NODE_ENV !== "production") require('dotenv').config();

//Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use("/api/auth", authRoutes);

// Auth middleware
app.use(checkAuth);

app.use("/api/user", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/task", taskRoutes);

// Default 404 handler
app.use(function (req, res) {
  res.status(404).json({ hasError: true, message: 'Content not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({ hasError: true, message: "Internal Server Error" });
});


// Connect DB first, then start server
initDB().then(function () {
  app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
});