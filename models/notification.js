var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Notification model as stored in database
 * User: User to which notification is sent
 * Sender: User sending notification
 * Type: Type of notification (0 --> New private message, 1 --> New project media, 2 --> New project post, 3 --> New project event)
 * Data: Contains data about the notification
 * Date: Date at which notification was sent
 * isRead: Determines if user saw notification
 */
var schema = new Schema({
    user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    sender: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    type: {type: Number, required: true},
    data: [{type: String, required: true}],
    date: {type: Date, required: true, default: Date.now},
    isRead: {type: Boolean, required: true, default: false}
});

module.exports = mongoose.model('Notification', schema);