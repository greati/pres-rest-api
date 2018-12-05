'use strict';

var mongoose = require('mongoose'),
    Presentation = mongoose.model('Presentation'),
    PresSession = mongoose.model('PresSession'),
    OneChoiceQuestion = mongoose.model('OneChoiceQuestion');

exports.enter_session = function(req, res) {

    var code = req.body.sessionCode;

    PresSession.findOne({'code':req.body.sessionCode}, function(err,session){
        
        if (err)
            res.status(404).send(err);

        if (!session.active) {
            res.status(401).send({'msg':'inactive session'});
            return;
        }

        var query = {'session':session._id, 'user':mongoose.mongo.ObjectId(req.body.userId)};

        PartSession.findOne(query, function(err, part){

            if (err)
                res.status(500).send(err);
               
            if (!part) {
                var new_part = new PartSession(
                    {
                        'user':mongoose.mongo.ObjectId(req.body.userId),
                        'session':mongoose.mongo.ObjectId(session._id)
                    }
                );
                new_part.save(function(err, part) {
                    if (err)
                        res.status(501).send(err);
                    res.json(part);
                });            
            } else {
                if (part.active) {
                    res.status(401).send({'msg':'this participation is already open'});
                } else {
                    PartSession.findOneAndUpdate(query, {'active':true}, {new : true}, function(err, partUpdate){
                        if (err)
                            res.status(500).send(err);
                        //partUpdate.populate('session', '_id', function(err, partUpdatePop){
                        //    if (err)
                        //        res.status(500).send(err);
                        //    res.json(partUpdatePop);
                        //});
                        partUpdate
                            .populate(
                                {
                                    path:'user',
                                    select:'_id'
                                }
                            )
                            .populate(
                              {
                                path: 'session',
                                populate: {
                                    path: 'presentation',
                                    populate: {
                                        path: 'user'
                                    }
                                }
                              }
                            , function(err, partUpdatePop){
                                if (err)
                                    res.status(500).send(err);
                                res.json(partUpdatePop);
                            });

                    });
                }
            }
        
        });
    });
}

exports.quit_session = function(req, res) {

    var query = {
        'session':mongoose.mongo.ObjectId(req.body.sessionId), 
        'user':mongoose.mongo.ObjectId(req.body.userId)};

    PartSession.findOne(query, function(err, part){
        if (err)
            res.status(404).send(err);
        if(part) {
            if (!part.active) {
                res.status(401).send({'msg':'this participation is closed already'}); 
            } else {
                PartSession.findOneAndUpdate(query, {'active':false}, {new : true}, function(err,part){
                    if (err)
                        res.status(500).send(err);
                    res.json(part);
                });
            }
        } else {
            res.status(404).send(err);
        }
    });
}

exports.open_session = function(req, res) {
    PresSession.findById(req.params.sessionId, function(err, session){
        if (err) {
            res.status(500).send(err);
            return;
        }

        session
            .populate('presentation', 'user', function(err, session){
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                if (session.presentation.user._id.equals(req.params.userId)) {
                    res.status(401).json({'msg':'you cannot open this session'});
                    return;
                }
             if (!session.active) {
                session.update({'active': true, 
                                $push:{openings: {'date_opening':req.params.openingDate}}
                               }, function(err, session) {
                    if (err)
                        res.status(500).send(err);
                    res.json(session);
                    return;
                });
            } else {
                res.status(500).json({msg:'session already active'});
            }        
        }); 
    });
}

exports.close_session = function(req, res) {
    PresSession.findById(req.params.sessionId, function(err, session){
        if (err) {
            res.status(500).send(err);
            return;
        }

        session
            .populate('presentation', 'user', function(err, session){
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                if (session.presentation.user._id.equals(req.params.userId)) {
                    res.status(401).json({'msg':'you cannot close this session'});
                    return;
                }
             if (session.active) {
                session.update({'active': false, 
                                $push:{openings: {'date_opening':req.params.closingDate}}
                               }, function(err, session) {
                    if (err)
                        res.status(500).send(err);
                    res.json(session);
                    return;
                });
            } else {
                res.status(500).json({msg:'session already closed'});
            }        
        }); 
    });
}



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
