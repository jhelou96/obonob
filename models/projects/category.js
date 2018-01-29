var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

/**
 * Project category model as stored in database
 */
var schema = new Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true}
});

schema.plugin(mongooseUniqueValidator); //Allows to throw error when unique attribute not satisfied

    module.exports = mongoose.model('ProjectCategory', schema);