const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TikTokStrategy = require('passport-tiktok-oauth2').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const { User } = require('../models');

// Configura Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || null;
    if (!email) return done(null, false);
    
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ username: profile.displayName, email, password: null });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Configura TikTok OAuth
passport.use(new TikTokStrategy({
  clientID: process.env.TIKTOK_CLIENT_KEY,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  callbackURL: process.env.TIKTOK_CALLBACK_URL,
  scope: ['user.info.basic']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { email: profile.id } });
    if (!user) {
      user = await User.create({ username: profile.displayName, email: profile.id, password: null });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Configura Instagram OAuth
passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_APP_ID,
  clientSecret: process.env.INSTAGRAM_APP_SECRET,
  callbackURL: process.env.INSTAGRAM_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { email: profile.id } });
    if (!user) {
      user = await User.create({ username: profile.username, email: profile.id, password: null });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
