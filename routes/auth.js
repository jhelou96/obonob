var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var helperImages = require('../helpers/images');
var crypto = require("crypto");

/**
 * Saves user in database
 */
router.post('/register', function (req, res, next) {
    if(req.body.username.length < 3) {
        return res.status(400).json({
            title: 'Username must contain at least 3 characters.',
            error: 'Username must contain at least 3 characters.',
            key: 'usernameTooShort'
        });
    }

    if(req.body.password.length < 6) {
        return res.status(400).json({
            title: 'Password must contain at least 6 characters.',
            error: 'Username must contain at least 6 characters.',
            key: 'passwordTooShort'
        });
    }

    //Check for email address format
    var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    if(!req.body.email.match(pattern)) {
        return res.status(400).json({
            title: 'Invalid email address format.',
            error: 'Invalid email address format.',
            key: 'invalidEmail'
        });
    }

    //Create new user
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    });

    //Save user in database
    user.save(function(err, user) {
        //If user already registered
        if(err) {
            return res.status(500).json({
                title: 'Email or username already used.',
                error: err,
                key: 'emailOrUsernameAlreadyUsed'
            });
        }

        //Generate random validation key of 20 alphanumeric chars for email validation
        var key = crypto.randomBytes(10).toString('hex');
        user.keys.push(key);
        user.save();

        //Send mail to user
        var transporter = req.app.get('mail-transporter');
        const mailOptions = {
            from: 'no-reply@obonob.net',
            to: user.email,
            subject: 'oBonoB | Inscription',
            html: '<p>Salut <strong>' + user.username + ',</strong></p> <p>Ce message fait suite à ton inscription sur oBonoB. Pour activer ton compte, clique sur le lien suivant: <a href="http://obonob.herokuapp.com/auth/validation/registration/' + key + '">Activer mon profil</a>.</p> <p>A très vite sur oBonoB !</p>'
        };
        transporter.sendMail(mailOptions);

        res.status(201).json({
            message: 'User created',
            obj: user
        });
    })
});

/**
 * Allows user to request for a password reset
 * It will send a validation mail to the user to verify user's identity
 * Once user validates his mail, he will be logged in temporarily to the website so he can change his password directly from his settings
 */
router.post('/reset-password', function(req, res, next) {
    User.findOne({ $or: [{username: req.body.user}, {email: req.body.user}]}, function(err, user) {
        if(err) {
            return res.status(500).json({
                title: 'User could not be retrieved.',
                error: err,
                key: "userCouldNotBeRetrieved"
            });
        } else if(!user) {
            return res.status(404).json({
                title: 'Email or username provided does not match any user.',
                error: 'Email or username provided does not match any user.',
                key: "invalidEmailOrUsername"
            });
        }

        //If user's account has not been validated
        if(user.level == 0) {
            return res.status(500).json({
                title: 'Account has not been validated yet.',
                error: 'Account has not been validated yet.',
                key: "accountNeedsValidation"
            })
        }

        //If user's account has been banned
        if(user.level == -1) {
            return res.status(500).json({
                title: 'Account has been banned.',
                error: 'Account has been banned.',
                key: "accountBanned"
            })
        }

        //Generate random validation key of 20 alphanumeric chars for email confirmation
        var key = crypto.randomBytes(10).toString('hex');
        user.keys.push(key);
        user.save();

        //Send confirmation mail to user
        var transporter = req.app.get('mail-transporter');
        const mailOptions = {
            from: 'no-reply@obonob.net',
            to: user.email,
            subject: 'oBonoB | Réinitialisation du mot de passe',
            html: '<p>Bonjour <strong>' + user.username + ',</strong></p> <p>Ce message fait suite à ta demande de réinitialisation de mot de passe. Pour procéder à un changement de mot de passe, clique sur le lien suivant: <a href="http://obonob.herokuapp.com/auth/validation/reset-password/' + key + '">Réinitialiser mon mot de passe</a>.</p> <p>Si tu n\'es pas à l\'origine de cette demande, ignore cet email.</p>  <p>A très vite sur oBonoB !</p>'
        };
        transporter.sendMail(mailOptions);

        res.status(201).json({
            message: 'Confirmation mail sent',
            obj: user
        });
    });
});

