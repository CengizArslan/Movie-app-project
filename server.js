require('dotenv').config(); //load environment variables
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');

const app = express();

//database connection with error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_app')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

//middleware setup
app.use(express.urlencoded({ extended: true })); //parse form data
app.use(express.json()); //parse json data
app.use(express.static(path.join(__dirname, 'public'))); //serve static files

//session configuration with mongo store for persistence
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    resave: false, //don't save session if unmodified
    saveUninitialized: false, //don't create session until something stored
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_app',
        ttl: 24 * 60 * 60 //session ttl = 1 day in seconds
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, //cookie expiry = 1 day
        httpOnly: true, //prevent client-side js access
        secure: process.env.NODE_ENV === 'production' //use secure cookies in production
    }
}));

//flash messages for temporary user feedback
app.use(flash());

//make user and flash messages available to all templates
app.use((req, res, next) => {
    //attach current user to res.locals for template access
    res.locals.currentUser = req.session.userId ? { 
        _id: req.session.userId,
        username: req.session.username 
    } : null;
    
    //make flash messages available in templates
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//routes
app.use('/', require('./routes/movies'));

//simple error handling middleware for server errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <html>
        <head><title>Server Error</title></head>
        <body style="font-family: Arial; padding: 20px;">
            <h1>Server Error</h1>
            <p>Something went wrong! Please try again.</p>
            <a href="/">Go back to home page</a>
        </body>
        </html>
    `);
});

//simple 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).send(`
        <html>
        <head><title>Page Not Found</title></head>
        <body style="font-family: Arial; padding: 20px;">
            <h1>Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/">Go back to home page</a>
        </body>
        </html>
    `);
});

//start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});