var express = require('express');
var router = express.Router();
var Thread = require('../models/thread');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var async = require('async');
var Notification = require('../models/notification');

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
                key: 'notAuthenticated'
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
 * Retrieves user messaging threads
 */
router.get('/', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Find user's discussion threads
    Thread.find().exec(function(err, threads) {
        if(err) {
            return res.status(500).json({
                title: 'Threads could not be retrieved. Please retry.',
                error: err,
                key: 'threadsCouldNotBeRetrieved'
            });
        } else if(!threads) {
            return res.status(404).json({
                title: 'No thread found.',
                error: 'No thread found.',
                key: 'threadsNotFound'
            });
        }

        /*
            Retrieve all the threads of the user
            Async is used here in order to perform each iteration sequentially in order to be able to format the threads retrieved
         */
        var userThreads = [];
        async.each(threads, function (thread, threadsCallback) {
            async.each(thread.participants, function (participant, participantsCallback) {
                //If user is included in the thread's list of participants
                if(participant.user == token.user._id) {
                    //Format and add thread to user's list of threads
                    formatThread(thread, function (err, formattedThread) {
                        if (err) {
                            return res.status(500).json({
                                title: 'Discussion threads could not be formatted. Please retry.',
                                error: err,
                                key: 'threadsCouldNotBeFormatted'
                            });
                        }
                        userThreads.push(formattedThread);

                        participantsCallback(); //Evaluate next thread participant
                    });
                } else {
                    participantsCallback(); //Evaluate next thread participant
                }
            }, function() {
                threadsCallback(); //Once all the participants of the thread have been evaluated --> Evaluate next thread
            });
        }, function () {
            //Sort threads based on last message date
            userThreads.sort(function(a, b) {
                return b.messages[0].date - a.messages[0].date;
            });

            //Return user's list of formatted threads
            return res.status(200).json({
                message: 'Success',
                obj: userThreads
            });
        });
    })
});

/**
 * Retrieves a specific thread
 */
router.get('/:id', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Find thread based on ID
    Thread.findOne({_id: req.params.id}).exec(function(err, thread) {
        if(err) {
            return res.status(500).json({
                title: 'Threads could not be retrieved. Please retry.',
                error: err,
                key: 'threadsCouldNotBeRetrieved'
            });
        } else if(!thread) {
            return res.status(404).json({
                title: 'Thread not found.',
                error: 'Thread not found.',
                key: 'threadNotFound'
            });
        }

        //Check if user is a participant
        var userIsParticipant = false;
        thread.participants.forEach(function(participant) {
            if(token.user._id == participant.user)
                userIsParticipant = true;
        });
        if(!userIsParticipant) {
            return res.status(403).json({
                title: 'Not enough rights to access this thread.',
                error: 'Not enough rights to access this thread.',
                key: 'accessDenied'
            });
        }

        formatThread(thread, function (err, thread) {
            if (err) {
                return res.status(500).json({
                    title: 'Discussion thread could not be formatted. Please retry.',
                    error: err,
                    key: 'threadCouldNotBeFormatted'
                });
            }

            return res.status(200).json({
                message: 'Success',
                obj: thread
            });
        });

    })
});

/**
 * Updates user's last seen status on thread
 */
router.patch('/:id/lastseen', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Find thread based on ID
    Thread.findOne({_id: req.params.id}).exec(function(err, thread) {
        if(err) {
            return res.status(500).json({
                title: 'Thread could not be retrieved. Please retry.',
                error: err,
                key: 'threadCouldNotBeRetrieved'
            });
        } else if(!thread) {
            return res.status(404).json({
                title: 'No thread found.',
                error: 'No thread found.',
                key: 'threadNotFound'
            });
        }

        //Check if user is a participant and update his last seen if he is
        var userIsParticipant = false;
        thread.participants.forEach(function(participant) {
            if(token.user._id == participant.user) {
                userIsParticipant = true;
                participant.lastSeen = new Date();
            }
        });

        //If user is not a participant
        if(!userIsParticipant) {
            return res.status(403).json({
                title: 'Not enough rights to access this thread.',
                error: 'Not enough rights to access this thread.',
                key: "accessDenied"
            });
        }

        //Save thread in database
        thread.save(function(err, thread) {
            if(err) {
                return res.status(500).json({
                    title: 'Thread could not be updated. Please retry.',
                    error: err,
                    key: 'threadCouldNotBeUpdated'
                })
            }

            formatThread(thread, function (err, thread) {
                if (err) {
                    return res.status(500).json({
                        title: 'Discussion thread could not be formatted. Please retry.',
                        error: err,
                        key: 'threadCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Success',
                    obj: thread
                });
            });
        });
    });
});

