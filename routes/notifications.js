var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Notification = require('../models/notification');
var async = require('async');
var User = require('../models/user');

/**
 * Checks if user is logged in
 */
router.use('/', function(req, res, next) {
    //Checks if user token submitted with request is valid
    jwt.verify(req.query.token, 'G/i~XK/pO-:tr<yCc,XinP0:rMIG+f', function(err, decoded) {
        if(err) {
            return res.status(401).json({
                title: 'Not authenticated.',
                error: err,
                code: 'notAuthenticated'
            });
        }

        //Update user's last action date
        User.findOne({_id: decoded.user._id}, function(err, user) {
            if(err) {
                return res.status(401).json({
                    title: 'Not authenticated.',
                    error: err,
                    key: 'notAuthenticated'
                });
            }

            user.lastActionDate = Date.now();
            user.save();
        });

        next();
    });
});

/**
 * Marks a notification as read
 * Body contains notifications type and data which may represent a thread ID or a project address for example
 */
router.patch('/', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Check for notifications and mark them as read
    Notification.find({user: token.user, type: {$in: req.body.type}, data: req.body.data}).exec(function(err, notifications) {
        if(err) {
            return res.status(500).json({
                title: 'Notifications could not be updated. Please retry.',
                error: err,
                code: 'notificationsCouldNotBeUpdated'
            });
        } else if(!notifications) {
            return res.status(404).json({
                title: 'Notifications not found.',
                error: 'Notifications not found.',
                code: 'notificationsNotFound'
            });
        }

        //Mark all matching notifications as read
        async.each(notifications, function (notification, callback) {
            notification.isRead = true;
            notification.save(function() {
                callback(); //Next notification
            });
        }, function () {
            return res.status(200).json({
                message: 'Notifications marked as read.'
            });
        });
    });
});

/**
 * Retrieves user's notifications
 */
router.get('/:status', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Check notifications status
    if(req.params.status == 'unread')
        var conditions = {user: token.user, isRead: false};
    else if(req.params.status == 'read')
        var conditions = {user: token.user, isRead: true};
    else if(req.params.status == 'all')
        var conditions = {user: token.user};

    //Find user's notifications
    Notification.find(conditions).exec(function(err, notifications) {
        if(err) {
            return res.status(500).json({
                title: 'Notifications could not be retrieved. Please retry.',
                error: err,
                code: 'notificationsCouldNotBeRetrieved'
            });
        } else if(!notifications) {
            return res.status(404).json({
                title: 'Notifications not found.',
                error: 'Notifications not found.',
                code: 'notificationsNotFound'
            });
        }

        /*
            Retrieve all the user's notifications
            Async is used here in order to perform each iteration sequentially so we can format the notifications retrieved
         */
        var userNotifications = [];
        async.each(notifications, function (notification, callback) {
            formatNotification(notification, function(err, notification) {
                if (err) {
                    return res.status(500).json({
                        title: 'Notifications could not be retrieved. Please retry.',
                        error: err,
                        code: 'notificationsCouldNotBeRetrieved'
                    });
                }

                userNotifications.push(notification);

                callback(); //Evaluate next notification
            });
        }, function () {
            //Sort notifications based on date
            userNotifications.sort(function(a, b) {
                return b.date - a.date;
            });

            //Return user's list of formatted notifications
            return res.status(200).json({
                message: 'Success',
                obj: userNotifications
            });
        });
    })
});


/**
 * Formats the notification by sorting and populating the subdocuments
 * @param notification Notification to be formatted
 * @param Formatted notification
 */
function formatNotification(notification, callback) {
    //Populate notification subdocuments with their respective data
    notification.populate([
        {
            path: 'user',
            model: 'User'
        },
        {
            path: 'sender',
            model: 'User'
        }
    ], function (err, thread) {
        if (err)
            callback(err);

        return callback(null, thread);
    });
}

module.exports = router;
