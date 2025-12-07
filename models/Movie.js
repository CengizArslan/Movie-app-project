const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    //movie name field with validation
    name: {
        type: String,
        required: [true, 'Movie name is required'],
        trim: true, //remove whitespace from both ends
        maxlength: [100, 'Movie name cannot exceed 100 characters']
    },
    
    //description field with validation
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    //release year field with validation
    year: {
        type: Number,
        required: [true, 'Release year is required'],
        min: [1888, 'Year must be 1888 or later'], //first film was 1888
        max: [new Date().getFullYear() + 5, 'Year cannot be in the distant future']
    },
    
    //genres array field with validation
    genres: {
        type: [String],
        required: [true, 'At least one genre is required'],
        validate: {
            validator: function(v) {
                //validate that array has 1-5 genres
                return v.length > 0 && v.length <= 5;
            },
            message: 'Must have 1-5 genres'
        }
    },
    
    //rating field with validation
    rating: {
        type: Number,
        required: true,
        min: [0, 'Rating must be between 0 and 10'],
        max: [10, 'Rating must be between 0 and 10'],
        default: 0
    },
    
    //reference to user who created the movie
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //reference to User model
        required: true
    },
    
    //timestamp for when movie was created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Movie', movieSchema);