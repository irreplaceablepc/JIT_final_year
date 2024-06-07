const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'usernameOrEmailOrPhone',
            passwordField: 'password',
            passReqToCallback: true,
        },
        async (req, usernameOrEmailOrPhone, password, done) => {
            try {
                let user;
                if (usernameOrEmailOrPhone.includes('@')) {
                    // If the input contains '@', it's likely an email
                    user = await User.findOne({ email: usernameOrEmailOrPhone });
                } else if (/^\d+$/.test(usernameOrEmailOrPhone)) {
                    // If the input is only digits, it's likely a phone number
                    user = await User.findOne({ phone: usernameOrEmailOrPhone });
                } else {
                    // Otherwise, it's likely a username
                    user = await User.findOne({ username: usernameOrEmailOrPhone });
                }

                if (!user || !(await bcrypt.compare(password, user.password))) {
                    req.flash('error', 'Invalid username/email/phone or password');
                    return done(null, false);
                }

                return done(null, user);
            } catch (err) {
                req.flash('error', err.message);
                return done(err);
            }
        }
    )
);



passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

passport.checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/sign-in');
};

passport.setAuthenticatedUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    next();
};

module.exports = passport;