var mongoose = require('mongoose');
var	hash = require('../pass').hash;
var myModels = require('../models/models');
var User = mongoose.model('users', myModels.UserSchema);
var Projeto = require('../models/projetoschema');

exports.authenticate = function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    User.findOne({
        username: name
    },
    function (err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));
            hash(pass, user.salt, function (err, hash) {
                if (err) return fn(err);
                if (hash == user.hash) return fn(null, user);
                fn(new Error('invalid password'));
            });
        } else {
            return fn(new Error('cannot find user'));
        }
    });
}
exports.requiredAuthentication = function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Acesso exclusivo para usuários logados.';
        res.redirect('/login');
    }
}
exports.userExist = function userExist(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.redirect("/signup");
        }
    });
}
