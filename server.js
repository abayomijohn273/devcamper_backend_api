const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db')
// Routes files
const bootcamps = require('./routes/bootcamps');

// Load env variables
dotenv.config({
    path: "./config/config.env"
});

// Connect to database
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}! in ${process.env.NODE_ENV} mode`.yellow.bold);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error:${err.message}`.red)
    server.close(() => process.exit(1));
})