/**
 * Creates new discussion thread
 */
router.post('/', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Check if empty message
    if(!req.body.messages[0].content) {
        return res.status(400).json({
            title: 'Message cannot be empty.',
            error: 'Message cannot be empty.',
            key: 'messageCannotBeEmpty'
        });
    }

    //Retrieve recipient data
    User.findOne({'username': req.body.participants[0].username}).exec(function(err, recipient) {
        if(err) {
            return res.status(500).json({
                title: 'User could not be retrieved. Please retry.',
                error: err,
                key: 'userCouldNotBeRetrieved'
            });
        } else if(!recipient) {
            return res.status(404).json({
                title: 'User not found.',
                error: 'user not found.',
                key: 'userNotFound'
            });
        } else if(recipient._id == token.user._id) { //If user is trying to send a message to himself
            return res.status(400).json({
                title: 'Invalid message recipient.',
                error: 'Invalid message recipient.',
                key: 'invalidRecipient'
            });
        }

        var participants = [{user: token.user}, {user: recipient}];
        var messages = [{
            content: req.body.messages[0].content,
            author: token.user._id
        }];

        var thread = new Thread({
            subject: req.body.subject,
            author: token.user._id,
            participants: participants,
            messages: messages
        });

        //Save thread in database
        thread.save(function(err, thread) {
            if(err) {
                return res.status(500).json({
                    title: 'Discussion thread could not be created.',
                    error: err,
                    key: 'threadCouldNotBeCreated'
                })
            }

            //Create notification for recipient
            var notificationData = [thread._id, thread.subject]; //Save thread ID and subject
            var notification = new Notification({
                user: recipient,
                sender: token.user,
                type: 0,
                data: notificationData
            });
            notification.save();

            //Use recipient's socket if online to send notification in real time
            var io = req.app.get('socketio');
            var sockets = req.app.get('sockets');
            if(sockets[recipient._id]) {
                formatNotification(notification, function(err, notification) {
                    if (err) {
                        return res.status(500).json({
                            title: 'Notification could not be formatted.',
                            error: err,
                            key: 'notificationCouldNotBeFormatted'
                        });
                    }

                    io.to(sockets[recipient._id]).emit('notification', notification);
                });
            }

            //Format and return updated version of the thread
            formatThread(thread, function (err, thread) {
                if (err) {
                    return res.status(500).json({
                        title: 'Discussion thread could not be formatted. Please retry.',
                        error: err,
                        key: 'threadCouldNotBeFormatted'
                    });
                }

                return res.status(201).json({
                    message: 'Discussion tread created',
                    obj: thread
                });
            });
        });
    });
});

/**
 * Adds a new message to the thread
 */
