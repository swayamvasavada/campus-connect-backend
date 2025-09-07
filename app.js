const express = require("express");
const app = express();

const initDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');

if (process.env.NODE_ENV !== "production") require('dotenv').config();

//Middlewares
app.use(express.json());

app.use("/api/auth", authRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({ hasError: true, message: "Internal Server Error" });
});


// Connect DB first, then start server
initDB().then(function () {
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
});