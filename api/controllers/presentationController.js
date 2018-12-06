'use strict';

var mongoose = require('mongoose'),
    Presentation = mongoose.model('Presentation'),
    PresSession = mongoose.model('PresSession'),
    OneChoiceQuestion = mongoose.model('OneChoiceQuestion'),
    Question = mongoose.model('Question');

exports.close_question = function(req, res) {
    
    var questionId = req.params.questionId;
    var userId = req.params.userId;

        Question.findOne({'_id':questionId})
            .populate('session', '_id code')
            .exec(function(err, question){
            if (err)
                res.status(404).send(err);
            if(question) {
                if (!question.open) {
                    res.status(401).send({'msg':'this question is closed already'}); 
                } else {
                    Question.findOneAndUpdate({'_id':questionId}, {'open':false}, {new : true}, function(err,questionUp){
                        if (err)
                            res.status(500).send(err);
                        res.json(questionUp);
                    });
                }
            } else {
                res.status(404).send(err);
            }
        });
 }


exports.open_question = function(firebase_emitter) {
    
    return function(req, res) {
        var questionId = req.params.questionId;

        Question
            .findById(questionId, function(err, question){
                switch(question.kind) {
                    case 'OneChoiceQuestion': {
                        question
                        .populate('session', 'code active')
                        .populate('alternatives', function(err, question){
                            if (!question.session.active) {
                                res.status(403).send({'msg':'session is inactive'});
                                return;
                            }
                            else if (question.open) {
                                res.status(403).send({'msg':'this question is open already'});
                                return;
                            } else {
                                Question.updateOne({'_id':questionId}, {'open':true}, {new:true}, function(err, questionUp){
                                    if (err)
                                        res.status(500).send(err);
                                    firebase_emitter.emit('notifyTopic', question.session.code, 
                                        {
                                            'data': { 
                                                'type':'open_question',
                                                'question_id' : question.toObject()._id.toString() //'test'//JSON.stringify(questionUp.title)
                                            }
                                        }
                                    );
                                    res.json(questionUp);
    
                                });  
                            }
                        });
                    }
                } 
            });
    }
}

exports.list_parts_user = function(req, res) {
    PartSession
        .find({'user':req.params.userId})
        .populate('user', '_id')
        .populate(
            {
                path: 'session',
                populate: [
                    {
                        path: 'presentation',
                        populate: {
                            path:'user',
                            select: '_id name'
                        } 
                    }, {
                        path:'questions',
                        select:'_id'
                    }
                ]
            }
        )
        .exec(function(err, parts){
            if (err)
                res.status(500).send(err);
            res.json(parts);
        })
}

exports.enter_session = function(firebase_emitter) {
    
    return function(req, res) {

        var code = req.body.sessionCode;
        var client_token = req.body.clientToken;

        PresSession.findOne({'code':req.body.sessionCode}, function(err,session){
            
            if (err)
                res.status(404).send(err);

            if(!session)
                res.status(404).send({'msg':'session not found'});

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
                        part
                        .populate('user', '_id')
                        .populate(
                            {
                                path: 'session',
                                populate:[
                                    {
                                        path:'presentation',
                                        select:'_id title',
                                        populate: {
                                            path:'user',
                                            select: '_id name'
                                        }
                                    },
                                    {
                                        path:'questions',
                                        select:'_id title',
                                        populate: {
                                            path:'alternatives',
                                            select:'_id text order'
                                        }
                                    }
                                ]
                            
                            }
                        , function(err, part) {
                            firebase_emitter.emit("enter_session", client_token, code);
                            res.json(part);
                        });
                    });            
                } else {
                    if (part.active) {
                        res.status(401).send({'msg':'this participation is already open'});
                    } else {
                        PartSession.findOneAndUpdate(query, {'active':true}, {new : true}, function(err, partUpdate){
                            if (err)
                                res.status(500).send(err);
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
                                    populate: [
                                    {
                                        path:'presentation',
                                        select:'_id title',
                                        populate: {
                                            path:'user',
                                            select: '_id name'
                                        }
                                    },
                                    {
                                        path:'questions',
                                        select:'_id title',
                                        populate: {
                                            path:'alternatives',
                                            select:'_id text order'
                                        }
                                    }
                                    ]
                                  }
                                , function(err, partUpdatePop){
                                    if (err)
                                        res.status(500).send(err);
                                    firebase_emitter.emit("enter_session", client_token, code);
                                    res.json(partUpdatePop);
                                });

                        });
                    }
                }
            
            });
        });
    }
}

exports.quit_session = function(firebase_emitter) { 
    
    return function(req, res) {

        var client_token = req.body.clientToken;

        var query = {
            'session':mongoose.mongo.ObjectId(req.body.sessionId), 
            'user':mongoose.mongo.ObjectId(req.body.userId)};

        PartSession.findOne(query)
            .populate('session', '_id code')
            .exec(function(err, part){
            if (err)
                res.status(404).send(err);
            if(part) {
                if (!part.active) {
                    res.status(401).send({'msg':'this participation is closed already'}); 
                } else {
                    PartSession.findOneAndUpdate(query, {'active':false}, {new : true}, function(err,partUp){
                        if (err)
                            res.status(500).send(err);
                        firebase_emitter.emit("quit_session", client_token, part.session.code);
                        res.json(part);
                    });
                }
            } else {
                res.status(404).send(err);
            }
        });
    }
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
        .populate('questions', '_id title open')
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
                
                var sessionId = question.session._id;

                PresSession.findOneAndUpdate(
                    {'_id' : sessionId},
                    {$push: {questions: question}},
                    function(err, session){
                    if (err)
                        res.status(500).send(err);
                    res.json(question);
                });

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
        answer.populate('question','_id')
        .populate('choices','_id', function(err, answer){
            if (err) {
                res.status(500).send(err);
            }
            res.json(answer);
        });
    });
};

exports.list_answers = function(req, res) {
    Answer
        .find({'question':req.params.questionId})
        .populate('question', '_id')
        .populate('choices')
        .exec(function(err, questions){
            if (err)
                res.status(500).send(err);
            res.json(questions);
        });
}
