var express = require('express');
var router = express.Router();
var User = require('../models/auth/user');
var Project = require('../models/projects/project');
var Category = require('../models/projects/category');
var jwt = require('jsonwebtoken');

/**
 * Retrieves the list of categories
 */
router.get('/list-categories', function(req, res, next) {
    Category.find().exec(function(err, categories) {
        if(err) {
            return res.status(500).json({
                title: 'An error occured',
                error: 'err'
            });
        }

        res.status(200).json({
            title: 'Success',
            obj: categories
        });
    });
});

/**
 * Checks if user is logged in
 */
router.use('/', function(req, res, next) {
    //Checks if user token submitted with request is valid
    jwt.verify(req.query.token, 'G/i~XK/pO-:tr<yCc,XinP0:rMIG+f', function(err, decoded) {
        if(err) {
            return res.status.status(401).json({
                title: 'Not authenticated',
                error: err
            });
        }

        next();
    })
});

/**
 * Creates a new project
 */
router.post('/', function(req, res, next) {
    token = jwt.decode(req.query.token);
    User.findById(token.user._id, function(err, user) {
        //If user doesn't exist
        if(err) {
           return res.status.status(401).json({
               title: 'An error occured',
               error: err
           });
        }

        //Create new project
        var project = new Project({
            author: user,
            name: req.body.name,
            address: req.body.address,
            description: req.body.description,
            category: req.body.category
        });

        //Save project in database
        project.save(function(err, result) {
            //If user already registered
            if(err) {
                return res.status(500).json({
                    title: 'An error occured',
                    error: err
                })
            }

            res.status(201).json({
                message: 'Project created',
                obj: result
            })
        })
    });
});

module.exports = router;