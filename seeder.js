// @desc    Using seeders that allows to push collection of data in json format to the db

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config({
    path: "./config/config.env"
});

// Loan models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

// Connect to the DB
mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser : true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Read the JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// Import into DB
const importData = async() => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);

        console.log('Data imported successfully'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

// Import into DB
const deleteData = async() => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log('Data deleted successfully'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

if(process.argv[2] === "-i"){
    importData();
} else if(process.argv[2] === "-d"){
    deleteData();
}