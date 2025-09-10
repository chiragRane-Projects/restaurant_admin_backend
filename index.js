require('dotenv').config()
const connectDB = require('./lib/db')
const express = require("express");

const app = express();
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));