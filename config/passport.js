const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: InstagramStrategy } = require('passport-instagram');
const { User } = require('../models');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };
  
  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      console.log("🔍 JWT Payload ricevuto:", jwt_payload); // Log del payload
  
      const user = await User.findByPk(jwt_payload.id);
      if (user) {
        console.log("✅ Utente trovato:", user.id);
        return done(null, user);
      } else {
        console.error("❌ Utente non trovato nel DB!");
        return done(null, false);
      }
    } catch (err) {
      console.error("❌ Errore Passport JWT:", err);
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