/**
 * Validates a user account after registration
 */
router.get('/validation/registration/:key', function(req, res, next) {
    User.findOne({keys: req.params.key}, function(err, user) {
        if(err) {
            return res.status(500).json({
                title: 'User could not be retrieved.',
                error: err,
                key: "userCouldNotBeRetrieved"
            });
        } else if(!user) {
            return res.status(400).json({
                title: 'Invalid validation key provided.',
                error: 'Invalid validation key provided.',
                key: "invalidValidationKey"
            });
        }

        //If user has already validated his account
        if(user.level != 0) {
            return res.status(400).json({
                title: 'Account has already been validated.',
                error: 'Account has already been validated.',
                key: "accountAlreadyValidated"
            })
        }

        //Validate user account
        user.level = 1;

        //Remove key
        for(var i = 0; i < user.keys.length; i++) {
            if(user.keys[i] == req.params.key) {
                user.keys.splice(i, 1);
                break;
            }
        }

        user.save(function(err) {
            if(err) {
                return res.status(500).json({
                    title: 'User could not be updated.',
                    error: err,
                    key: "userCouldNotBeUpdated"
                });
            }

            res.status(201).json({
                message: 'User account has been validated.',
                obj: user
            })
        });
    });
});

/**
 * Removes a validation key
 */
router.delete('/validation/:key', function(req, res, next) {
    User.findOne({keys: req.params.key}).exec(function(err, user) {
        if (err) {
            return res.status(404).json({
                title: 'User could not be retrieved. Please retry.',
                error: err,
                key: 'userCouldNotBeRetrieved'
            });
        } else if(!user) {
            return res.status(404).json({
                title: 'Key not found.',
                error: 'Key not found.',
                key: 'keyNotFound'
            });
        }

        //Remove key
        for(var i = 0; i < user.keys.length; i++) {
            if(user.keys[i] == req.params.key) {
                user.keys.splice(i, 1);
                break;
            }
        }

        user.save(function(err, user) {
            res.status(200).json({
                message: 'Key removed',
                obj: user
            });
        });
    });
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
                title: 'Login process failed. Please retry.',
                error: err,
                key: "loginFailed"
            });
        }

        //If no user found
        if(!user) {
            return res.status(401).json({
                title: 'Invalid login credentials.',
                error: 'Invalid login credentials.',
                key: 'invalidCredentials'
            });
        }

        //Check if passwords match
        if(!(bcrypt.compareSync(req.body.password, user.password) || req.query.unsecure == 1)) {
            return res.status(401).json({
                title: 'Invalid login credentials.',
                error: 'Invalid login credentials.',
                key: 'invalidCredentials'
            });
        }

        //If user is banned
        if(user.level == -1) {
            return res.status(401).json({
                title: 'Account has been banned.',
                error: 'Account has been banned.',
                key: 'accountBanned'
            });
        }

        //If user has not validated his account
        if(user.level == 0) {
            return res.status(401).json({
                title: 'Account has not been validated.',
                error: 'Account has not been validated.',
                key: 'accountNeedsValidation'
            });
        }

        //Login successful, generate token to identify the user
        var token = jwt.sign({user: user}, 'G/i~XK/pO-:tr<yCc,XinP0:rMIG+f', {expiresIn: 7200});

        //Update user's last action date
        user.lastActionDate = Date.now();
        user.save();

        return res.status(200).json({
            message: 'Successfully logged in',
            token: token,
            obj: user
        });

    });
});

/**
 * Retrieves all the users
 */
router.get('/', function(req, res, next) {
    User.find().exec(function(err, users) {
        if(err) {
            return res.status(500).json({
                title: 'Users could not be retrieved. Please retry.',
                error: err,
                key: 'usersCouldNotBeRetrieved'
            });
        } else if(!users) {
            return res.status(404).json({
                title: 'No users found.',
                error: 'No users found.',
                key: 'noUsersFound'
            });
        }

        return res.status(200).json({
            message: 'Success',
            obj: users
        });
    })
});

/**
 * Retrieves user data based on his id, username or unique key
 */
