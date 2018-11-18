'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Answer = mongoose.model('Answer');
var AlternativeAnswer = mongoose.model('AlternativeAnswer');

var AnswerChoiceSchema = Answer.discriminator(
    'AnswerChoice', 
    new mongoose.Schema({
        choices: [{
            type: Schema.ObjectId,
            ref: 'AlternativeAnswer'
        }]
    })
);

module.exports = mongoose.model('AnswerChoice');
