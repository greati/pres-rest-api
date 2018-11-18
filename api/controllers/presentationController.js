'use strict';

var mongoose = require('mongoose'),
    Presentation = mongoose.model('Presentation'),
    PresSession = mongoose.model('PresSession'),
    OneChoiceQuestion = mongoose.model('OneChoiceQuestion');

exports.new_presentation = function(req, res) {
    var new_presentation = new Presentation(req.body);
    new_presentation.save(function(err, pres) {
        if (err)
            res.status(500).send(err);
        res.json(pres);
    });
};

exports.new_session = function(req, res) {
    var new_session = new PresSession(req.body);
    new_session.save(function(err, session) {
        if (err)
            res.status(500).send(err);
        res.json(session);
    });
};

exports.new_question = function(req, res) {
    var new_question = new OneChoiceQuestion(req.body);
    AlternativeAnswer.create(req.body.alternatives, function(err, alternatives) {
        if (err)
            res.status(500).send(err);
        new_question.alternatives = alternatives;
        new_question.save(function(err, question) {
            if (err)
                res.status(500).send(err);
            res.json(question);
        });
    });
};

exports.new_participation = function(req, res) {
    var new_part = new PartSession(req.body);
    new_part.save(function(err, part) {
        if (err)
            res.status(500).send(err);
        res.json(part);
    });
};

exports.new_answer = function(req, res) {
    var new_answer = new AnswerChoice(req.body);
    new_answer.save(function(err, answer) {
        if (err)
            res.status(500).send(err);
        res.json(answer);
    });
};
