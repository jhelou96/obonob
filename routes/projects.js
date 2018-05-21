var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var jwt = require('jsonwebtoken');
var helperImages = require('../helpers/images');
var async = require('async');
var Notification = require('../models/notification');
var User = require('../models/user');

/**
 * Retrieves the list of projects
 */
router.get('/', function(req, res, next) {
    Project.find().exec(function(err, projects) {
        if (err) {
            return res.status(500).json({
                title: 'Projects could not be found. Please retry.',
                error: err,
                key: 'projectsCouldNotBeFound'
            });
        } else if(!projects) {
            return res.status(404).json({
                title: 'No projects found.',
                error: 'No projects found.',
                key: 'noProjectsFound'
            });
        }

        return res.status(200).json({
            message: 'Success',
            obj: projects
        });
    });
});

/**
 * Retrieves the list of projects of a user
 */
router.get('/users/:userId', function(req, res, next) {
    //Find user's projects
    Project.find({author: req.params.userId}).exec(function(err, projects) {
        if (err) {
            return res.status(500).json({
                title: 'Projects could not be found. Please retry.',
                error: err,
                key: 'projectsCouldNotBeFound'
            });
        } else if(!projects) {
            return res.status(404).json({
                title: 'No projects found.',
                error: 'No projects found.',
                key: 'noProjectsFound'
            });
        }

        return res.status(200).json({
            message: 'Success',
            obj: projects
        });
    });
});

/**
 * Retrieves user activity related to projects
 */
router.get('/users/:user/activity', function(req, res, next) {
    Project.find().exec(function(err, projects) {
        if(err) {
            return res.status(500).json({
                title: 'Projects could not be retrieved. Please retry.',
                error: err,
                key: 'projectsCouldNotBeRetrieved'
            });
        } else if(!projects) {
            return res.status(404).json({
                title: 'No projects found.',
                error: 'No projects found.',
                key: 'noProjectsFound'
            });
        }

        /*
            Array containing the list of posts, replies and reviews of the user
            Type: 0 (post), 1 (reply), 2 (review)
            Address: Project address
            Name: Project name
         */
        var activity = [];

        //Go through all projects synchronously
        async.each(projects, function(project, projectsCallback) {
            //Go through all posts
            async.each(project.posts, function(post, postsCallback) {
                if(post.author == req.params.user)
                    activity.push({type: 0, address: project.address, name: project.name, date: post.date});

                //Go through all post replies
                async.each(post.replies, function(reply, repliesCallback) {
                    if(reply.author == req.params.user)
                        activity.push({type: 1, address: project.address, name: project.name, date: reply.date});

                    repliesCallback(); //Next post reply
                });

                postsCallback(); //Next post
            });

            //Go through all reviews
            async.each(project.reviews, function(review, reviewsCallback) {
                if(review.author == req.params.user)
                    activity.push({type: 2, address: project.address, name: project.name, date: review.date});

                reviewsCallback(); //Next review
            });

            projectsCallback(); //Next project
        }, function () {
            //Sort elements by date
            activity.sort(function (a, b) {
                return (b.date - a.date);
            });

            return res.status(200).json({
                message: 'Success.',
                obj: activity
            });
        });
    });
});

/**
 * Retrieves user projects subscriptions
 */
router.get('/users/:user/subscriptions', function(req, res, next) {
    Project.find().exec(function(err, projects) {
        if(err) {
            return res.status(500).json({
                title: 'Projects could not be retrieved. Please retry.',
                error: err,
                key: 'projectsCouldNotBeRetrieved'
            });
        } else if(!projects) {
            return res.status(404).json({
                title: 'No projects found.',
                error: 'No projects found.',
                key: 'noProjectsFound'
            });
        }

        var subscriptions = [];

        //Go through all projects
        async.each(projects, function(project, projectsCallback) {
            //Go through all subscribers
            async.each(project.subscribers, function(subscriber, subscribersCallback) {
                if(subscriber.equals(req.params.user)) {
                    subscriptions.push(project);
                    return subscribersCallback(); //Break loop
                }

                subscribersCallback(); //Next subscriber
            });

            projectsCallback(); //Next project
        }, function () {
            return res.status(200).json({
                message: 'Success.',
                obj: subscriptions
            });
        });
    });
});

