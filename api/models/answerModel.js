'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var options = {discriminatorKey: 'kind'};

var AnswerSchema = new Schema({
    question:{
        type: Schema.ObjectId,
        ref: 'Question'
    }, 
    creation_date: {
        type: Date,
        default: Date.now
    }
}, options);

module.exports = mongoose.model('Answer', AnswerSchema, 'Answer');

