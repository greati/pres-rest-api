'use strict';

var mongoose = require('mongoose');
var shortid = require('shortid');

var Schema = mongoose.Schema,
    Presentation = mongoose.model('Presentation');

var PresSessionSchema = new Schema({
    presentation: {
        type: Schema.ObjectId,
        ref: 'Presentation',
        required: 'Provide the presentation of this session'
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
    code: {
        type: String,
        index: { unique:true },
        default: shortid.generate
    },
    active: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('PresSession', PresSessionSchema, 'PresSession');