/**
 * Retrieves a specific project based on its address
 */
router.get('/:project', function(req, res, next) {
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if(err) {
            return res.status(500).json({
                title: 'Project could not be retrieved. Please retry.',
                error: err,
                key: 'projectCouldNotBeRetrieved'
            });
        } else if(!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: err,
                key: 'projectNotFound'
            });
        }

        //Format and return updated version of the project
        formatProject(project, function(err, project) {
            if(err) {
                return res.status(500).json({
                    title: 'Project could not be formatted. Please retry.',
                    error: err,
                    key: "projectCouldNotBeFormatted"
                });
            }

            return res.status(200).json({
                message: 'Project updated',
                obj: project
            });
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
            return res.status(401).json({
                title: 'Not authenticated.',
                error: err,
                key: "notAuthenticated"
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
    })
});

/**
 * Creates a new project
 */
router.post('/', function(req, res, next) {
    //Decode token containing user ID
    var token = jwt.decode(req.query.token);

    //Check if project address is a reserved keyword
    const reservedKeywords = ["my-projects", "users"];
    if(reservedKeywords.indexOf(req.body.address) > -1) {
        return res.status(400).json({
            title: 'Project address cannot be a reserved keyword.',
            error: 'Project address cannot be a reserved keyword.',
            key: "projectAddressReserved"
        });
    }

    //Check if project address contains unauthorized characters
    var regex = /^(?!-)(?!.*--)[a-z{3,}0-9-]+(?<!-)$/;
    if(!regex.test(req.body.address)) {
        return res.status(400).json({
            title: 'Project address format is invalid.',
            error: 'Project address format is invalid.',
            key: "invalidProjectAddress"
        });
    }

    //Check if project description is larger than 30 characters
    if(req.body.description.length > 30) {
        return res.status(400).json({
            title: 'Project description cannot be larger than 30 characters.',
            error: 'Project description cannot be larger than 30 characters.',
            key: "projectDescriptionCannotBeLargerThan30Chars"
        });
    }

    //Check if category is valid
    var categories = ['artCulture', 'bdComics', 'cinema', 'finance', 'food', 'humor', 'videoGames', 'media', 'music', 'photo', 'healthWellBeing', 'sciencesTechnologies', 'sports', 'services', 'others']
    if(categories.indexOf(req.body.category) == -1) {
        return res.status(400).json({
            title: 'Category specified is invalid.',
            error: 'Category specified is invalid.',
            key: "invalidCategory"
        });
    }

    //Create new project
    var project = new Project({
        author: token.user._id,
        name: req.body.name,
        address: req.body.address,
        description: req.body.description,
        category: req.body.category
    });

    //Save project in database
    project.save(function(err, project) {
        if(err) {
            return res.status(500).json({
                title: 'Project could not be saved.',
                error: err,
                key: 'projectWithSameAddressExists'
            });
        }

        return res.status(201).json({
            message: 'Project created',
            obj: project
        });
    });
});

/**
 * Updates project
 */
router.patch('/:project', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if(err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if(!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: err,
                key: 'projectNotFound'
            });
        }

        //Check if user is the project author
        if (project.author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused',
                key: "notEnoughPermissionsToUpdateProject"
            });
        }

        project.name = req.body.name;
        project.description = req.body.description;
        project.category = req.body.category;
        project.about = req.body.about;
        project.website = req.body.website;

        //Declare function for downloading banner with async
        updateBanner = function (callback) {
            //Check if banner has been updated
            if(req.body.banner != project.banner) {
                helperImages.download(req.body.banner, function (err, image) {
                    if (err) {
                        return res.status(500).json({
                            title: err.message,
                            error: err,
                            key: 'invalidImageProvided'
                        });
                    }

                    project.banner = "images/upload/" + image;
                    callback(); //Callback to execute next method with async
                });
            } else {
                callback(); //Callback to execute next method with async
            }
        };

        //Declare function for downloading thumbnail
        updateThumbnail = function (callback) {
            //Check if thumbnail has been updated
            if(req.body.thumbnail != project.thumbnail) {
                helperImages.download(req.body.thumbnail, function (err, image) {
                    if (err) {
                        return res.status(500).json({
                            title: err.message,
                            error: err,
                            key: 'invalidImageProvided'
                        });
                    }

                    project.thumbnail = "images/upload/" + image;
                    callback(); //Callback to execute next method with async
                });
            } else {
                callback(); //Callback to execute next method with async
            }
        };

        //Download thumbnail and banner in parallel and save project once finished
        async.parallel([updateThumbnail, updateBanner], function(err, results) {
            //Update project
            project.save(function (err, project) {
                if (err) {
                    return res.status(500).json({
                        title: 'Project could not be updated. Please retry.',
                        error: err,
                        key: "projectCouldNotBeUpdated"
                    });
                }

                //Format and return updated version of the project
                formatProject(project, function(err, project) {
                    if(err) {
                        return res.status(500).json({
                            title: 'Project could not be formatted. Please retry.',
                            error: err,
                            key: "projectCouldNotBeFormatted"
                        });
                    }

                    return res.status(200).json({
                        message: 'Project updated',
                        obj: project
                    });
                });
            });
        });
    });
});

