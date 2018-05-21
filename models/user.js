var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

/**
 * User model as stored in database
 * Username: User's unique username
 * Password: User's password
 * Email: User's email
 * Avatar: User's avatar
 * Level: User's level (-1: Banned, 0: Email needs confirmation, 1: Member, 2: Moderator, 3: Admin)
 * RegistrationDate: User's registration date
 * LastActionDate: Date of the user's last query to the backend
 * keys: Validation keys for emails
 */
var schema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    avatar: {type: String, required: false},
    level: {type: Number, required: false, default: 0},
    biography: {type: String, required: false},
    registrationDate: {type: Date, required: false, default: Date.now},
    lastActionDate: {type: Date, required: false, default: Date.now},
    keys: [{type: String, required: false}]
}, { collation: { locale: 'en_US', strength: 2 } });

schema.plugin(mongooseUniqueValidator); //Allows to throw error when unique attribute not satisfied

module.exports = mongoose.model('User', schema);