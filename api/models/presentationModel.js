'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PresentationSchema = new Schema({
    title: {
        type: String,
        required: 'Provide the presentation title'
    },
    description: {
        type: String
    },
    creation_date: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Provide the user responsible for this presentation'
    }
});

module.exports = mongoose.model('Presentation', PresentationSchema, 'Presentation');