/**
 * Deletes project
 */
router.delete('/:project', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if(err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if(!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if user is the project author
        if (project.author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to delete this project.',
                error: 'Access refused',
                key: 'notEnoughPermissionsToDeleteProject'
            });
        }

        //Search for all projects having the project to be removed as partner
        Project.find({'partners.project': project._id}).exec(function(err, projects) {
            if(err) {
                return res.status(500).json({
                    title: 'References to project could not be found. Please retry.',
                    error: err,
                    key: 'referencesToProjectNotFound'
                });
            }

            //Remove the project to be removed from all the partners lists in which it is included
            async.each(projects, function(projectPartner, callback) {
                projectPartner.partners = projectPartner.partners.filter(function(object) { return !object.project.equals(project._id); });
                projectPartner.save();

                callback(); //Next project
            }, function () {
                //Safely remove project
                Project.remove({address: project.address}).exec(function(err) {
                    if(err) {
                        return res.status(500).json({
                            title: 'Project could not be removed. Please retry.',
                            error: err,
                            key: 'projectCouldNotBeRemoved'
                        });
                    }

                    return res.status(200).json({
                        title: 'Project has been removed'
                    });
                });
            });
        });
    });
});

/**
 * Adds media to a project
 */
router.post('/:project/media', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if user that submitted the media is the author of the project
        if (project.author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToUpdateProject'
            });
        }

        //Download image
        helperImages.download(req.body.src, function(err, image) {
            if(err) {
                return res.status(500).json({
                    title: err.message,
                    error: err,
                    key: 'invalidImageProvided'
                });
            }

            //Update src with local address
            req.body.src = "images/upload/" + image;

            //Save media and update project
            project.media.push(req.body);
            project.save(function (err, project) {
                if (err) {
                    return res.status(500).json({
                        title: 'Project could not be updated. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeUpdated'
                    });
                }

                //Send notifications to subscribers
                async.each(project.subscribers, function (subscriber, callback) {
                    var notificationData = [project.address, project.name]; //Save project address and name
                    var notification = new Notification({
                        user: subscriber,
                        sender: token.user,
                        type: 1,
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
                        if(sockets[subscriber]) {
                            formatNotification(notification, function(err, notification) {
                                if (err) {
                                    return res.status(500).json({
                                        title: 'Notification could not be formatted.',
                                        error: err,
                                        key: 'notificationCouldNotBeFormatted'
                                    });
                                }
                                io.to(sockets[subscriber]).emit('notification', notification);

                                callback(); //Next subscriber
                            });
                        } else
                            callback(); //Next subscriber
                    });
                }, function () {
                    //Format and return updated version of the project once all the notifications have been sent
                    formatProject(project, function(err, project) {
                        if(err) {
                            return res.status(500).json({
                                title: 'Project could not be formatted. Please retry.',
                                error: err,
                                key: 'projectCouldNotBeFormatted'
                            });
                        }

                        return res.status(200).json({
                            message: 'Project updated',
                            obj: project
                        });
                    });
                });
            });
        });
    });
});

/**
 * Removes media from a project
 */
