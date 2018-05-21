var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * User model as stored in database
 */
var schema = new Schema({
    subject: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    participants: [{
        user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
        lastSeen: {type: Date, required: false, default: new Date(0)}
    }],
    messages: [{
        content: {type: String, required: true},
        author: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
        date: {type: Date, required: false, default: Date.now}
    }]
});

module.exports = mongoose.model('Thread', schema);