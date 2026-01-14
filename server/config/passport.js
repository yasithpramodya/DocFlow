const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET_HERE',
        callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        const newUser = {
            googleId: profile.id,
            email: profile.emails[0].value,
            isVerified: true, // Google emails are verified
            avatar: profile.photos[0].value
        };

        try {
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // User exists
                if (!user.googleId) {
                    // Link google account to existing email user
                    user.googleId = profile.id;
                    user.avatar = user.avatar || profile.photos[0].value;
                    user.isVerified = true; // Trust Google
                    await user.save();
                }
                done(null, user);
            } else {
                // Create user
                user = await User.create(newUser);
                done(null, user);
            }
        } catch (err) {
            console.error(err);
            done(err, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
};