router.delete('/:project/media/:id', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if the user removing the media is the project author
        if (project.author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToUpdateProject'
            });
        }

        //Check if media exists
        if(project.media.id(req.params.id) == null) {
            return res.status(500).json({
                title: 'Media does not exist.',
                error: 'Media does not exist.',
                key: 'mediaDoesNotExist'
            });
        }

        //Remove media and update
        project.media.id(req.params.id).remove();
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Adds post to project
 */
router.post('/:project/posts', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);
    req.body.author = token.user._id;

    //Check if post content is empty
    if(!req.body.content) {
        return res.status(400).json({
            title: 'Post content cannot be empty.',
            error: 'Post content cannot be empty.',
            key: 'postContentCannotBeEmpty'
        });
    }

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if user that submitted the post is the author of the project
        if(project.author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToUpdateProject'
            });
        }

        /*
            Download images
            Images are downloaded in a synchronous manner one by one
            Once all images are downloaded and media addresses are updated, post is saved
         */
        media = req.body.media;
        async.forEachOf(media, function(result, i, callback) {
            helperImages.download(media[i].src, function(err, image) {
                if (err) {
                    return res.status(500).json({
                        title: err.message,
                        error: err,
                        key: 'invalidImageProvided'
                    });
                }

                media[i].src = "images/upload/" + image;

                callback();
            });
        }, function() { //Executed after images are downloaded
            project.posts.push(req.body);
            project.save(function (err, project) {
                if (err) {
                    return res.status(500).json({
                        title: 'Project could not be updated. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeUpdated'
                    })
                }

                //Send notifications to subscribers
                async.each(project.subscribers, function (subscriber, callback) {
                    var notificationData = [project.address, project.name]; //Save project address and name
                    var notification = new Notification({
                        user: subscriber,
                        sender: token.user,
                        type: 2,
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
                        if(sockets[subscriber]) {
                            formatNotification(notification, function(err, notification) {
                                if (err) {
                                    return res.status(500).json({
                                        title: 'Notification could not be formatted.',
                                        error: err,
                                        key: 'notificationCouldNotBeFormatted'
                                    });
                                }
                                io.to(sockets[subscriber]).emit('notification', notification);

                                callback(); //Next subscriber
                            });
                        } else
                            callback(); //Next subscriber
                    });
                }, function () {
                    //Format and return updated version of the project once all the notifications have been sent
                    formatProject(project, function(err, project) {
                        if(err) {
                            return res.status(500).json({
                                title: 'Project could not be formatted. Please retry.',
                                error: err,
                                key: 'projectCouldNotBeFormatted'
                            });
                        }

                        return res.status(200).json({
                            message: 'Project updated',
                            obj: project
                        });
                    });
                });
            });
        });
    });
});

/**
 * Removes project post
 */
router.delete('/:project/posts/:id', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if the user removing the post is the project author
        if (project.author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToUpdateProject'
            });
        }

        //Check if post exists
        if(project.posts.id(req.params.id) == null) {
            return res.status(500).json({
                title: 'Post does not exist.',
                error: 'Post does not exist.',
                key: 'postDoesNotExist'
            });
        }

        //Remove post and update project
        project.posts.id(req.params.id).remove();
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: "projectCouldNotBeUpdated"
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: "projectCouldNotBeFormatted"
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Adds reply to post
 */
router.post('/:project/posts/:id', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);
    req.body.author = token.user._id;

    //Check if post content is empty
    if(!req.body.content) {
        return res.status(400).json({
            title: 'Post reply content cannot be empty.',
            error: 'Post content cannot be empty.',
            key: 'postReplyContentCannotBeEmpty'
        });
    }

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Save reply to post and update project
        req.body.author = token.user._id;
        project.posts.id(req.params.id).replies.push(req.body);
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Removes project post reply
 */
