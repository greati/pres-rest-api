'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Question = mongoose.model('Question');
var AlternativeAnswer = mongoose.model('AlternativeAnswer');

var OneChoiceQuestionSchema = Question.discriminator(
    'OneChoiceQuestion', 
    new mongoose.Schema({
        alternatives: [{
            type: Schema.ObjectId,
            ref: 'AlternativeAnswer'
        }]
    })
);

module.exports = mongoose.model('OneChoiceQuestion');
