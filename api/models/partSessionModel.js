'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PartSessionSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Provide the question title'
    },
    session: {
        type: Schema.ObjectId,
        ref: 'PresSession'
    },
    partipation_date: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('PartSession', PartSessionSchema, 'PartSession');