router.delete('/:project/posts/:postId/replies/:replyId', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if post exists
        if (project.posts.id(req.params.postId) == null) {
            return res.status(500).json({
                title: 'Post does not exist.',
                error: 'Post does not exist.',
                key: 'postDoesNotExist'
            });
        }

        //Check if reply exists
        if (project.posts.id(req.params.postId).replies.id(req.params.replyId) == null) {
            return res.status(500).json({
                title: 'Post reply does not exist.',
                error: 'Post reply does not exist.',
                key: 'postReplyDoesNotExist'
            });
        }

        //Check if the user removing the reply is the reply author
        if (project.posts.id(req.params.postId).replies.id(req.params.replyId).author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to remove this reply.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToRemoveReply'
            });
        }

        //Remove review and update project
        project.posts.id(req.params.postId).replies.id(req.params.replyId).remove();
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Updates user like status on post
 */
router.patch('/:project/posts/:id/likes', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        /**
         * Check if user has already liked the post
         * If yes, remove the like
         * If no, add the like
         */
        if(project.posts.id(req.params.id).likes.filter(function(object) { return object.author == token.user._id; }).length > 0)
            project.posts.id(req.params.id).likes = project.posts.id(req.params.id).likes.filter(function(object) { return object.author != token.user._id; });
        else
            project.posts.id(req.params.id).likes.push({'author': token.user._id});

        //Update project
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Adds event
 */
router.post('/:project/events', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Check if date format is correct
    if(req.body.date == null) {
        return res.status(400).json({
            title: 'Invalid date format.',
            error: 'Invalid date format.',
            key: 'invalidDateFormat'
        });
    }

    //Check if date >= today's date
    var todayDate = new Date();
    var date = new Date(req.body.date);
    todayDate.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    if(date < todayDate) {
        return res.status(400).json({
            title: 'Invalid date provided.',
            error: 'Invalid date provided.',
            key: 'invalidDateProvided'
        });
    }

    //Check if event description is stated
    if(!req.body.description) {
        return res.status(400).json({
            title: 'Event description must be provided.',
            error: 'Event description must be provided.',
            key: 'eventDescriptionCannotBeEmpty'
        });
    }

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        }
        if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if user that submitted the event is the author of the project
        if(project.author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToUpdateProject'
            });
        }

        project.events.push(req.body);
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Send notifications to subscribers
            async.each(project.subscribers, function (subscriber, callback) {
                var notificationData = [project.address, project.name]; //Save project address and name
                var notification = new Notification({
                    user: subscriber,
                    sender: token.user,
                    type: 3,
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
                    if(sockets[subscriber]) {
                        formatNotification(notification, function(err, notification) {
                            if (err) {
                                return res.status(500).json({
                                    title: 'Notification could not be formatted.',
                                    error: err,
                                    key: 'notificationCouldNotBeFormatted'
                                });
                            }
                            io.to(sockets[subscriber]).emit('notification', notification);

                            callback(); //Next subscriber
                        });
                    } else
                        callback(); //Next subscriber
                });
            }, function () {
                //Format and return updated version of the project once all the notifications have been sent
                formatProject(project, function(err, project) {
                    if(err) {
                        return res.status(500).json({
                            title: 'Project could not be formatted. Please retry.',
                            error: err,
                            key: 'projectCouldNotBeFormatted'
                        });
                    }

                    return res.status(200).json({
                        message: 'Project updated',
                        obj: project
                    });
                });
            });
        });
    });
});

/**
 * Removes project event
 */
router.delete('/:project/events/:id', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if the user removing the event is the project author
        if (project.author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToUpdateProject'
            });
        }

        //Check if event exists
        if(project.events.id(req.params.id) == null) {
            return res.status(500).json({
                title: 'Event does not exist.',
                error: 'Event does not exist.',
                key: 'eventDoesNotExist'
            });
        }

        //Remove event and update project
        project.events.id(req.params.id).remove();
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Adds review
 */
router.post('/:project/reviews', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);
    req.body.author = token.user._id;

    //Check if review content is empty
    if(!req.body.content) {
        return res.status(400).json({
            title: 'Review content cannot be empty.',
            error: 'Review content cannot be empty.',
            key: 'reviewContentCannotBeEmpty'
        });
    }

    //Check if rating is valid
    if(!(Number.isInteger(req.body.rating) && req.body.rating >= 0 && req.body.rating <= 5)) {
        return res.status(400).json({
            title: 'Invalid review rating.',
            error: 'Invalid review rating..',
            key: 'invalidReviewRating'
        });
    }

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if user has already submitted a review for that project
        for(var i = 0; i < project.reviews.length; i++) {
            if(project.reviews[i].author == token.user._id) {
                return res.status(412).json({
                    title: 'User already submitted a review for that project.',
                    error: 'Review already submitted.',
                    key: 'reviewAlreadySubmitted'
                });
            }
        }

        project.reviews.push(req.body);
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Updates user like status on post review
 */
