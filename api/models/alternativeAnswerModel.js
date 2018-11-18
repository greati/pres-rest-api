'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlternativeAnswerSchema = new Schema({
    text: {
        type: String,
        required: 'Provide the answer\'s text'
    },
    order: {
        type: Number,
        required: 'Provide the answer\'s order'
    }
});

module.exports = mongoose.model('AlternativeAnswer', AlternativeAnswerSchema, 'AlternativeAnswer');
