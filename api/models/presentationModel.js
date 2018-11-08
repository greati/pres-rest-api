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
    date_time: {
        type: Date,
        required: 'Provide the presentation date and time'
    },
    local: {
        description: {
            type: String,
            required: 'Provide the local of the presentation'
        },
        lat: Number,
        lon: Number
    },
    user: {
        type: Schema.ObjectId,
        ref: 'UserSchema',
        required: 'Provide the user responsible for this presentation'
    }
});

module.exports = mongoose.model('Presentation', PresentationSchema, 'Presentation');