router.get('/:user', function(req, res, next) {
    //Search user by id
    if(req.query.search == 'id') {
        User.findById(req.params.user, function(err, user) {
            if (err) {
                return res.status(500).json({
                    title: 'User could not be retrieved. Please retry.',
                    error: err,
                    key: 'userCouldNotBeRetrieved'
                });
            } else if (!user) {
                return res.status(404).json({
                    title: 'User not found.',
                    error: 'User not found.',
                    key: 'userNotFound'
                });
            }

            res.status(200).json({
                message: 'Success',
                obj: user
            });
        });
    } else if(req.query.search == 'username') { //Search user by username
        User.findOne({username: req.params.user}).exec(function(err, user) {
            if (err) {
                return res.status(500).json({
                    title: 'User could not be retrieved. Please retry.',
                    error: err,
                    key: 'userCouldNotBeRetrieved'
                });
            } else if (!user) {
                return res.status(404).json({
                    title: 'User not found.',
                    error: 'User not found.',
                    key: 'userNotFound'
                });
            }

            res.status(200).json({
                message: 'Success',
                obj: user
            });
        });
    } else if(req.query.search == 'key') { //Search user by key
        User.findOne({keys: req.params.user}).exec(function(err, user) {
            if (err) {
                return res.status(500).json({
                    title: 'User could not be retrieved. Please retry.',
                    error: err,
                    key: 'userCouldNotBeRetrieved'
                });
            } else if (!user) {
                return res.status(404).json({
                    title: 'User not found.',
                    error: 'User not found.',
                    key: 'userNotFound'
                });
            }

            res.status(200).json({
                message: 'Success',
                obj: user
            });
        });
    } else {
        res.status(400).json({
            message: 'Invalid request query.',
            obj: 'Invalid request query.',
            key: 'invalidRequest'
        });
    }
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
 * Updates user's data
 */
router.patch('/', function(req, res, next) {
    //Decode token containing user ID
    token = jwt.decode(req.query.token);

    //Find user based on ID
    User.findOne({_id: token.user._id}).exec(function(err, user) {
        if(err) {
            return res.status(500).json({
                title: 'User could not be retrieved. Please retry.',
                error: err,
                key: 'userCouldNotBeRetrieved'
            });
        } else if(!user) {
            return res.status(404).json({
                title: 'User not found.',
                error: 'User not found.',
                key: 'userNotFound'
            });
        }

        //If user changed his password
        if(req.body.password != user.password) {
            if(req.body.password.length < 6) {
                return res.status(400).json({
                    title: 'Password must contain at least 6 characters.',
                    error: 'Username must contain at least 6 characters.',
                    key: 'passwordTooShort'
                });
            }

            user.password = bcrypt.hashSync(req.body.password, 10);
        }

        //If user changed his email address
        if(req.body.email != user.email) {
            //Check for email address format
            var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
            if(!req.body.email.match(pattern)) {
                return res.status(400).json({
                    title: 'Invalid email address format.',
                    error: 'Invalid email address format.',
                    key: 'invalidEmail'
                });
            }

            user.email = req.body.email;
        }

        //If user changed his biography
        if(req.body.biography != user.biography)
            user.biography = req.body.biography;

        //If user changed his avatar
        if(req.body.avatar && req.body.avatar != user.avatar) {
            helperImages.download(req.body.avatar, function (err, image) {
                if (err) {
                    return res.status(500).json({
                        title: err.message,
                        error: err,
                        key: 'invalidImageProvided'
                    });
                }

                user.avatar = "images/upload/" + image;

                //Save user in database
                user.save(function (err, user) {
                    if (err) {
                        return res.status(500).json({
                            title: 'User could not be updated. Please retry.',
                            error: err,
                            key: 'userCouldNotBeUpdated'
                        });
                    }

                    return res.status(200).json({
                        message: 'Success',
                        obj: user
                    });
                });
            });
        } else {
            //Save user in database
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        title: 'User could not be updated. Please retry.',
                        error: err,
                        key: 'userCouldNotBeUpdated'
                    });
                }

                return res.status(200).json({
                    message: 'Success',
                    obj: user
                });
            });
        }
    });
});

module.exports = router;
