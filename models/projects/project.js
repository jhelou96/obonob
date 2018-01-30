var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

/**
 * Project model as stored in database
 */
var schema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    name: {type: String, required: true},
    address: {type: String, required: true},
    description: {type: String, required: true},
    category: {type: String, required: true}
});

schema.plugin(mongooseUniqueValidator); //Allows to throw error when unique attribute not satisfied

module.exports = mongoose.model('Project', schema);