router.post('/:id', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Check if message is empty
    if(!req.body.content) {
        return res.status(400).json({
            title: 'Message cannot be empty.',
            error: 'Message cannot be empty.',
            key: 'messageCannotBeEmpty'
        });
    }

    //Retrieve thread data
    Thread.findOne({_id: req.params.id}).exec(function(err, thread) {
        if(err) {
            return res.status(500).json({
                title: 'Thread could not be retrieved. Please retry.',
                error: err,
                key: 'threadCouldNotBeRetrieved'
            });
        } else if(!thread) {
            return res.status(404).json({
                title: 'Thread not found.',
                error: 'Thread not found.',
                key: 'threadNotFound'
            });
        }

        thread.messages.push({content: req.body.content, author: token.user});

        //Save thread in database
        thread.save(function(err, thread) {
            if(err) {
                return res.status(500).json({
                    title: 'Message could not be added. Please retry.',
                    error: err,
                    key: 'messageCouldNotBeAdded'
                })
            }

            //Send notification to each participant sequentially
            async.each(thread.participants, function (participant, callback) {
                //Ignore user who sent the message
                if(participant.user == token.user._id)
                    callback(); //Next participant
                else {
                    //Create notification for participant
                    var notificationData = [thread._id, thread.subject]; //Save thread ID and subject
                    var notification = new Notification({
                        user: participant.user,
                        sender: token.user,
                        type: 0,
                        data: notificationData
                    });
                    notification.save(function (err, notification) {
                        if (err) {
                            return res.status(500).json({
                                title: 'Notification could not be sent to recipient.',
                                error: err,
                                key: 'notificationCouldNotBeSentToRecipient'
                            })
                        }

                        //Use recipient's socket if online to send notification in real time
                        var io = req.app.get('socketio');
                        var sockets = req.app.get('sockets');
                        if(sockets[participant.user]) {
                            formatNotification(notification, function(err, notification) {
                                if (err) {
                                    return res.status(500).json({
                                        title: 'Notification could not be formatted.',
                                        error: err,
                                        key: 'notificationCouldNotBeFormatted'
                                    });
                                }
                                io.to(sockets[participant.user]).emit('notification', notification);

                                callback(); //Next participant
                            });
                        } else
                            callback(); //Next participant
                    });
                }
            }, function () {
                //Format and return updated version of the thread once all the notifications have been sent
                formatThread(thread, function (err, thread) {
                    if (err) {
                        return res.status(500).json({
                            title: 'Message could not be formatted. Please retry.',
                            error: err,
                            key: 'messageCouldNotBeFormatted'
                        });
                    }

                    return res.status(200).json({
                        message: 'Message added.',
                        obj: thread
                    });
                });
            });
        });
    })
});

/**
 * Adds a new participant to the thread
 */
router.post('/:id/participants', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve thread data
    Thread.findOne({_id: req.params.id}).exec(function(err, thread) {
        if(err) {
            return res.status(500).json({
                title: 'Thread could not be retrieved. Please retry.',
                error: err,
                key: 'threadCouldNotBeRetrieved'
            });
        } else if(!thread) {
            return res.status(404).json({
                title: 'Thread not found.',
                error: 'Thread not found.',
                key: 'threadNotFound'
            });
        }

        //Check if the user adding the new participant is the thread author
        if(token.user._id != thread.author) {
            return res.status(403).json({
                title: 'Not enough rights to update the thread.',
                error: 'Not enough rights to update the thread.',
                key: 'notEnoughRightsToUpdateThread'
            });
        }

        //Retrieve user's to be added data
        User.findOne({username: req.body.participant}).exec(function(err, user) {
            if(err) {
                return res.status(500).json({
                    title: 'User could not be retrieved. Please retry.',
                    error: err,
                    key: 'userCouldNotBeRetrieved'
                });
            } else if(!user) {
                return res.status(404).json({
                    title: 'User does not exist.',
                    error: 'User does not exist.',
                    key: 'userNotFound'
                });
            }

            //Check if user is already in the thread
            for(var i = 0; i < thread.participants.length; i++) {
                if(thread.participants[i].user.equals(user._id)) {
                    return res.status(400).json({
                        title: 'User is already in the thread.',
                        error: 'User is already in the thread.',
                        key: 'userAlreadyInThread'
                    });
                }
            }

            thread.participants.push({user: user});

            //Save thread in database
            thread.save(function(err, thread) {
                if(err) {
                    return res.status(500).json({
                        title: 'User could not be added. Please retry.',
                        error: err,
                        key: 'userCouldNotBeAdded'
                    })
                }

                //Create notification for added user
                var notificationData = [thread._id, thread.subject]; //Save thread ID and subject
                var notification = new Notification({
                    user: user,
                    sender: token.user,
                    type: 0,
                    data: notificationData
                });
                notification.save();

                //Use recipient's socket if online to send notification in real time
                var io = req.app.get('socketio');
                var sockets = req.app.get('sockets');
                if(sockets[user._id]) {
                    formatNotification(notification, function(err, notification) {
                        if (err) {
                            return res.status(500).json({
                                title: 'Notification could not be formatted.',
                                error: err,
                                key: 'notificationCouldNotBeFormatted'
                            });
                        }

                        io.to(sockets[user._id]).emit('notification', notification);
                    });
                }

                //Format and return updated version of the thread
                formatThread(thread, function (err, thread) {
                    if (err) {
                        return res.status(500).json({
                            title: 'Thread could not be formatted. Please retry.',
                            error: err,
                            key: 'threadCouldNotBeFormatted'
                        });
                    }

                    return res.status(200).json({
                        message: 'Message added.',
                        obj: thread
                    });
                });
            });
        });
    })
});

