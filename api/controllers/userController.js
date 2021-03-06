'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.new_user = function(req, res) {
    var new_user = new User(req.body);
    new_user.save(function(err, user){
        if (err) {
            if (err.name == 'ValidationError') {
                res.status(500).send({
                    "code":1,
                    "description":"Duplicate username"
                });
            } else {
                res.status(500).send(err);
            }
        }
        res.json(user);
    });
};

exports.update_user = function(req, res) {
    res.json({msg:'unsupported operation'});
};

exports.delete_user = function(req, res) {
    res.json({msg:'unsupported operation'});
};

exports.view_user = function(req, res) {
    res.json({msg:'unsupported operation'});
};

exports.authenticate_user = function(req, res) {
    User.findOne({'email': req.body.email}, 
        function(err, user){
            // error on findOne
            if (err) res.status(500).json({'description': err});
            // user found
            if (user) {
                user.comparePassword(req.body.password, function(err, isMatch) {
                    // error on comparing
                    if (err) res.status(500).json({'description':'error in password handling'});
                    if (isMatch)
                        res.json(user);
                    else 
                        res.status(401).json({'description':'authentication failed'});
                });
            // no user found
            } else res.status(404).send({'description':'user not found'});
        }
    );    
};
