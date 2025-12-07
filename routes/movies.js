const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const User = require('../models/User');

//simplified auth middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error', 'You need to log in first');
    res.redirect('/login');
};

//middleware to check if user owns the movie
const isMovieOwner = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            req.flash('error', 'Movie not found');
            return res.redirect('/movies');
        }
        if (movie.createdBy.toString() !== req.session.userId) {
            req.flash('error', 'You can only edit or delete movies you created');
            return res.redirect(`/movies/${movie._id}`);
        }
        req.movie = movie;
        next();
    } catch (error) {
        console.error('Error checking movie ownership:', error);
        req.flash('error', 'Server error');
        res.redirect('/movies');
    }
};

//movie validation rules
const movieValidation = [
    body('name').trim().notEmpty().withMessage('Movie name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('description').trim().notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('year').isInt({ min: 1888, max: new Date().getFullYear() + 5 })
        .withMessage('Please enter a valid year'),
    body('genres').custom(value => {
        if (!value) {
            throw new Error('At least one genre is required');
        }
        return true;
    }),
    body('rating').isFloat({ min: 0, max: 10 })
        .withMessage('Rating must be between 0 and 10')
];

//home page - display all movies
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find().populate('createdBy', 'username').sort({ createdAt: -1 });
        res.render('index', { 
            title: 'Movie Collection',
            movies 
        });
    } catch (error) {
        console.error('Error loading movies:', error);
        req.flash('error', 'Error loading movies');
        res.render('index', { movies: [] });
    }
});

//add movie form (restricted to logged in users)
router.get('/movies/add', isAuthenticated, (req, res) => {
    res.render('movies/add', { 
        title: 'Add New Movie',
        movie: {},
        genres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
    });
});

//handle add movie submission
router.post('/movies/add', isAuthenticated, movieValidation, async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('movies/add', {
            title: 'Add New Movie',
            movie: req.body,
            errors: errors.array(),
            genres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
        });
    }
    
    try {
        const genres = Array.isArray(req.body.genres) ? req.body.genres : [req.body.genres];
        
        const movie = new Movie({
            name: req.body.name,
            description: req.body.description,
            year: parseInt(req.body.year),
            genres: genres,
            rating: parseFloat(req.body.rating),
            createdBy: req.session.userId
        });
        
        await movie.save();
        req.flash('success', 'Movie added successfully!');
        res.redirect('/');
    } catch (error) {
        console.error('Error saving movie:', error);
        req.flash('error', 'Error saving movie: ' + error.message);
        res.redirect('/movies/add');
    }
});

//show movie details
router.get('/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).populate('createdBy', 'username');
        if (!movie) {
            req.flash('error', 'Movie not found');
            return res.redirect('/');
        }
        res.render('movies/show', { 
            title: movie.name,
            movie 
        });
    } catch (error) {
        console.error('Error loading movie:', error);
        req.flash('error', 'Error loading movie');
        res.redirect('/');
    }
});

//edit movie form (restricted to owner)
router.get('/movies/:id/edit', isAuthenticated, isMovieOwner, (req, res) => {
    res.render('movies/edit', {
        title: 'Edit Movie',
        movie: req.movie,
        genres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
    });
});

//update movie (restricted to owner)
router.post('/movies/:id/edit', isAuthenticated, isMovieOwner, movieValidation, async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('movies/edit', {
            title: 'Edit Movie',
            movie: { ...req.movie.toObject(), ...req.body },
            errors: errors.array(),
            genres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
        });
    }
    
    try {
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            year: parseInt(req.body.year),
            genres: Array.isArray(req.body.genres) ? req.body.genres : [req.body.genres],
            rating: parseFloat(req.body.rating)
        };
        
        await Movie.findByIdAndUpdate(req.params.id, updateData);
        req.flash('success', 'Movie updated successfully!');
        res.redirect(`/movies/${req.params.id}`);
    } catch (error) {
        console.error('Error updating movie:', error);
        req.flash('error', 'Error updating movie');
        res.redirect(`/movies/${req.params.id}/edit`);
    }
});

//delete movie (restricted to owner)
router.delete('/movies/:id', isAuthenticated, isMovieOwner, async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        req.flash('success', 'Movie deleted successfully!');
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ success: false, error: 'Error deleting movie' });
    }
});

//registration form
router.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('auth/register', { 
        title: 'Register',
        user: {}
    });
});

//handle registration
router.post('/register', async (req, res) => {
    try {
        //check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email: req.body.email }, { username: req.body.username }] 
        });
        
        if (existingUser) {
            return res.render('auth/register', {
                title: 'Register',
                errors: [{ msg: 'Email or username already exists' }],
                user: req.body
            });
        }
        
        //check password match
        if (req.body.password !== req.body.confirmPassword) {
            return res.render('auth/register', {
                title: 'Register',
                errors: [{ msg: 'Passwords do not match' }],
                user: req.body
            });
        }
        
        //check password length
        if (req.body.password.length < 6) {
            return res.render('auth/register', {
                title: 'Register',
                errors: [{ msg: 'Password must be at least 6 characters' }],
                user: req.body
            });
        }
        
        //create user
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        
        await user.save();
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Error during registration');
        res.redirect('/register');
    }
});

//login form
router.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('auth/login', { 
        title: 'Login',
        user: {}
    });
});

//handle login
router.post('/login', async (req, res) => {
    try {
        //find user by email
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.render('auth/login', {
                title: 'Login',
                errors: [{ msg: 'Invalid email or password' }],
                user: req.body
            });
        }
        
        //compare password
        const isMatch = await user.comparePassword(req.body.password);
        
        if (!isMatch) {
            return res.render('auth/login', {
                title: 'Login',
                errors: [{ msg: 'Invalid email or password' }],
                user: req.body
            });
        }
        
        //set session
        req.session.userId = user._id;
        req.session.username = user.username;
        
        req.flash('success', 'Logged in successfully!');
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Error during login');
        res.redirect('/login');
    }
});

//logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            req.flash('error', 'Error logging out');
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

module.exports = router;