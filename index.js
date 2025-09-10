require('dotenv').config()
const connectDB = require('./lib/db')
const express = require("express");
const cors = require('cors');

const authRoutes = require('./api/auth');
const dishRoutes = require('./api/dish')
const tableRoutes = require('./api/table')

connectDB();
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

app.use('/api/auth', authRoutes);
app.use('/api/dish', dishRoutes);
app.use('/api/tables', tableRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));