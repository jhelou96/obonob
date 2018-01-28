var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

/**
 * User model as stored in database
 */
var schema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true}
});

schema.plugin(mongooseUniqueValidator); //Allows to throw error when unique attribute not satisfied

module.exports = mongoose.model('User', schema);