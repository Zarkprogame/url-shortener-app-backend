const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/userModel'); 

passport.use(new GitHubStrategy({
    clientID: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    callbackURL: process.env.CALLBACK_URL,
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
            done(null, user);
        } else {
            user = await User.create({
                githubId: profile.id,
                username: profile.username,
                email: profile.emails ? profile.emails[0].value : null 
            });
            done(null, user);
        }
    } catch (err) {
        done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;