router.patch('/:project/reviews/:id/likes', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        /**
         * Check if user has already liked the review
         * If yes, remove the like
         * If no, add the like
         */
        if(project.reviews.id(req.params.id).likes.filter(function(object) { return object.author == token.user._id; }).length > 0)
            project.reviews.id(req.params.id).likes = project.reviews.id(req.params.id).likes.filter(function(object) { return object.author != token.user._id; });
        else
            project.reviews.id(req.params.id).likes.push({'author': token.user._id});

        //Update project
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Removes project review
 */
router.delete('/:project/reviews/:id', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Check if review exists
        if (project.reviews.id(req.params.id) == null) {
            return res.status(500).json({
                title: 'Review does not exist.',
                error: 'Review does not exist.',
                key: 'reviewDoesNotExist'
            });
        }

        //Check if the user removing the review is the review author
        if (project.reviews.id(req.params.id).author != token.user._id) {
            return res.status(401).json({
                title: 'Not enough permissions to remove this review.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToRemoveReview'
            });
        }

        //Remove review and update project
        project.reviews.id(req.params.id).remove();
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Adds partner page
 */
router.post('/:project/partners', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function (err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        } else if(project.author != token.user._id) { //Check if the user adding the page is the project author
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToUpdateProject'
            });
        } else if(project.address == req.body.address) { //Check if the 2 projects are the same
            return res.status(406).json({
                title: 'Address provided is invalid.',
                error: err,
                key: 'invalidAddressProvided'
            });
        }

        /*
            Populate project partners to be able to get the partners page address
            Address is used to verify if partner is already added to the list
         */
        project.populate([{
            path: 'partners.project',
            model: 'Project'
        }], function (err, project) {
            //Check if project is already added to partners list
            for(var i = 0; i < project.partners.length; i++) {
                if(project.partners[i].project.address == req.body.address) {
                    return res.status(500).json({
                        title: 'Project already added to user partners list.',
                        error: err,
                        key: 'projectAlreadyAddedToPartnersList'
                    });
                }
            }

            //Check if partner page exists
            Project.findOne({address: req.body.address}).exec(function (err, partner) {
                if (err) {
                    return res.status(500).json({
                        title: 'Project could not be found. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFound'
                    });
                } else if(!partner) {
                    return res.status(404).json({
                        title: 'Address provided is invalid',
                        error: err,
                        key: 'invalidAddressProvided'
                    });
                }

                //Update project
                project.partners.push({project: partner, index: project.partners.length});
                project.save(function (err, project) {
                    if (err) {
                        return res.status(500).json({
                            title: 'Project could not be updated. Please retry.',
                            error: err,
                            key: 'projectCouldNotBeUpdated'
                        })
                    }

                    //Format and return updated version of the project
                    formatProject(project, function (err, project) {
                        if (err) {
                            return res.status(500).json({
                                title: 'Project could not be formatted. Please retry.',
                                error: err,
                                key: 'projectCouldNotBeFormatted'
                            });
                        }

                        return res.status(200).json({
                            message: 'Project updated',
                            obj: project
                        });
                    });
                });
            });
        });
    });
});

/**
 * Removes partner page
 */
router.delete('/:project/partners/:id', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        } else if(project.author != token.user._id) { //Check if the user adding the page is the project author
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToUpdateProject'
            });
        }

        //Remove page from partners and update project
        project.partners.id(req.params.id).remove();
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Moves partner up or down in the partners list
 */
