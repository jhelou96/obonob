var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var jwt = require('jsonwebtoken');

/**
 * Generates access point to the application
 */
router.get('/', function (req, res, next) {
    res.render('index');
});

/**
 * Maps a socket ID to a user ID
 * Executed on user login and on each page refresh
 */
router.post('/socket', function(req, res, next) {
    //Checks if user token submitted with request is valid
    jwt.verify(req.query.token, 'G/i~XK/pO-:tr<yCc,XinP0:rMIG+f', function(err, decoded) {
        if(!err && decoded) {
            //Map server socket to user ID
            if (req.query.socketId) {
                var sockets = req.app.get('sockets'); //Hashmap containing the list of sockets
                sockets[decoded.user._id] = req.query.socketId;
                req.app.set('sockets', sockets);
            }
        }
    });

    return res.status(200).json({
        message: 'Socket mapped.'
    });
});

/**
 * Removes a user from the hashmap
 * Executed on user logout
 */
router.delete('/socket', function(req, res, next) {
    //Checks if user token submitted with request is valid
    jwt.verify(req.query.token, 'G/i~XK/pO-:tr<yCc,XinP0:rMIG+f', function(err, decoded) {
        if(!err && decoded) {
            var sockets = req.app.get('sockets'); //Hashmap containing the list of sockets
            delete sockets[decoded.user._id];
        }
    });

    return res.status(200).json({
        message: 'Socket unmapped.'
    });
});

module.exports = router;
