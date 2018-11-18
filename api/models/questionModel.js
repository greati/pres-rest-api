'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var options = {discriminatorKey: 'kind'};

var QuestionSchema = new Schema({
    title: {
        type:String,
        required: 'Provide the question title'
    },
    creation_date: {
        type: Date,
        default: Date.now
    },
    session: {
        type: Schema.ObjectId,
        ref: 'PresSession'
    }
}, options);

module.exports = mongoose.model('Question', QuestionSchema, 'Question');



