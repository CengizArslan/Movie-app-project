//middleware to check if user is authenticated
module.exports.isAuthenticated = (req, res, next) => {
    //check if user id exists in session
    if (req.session && req.session.userId) {
        return next(); //user is authenticated, proceed
    }
    
    //user is not authenticated, redirect to login
    req.flash('error', 'You need to log in first');
    res.redirect('/login');
};

//middleware to check if user owns the movie
module.exports.isMovieOwner = async (req, res, next) => {
    try {
        const Movie = require('../models/Movie');
        //find movie by id from request parameters
        const movie = await Movie.findById(req.params.id);
        
        //check if movie exists
        if (!movie) {
            req.flash('error', 'Movie not found');
            return res.redirect('/movies');
        }
        
        //check if current user is the movie creator
        //compare movie's createdBy with user id from session
        if (movie.createdBy.toString() !== req.session.userId) {
            req.flash('error', 'You can only edit or delete movies you created');
            return res.redirect(`/movies/${movie._id}`);
        }
        
        //attach movie to request object for use in next middleware/route
        req.movie = movie;
        next();
    } catch (error) {
        console.error(error);
        req.flash('error', 'Server error');
        res.redirect('/movies');
    }
};