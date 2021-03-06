'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    name: {
        type: String,
        required: 'Provide the user name'
    },
    creation_date: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: 'Provide the user e-mail',
        index: { unique:true }
    },
    password: {
        type: String,
        required: 'Provide the user password'
    }
});

UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) 
        return next();
    
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err)
            return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err)
                return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema, 'User');
