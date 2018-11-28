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
        pres.populate({path:"user", model:"User", select:{"_id":1}}, function(err, pres) {
            if (err)
                res.status(500).send(err);
            res.json(pres);
        });
    });
}; 

exports.update_presentation = function(req, res) {
    Presentation.findOneAndUpdate({_id:req.params.presId}, req.body, {new:true}, function(err, presentation){
        presentation
            .populate('user', '_id')
            .exec(function(err, presentation) {
                if (err)
                    res.status(500).send(err);
                res.json(presentation);
            });
    });
}

exports.delete_presentation = function(req, res) {
    Presentation.remove({_id:req.params.presId}, function(err, presentation) {
        if (err)
            res.status(500).send(err);
        res.json({'msg':'Presentation deleted'});
    });
}

exports.read_presentation = function(req, res) {
    Presentation
        .findById(req.params.presId, function(err, presentation) {
            if (err)
              res.status(500).send(err);
            res.json(presentation);
        });
}

exports.list_presentations = function(req, res) {
    Presentation
        .find({'user':req.params.userId})
        .populate('user', '_id')
        .exec(function(err, presentations) {
            if (err)
              res.status(500).send(err);
            res.json(presentations);
        });
}

exports.new_session = function(req, res) {
    var new_session = new PresSession(req.body);
    new_session.save(function(err, session) {
        if (err)
            res.status(500).send(err);
        session
            .populate("presentation","_id title", function(err, session) {
                if (err)
                    res.status(500).send(err);
                res.json(session);
            });
    });
};

exports.list_sessions_pres = function(req, res) {
    PresSession.find({'presentation':req.params.presId})
        .populate('presentation', '_id title')
        .exec(function(err, sessions) {
            if (err)
                res.status(500).send(err);
            res.json(sessions);
        });
}

exports.new_question = function(req, res) {
    var new_question = new OneChoiceQuestion(req.body);
    AlternativeAnswer.create(req.body.alternatives, function(err, alternatives) {
        if (err)
            res.status(500).send(err);
        new_question.alternatives = alternatives;
        new_question.save(function(err, question) {
            if (err)
                res.status(500).send(err);
            question.populate("session", "_id", function(err, question){
                if (err)
                    res.status(500).send(err);
                res.json(question);
            });
        });
    });
};

exports.list_questions_session = function(req, res) {
    OneChoiceQuestion
        .find({'session':req.params.sessionId})
        .populate('session', '_id')
        .populate('alternatives')
        .exec(function(err, questions){
            if (err)
                res.status(500).send(err);
            res.json(questions);
        });
}

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
