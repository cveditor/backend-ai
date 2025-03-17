const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: InstagramStrategy } = require('passport-instagram');
const { User } = require('../models');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await User.findByPk(jwt_payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { email: profile.emails[0].value } });
    if (!user) {
      user = await User.create({ username: profile.displayName, email: profile.emails[0].value });
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_APP_ID,
  clientSecret: process.env.INSTAGRAM_APP_SECRET,
  callbackURL: process.env.INSTAGRAM_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { email: profile.username } });
    if (!user) {
      user = await User.create({ username: profile.displayName, email: profile.username });
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;
