var express = require('express');
var router = express.Router();
var User = require('../models/auth/user');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

/**
 * Saves user in database
 */
router.post('/register', function (req, res, next) {
    //Create new user
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    });

    //Save user in database
    user.save(function(err, result) {
        //If user already registered
        if(err) {
            return res.status(500).json({
                title: 'An error occured',
                error: 'Username or email address already used'
            })
        }

        res.status(201).json({
            message: 'User created',
            obj: result
        })
    })
});

/**
 * Allows user to login
 */
router.post('/login', function(req, res, next) {
    //Find user according to username
    User.findOne({username: req.body.username}, function(err, user) {
        //If query generates an error
        if(err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            })
        }

        //If no user found
        if(!user) {
            return res.status(401).json({
                title: 'Login failed',
                error: 'Invalid login credentials'
            })
        }

        //Check if passwords match
        if(!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({
                title: 'Login failed',
                error: 'Invalid login credentials'
            })
        }

        //Login successful, generate token to identify the user
        var token = jwt.sign({user: user}, 'G/i~XK/pO-:tr<yCc,XinP0:rMIG+f', {expiresIn: 7200});
        res.status(200).json({
            message: 'Successfully logged in',
            token: token,
            userId: user._id
        })

    });
});

module.exports = router;
