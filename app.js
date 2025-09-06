const express = require("express");
const app = express();

if (process.env.NODE_ENV !== "production") require('dotenv').config();

app.listen(process.env.PORT, function() {
    console.log(`Server started on PORT: ${process.env.PORT}`);    
});