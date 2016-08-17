var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/users');

var ConfigAuth = require('./auth');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        console.log(user)
        done(null, user);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================

    passport.use(new GoogleStrategy({
        clientID: ConfigAuth.googleAuth.clientID,
        clientSecret: ConfigAuth.googleAuth.clientSecret,
        callbackURL: ConfigAuth.googleAuth.callbackURL

    }, function (token, refreshToken, profile, done) {

        process.nextTick(function () {

            User.findOne({
                'id': profile.id
            }, function (err, user) {
                if (err)
                    return done(err);
                if (user)
                    return done(null, user);
                else {
                    var newUser = new User();

                    newUser.id = profile.id;
                    newUser.token = token;
                    newUser.name = profile.displayName;
                    newUser.email = profile.emails[0].value;


                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });

        });

    }));

    // =========================================================================
    // local-signup=============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({

            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, name, password, done) {
            process.nextTick(function () {

                User.findOne({
                    'name': name
                }, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is taken'));
                    } else {
                        var newUser = new User();
                        newUser.name = name;
                        newUser.password = newUser.generateHash(password);

                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });
            });

        }));



    passport.use('local-signin', new LocalStrategy({

        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true


    }, function (req, name, password, done) {

        User.findOne({
            'name': name
        }, function (err, user) {
            if (err)
                return done(err);

            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.'));

            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

            return done(null, user);

        });
    }));


    // =========================================================================
    // Company login============================================================
    // =========================================================================
    passport.use('local-company-signin', new LocalStrategy({

        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true


    }, function (req, name, password, done) {

        Employers.findOne({
            'name': name
        }, function (err, user) {
            if (err)
                return done(err);

            if (!user)
                return done(null, false, req.flash('loginMessage', 'No company found.'));

            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            console.log(user);
            return done(null, user);

        });
    }));




};
