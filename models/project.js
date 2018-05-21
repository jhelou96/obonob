var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

/**
 * Project model as stored in database
 */
var schema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    name: {type: String, required: true},
    address: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    category: {type: String, required: true},
    banner: {type: String, required: false},
    thumbnail: {type: String, required: false},
    website: {type: String, required: false},
    about: {
        about: {type: String, required: false},
        facebook: {type: String, required: false},
        twitter: {type: String, required: false},
        youtube: {type: String, required: false},
        github: {type: String, required: false}
    },
    media: [{
        type: {type: String, required: false},
        src: {type: String, required: false},
        caption: {type: String, required: false}
    }],
    posts: [{
        content: {type: String, required: false},
        author: {type: Schema.Types.ObjectId, required: false, ref: 'User'},
        date: {type: Date, required: false, default: Date.now},
        likes: [{
            author: {type: Schema.Types.ObjectId, required: false, ref: 'User'}
        }],
        replies: [{
            content: {type: String, required: false},
            author: {type: Schema.Types.ObjectId, required: false, ref: 'User'},
            date: {type: Date, required: false, default: Date.now}
        }],
        media: [{
            type: {type: String, required: false},
            src: {type: String, required: false}
        }]
    }],
    events: [{
        description: {type: String, required: false},
        date: {type: Date, required: false, default: Date.now}
    }],
    reviews: [{
        content: {type: String, required: false},
        rating: {type: Number, required: false},
        date: {type: Date, required: false, default: Date.now},
        author: {type: Schema.Types.ObjectId, required: false, ref: 'User'},
        likes: [{
            author: {type: Schema.Types.ObjectId, required: false, ref: 'User'}
        }]
    }],
    partners: [{
        project: {type: Schema.Types.ObjectId, required: false, ref: 'Project'},
        index: {type: Number, required: false}
    }],
    subscribers: [{type: Schema.Types.ObjectId, required: false, ref: 'User'}]
});

schema.plugin(mongooseUniqueValidator); //Allows to throw error when unique attribute not satisfied

module.exports = mongoose.model('Project', schema);