/**
 * Removes user from the thread
 * Deletes the thread if no more participants
 */
router.delete('/:idThread/participants', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve thread data
    Thread.findOne({_id: req.params.idThread}).exec(function(err, thread) {
        if(err) {
            return res.status(500).json({
                title: 'Threads could not be retrieved. Please retry.',
                error: err,
                key: 'threadsCouldNotBeRetrieved'
            });
        } else if(!thread) {
            return res.status(404).json({
                title: 'Thread not found.',
                error: 'Thread not found.',
                key: 'threadNotFound'
            });
        }

        //If thread has no more participants, delete it
        if(thread.participants.length == 1) {
            thread.remove(function(err) {
                if(err) {
                    return res.status(500).json({
                        title: 'Thread could not be removed. Please retry.',
                        error: err,
                        key: 'threadCouldNotBeRemoved'
                    });
                }

                return res.status(200).json({
                    message: 'Thread has been deleted.'
                });
            });
        } else { //Otherwise remove participant and update it
            //Check if the user is a participant of the thread and remove him if he is
            var isParticipant = false;
            for(var i = 0; i < thread.participants.length; i++) {
                if(thread.participants[i].user.equals(token.user._id)) {
                    thread.participants.splice(i, 1);
                    isParticipant = true;
                    break;
                }
            }
            if(!isParticipant) {
                return res.status(403).json({
                    title: 'Not enough rights to update thread.',
                    error: 'Not enough rights to update thread.',
                    key: 'notEnoughRightsToUpdateThread'
                });
            }

            //Save thread in database
            thread.save(function(err, thread) {
                if(err) {
                    return res.status(500).json({
                        title: 'Thread could not be updated. Please retry.',
                        error: err,
                        key: 'threadCouldNotBeUpdated'
                    })
                }

                //Format and return updated version of the thread
                formatThread(thread, function (err, thread) {
                    if (err) {
                        return res.status(500).json({
                            title: 'Thread could not be formatted. Please retry.',
                            error: err,
                            key: 'threadCouldNotBeFormatted'
                        });
                    }

                    return res.status(200).json({
                        message: 'Participant removed.',
                        obj: thread
                    });
                });
            });
        }
    })
});

/**
 * Formats the thread by sorting and populating the subdocuments
 * @param thread Thread to be formatted
 * @param Formatted thread
 */
function formatThread(thread, callback) {
    //Populate thread subdocuments with their respective data
    thread.populate([
        {
            path: 'participants.user',
            model: 'User'
        },
        {
            path: 'messages.author',
            model: 'User'
        },
        {
            path: 'author',
            model: 'User'
        }
    ], function (err, thread) {
        if (err)
            callback(err);

        //Document sorting
        //Sort thread messages by date
        thread.messages.sort(function (a, b) {
            return (b.date - a.date);
        });

        return callback(null, thread);
    });
}

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