router.patch('/:project/partners/:id/:move', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        } else if(project.author != token.user._id) { //Check if the user adding the page is the project author
            return res.status(401).json({
                title: 'Not enough permissions to update this project.',
                error: 'Access refused.',
                key: 'notEnoughPermissionsToUpdateProject'
            });
        }

        //If request is to move partner page up
        if(req.params.move == 'up') {
            //If project is last in the list, it can't be moved up
            if(project.partners.id(req.params.id) == (project.partners.length-1)) {
                return res.status(417).json({
                    title: 'Partner page cannot be moved further up',
                    error: err,
                    key: 'partnerPageCannotBeMovedUp'
                });
            }

            //Move down partner page just above the page we are moving up
            for(var i = 0; i < project.partners.length; i++) {
                if(project.partners[i].index == (project.partners.id(req.params.id).index + 1)) {
                    project.partners[i].index = project.partners.id(req.params.id).index;
                    break;
                }
            }
            project.partners.id(req.params.id).index = project.partners.id(req.params.id).index + 1; //Move partner page up

        } else if(req.params.move == 'down') { //If request is to move partner page down
            //If project is first in the list, it can't be moved down
            if(project.partners.id(req.params.id) == 0) {
                return res.status(417).json({
                    title: 'Partner page cannot be moved further down',
                    error: err,
                    key: 'partnerPageCannotBeMovedDown'
                });
            }

            //Move up partner page just below the page we are moving down
            for(var i = 0; i < project.partners.length; i++) {
                if(project.partners[i].index == (project.partners.id(req.params.id).index - 1)) {
                    project.partners[i].index = project.partners.id(req.params.id).index;
                    break;
                }
            }
            project.partners.id(req.params.id).index = project.partners.id(req.params.id).index - 1; //Move partner page down
        }

        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Adds user as subscriber
 */
router.post('/:project/subscribers', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function (err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        } else if(project.author == token.user) {
            return res.status(403).json({
                title: 'User cannot subscribe to his own project.',
                error: 'User cannot subscribe to his own project.',
                key: 'cannotSubscribeToOwnProject'
            });
        }

        //Update project
        project.subscribers.push(token.user);
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function (err, project) {
                if (err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        error: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});

/**
 * Removes user from subscribers
 */
router.delete('/:project/subscribers', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Retrieve project data
    Project.findOne({address: req.params.project}).exec(function(err, project) {
        if (err) {
            return res.status(500).json({
                title: 'Project could not be found. Please retry.',
                error: err,
                key: 'projectCouldNotBeFound'
            });
        } else if (!project) {
            return res.status(404).json({
                title: 'Project not found.',
                error: 'Project not found.',
                key: 'projectNotFound'
            });
        }

        //Remove user from subscribers
        project.subscribers = project.subscribers.filter(user => !user.equals(token.user._id));
        project.save(function (err, project) {
            if (err) {
                return res.status(500).json({
                    title: 'Project could not be updated. Please retry.',
                    error: err,
                    key: 'projectCouldNotBeUpdated'
                })
            }

            //Format and return updated version of the project
            formatProject(project, function(err, project) {
                if(err) {
                    return res.status(500).json({
                        title: 'Project could not be formatted. Please retry.',
                        key: err,
                        key: 'projectCouldNotBeFormatted'
                    });
                }

                return res.status(200).json({
                    message: 'Project updated',
                    obj: project
                });
            });
        });
    });
});


/**
 * Formats a project by sorting and populating the subdocuments
 * @param project Project to be formatted
 * @returns Formatted project
 */
function formatProject(project, callback) {
    //Populate project subdocuments with their respective data
    project.populate([
        {
            path: 'author',
            model: 'User'
        },
        {
            path: 'reviews.author',
            model: 'User'
        },
        {
            path: 'posts.author',
            model: 'User'
        },
        {
            path: 'posts.replies.author',
            model: 'User'
        },
        {
            path: 'partners.project',
            model: 'Project'
        }
    ], function (err, project) {
        if (err)
            callback(err);

        //Document sorting
        //Sort reviews by date
        project.reviews.sort(function (a, b) {
            return (b.date - a.date);
        });
        //Sort posts by date
        project.posts.sort(function (a, b) {
            return (b.date - a.date);
        });
        //Sort posts replies by date
        project.posts.forEach(function (post) {
            post.replies.sort(function (a, b) {
                return (b.date - a.date);
            });
        });
        //Sort partners by index
        project.partners.sort(function (a, b) {
            return (b.index - a.index);
        });

        return callback(null, project);
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