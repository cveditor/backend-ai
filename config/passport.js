const passport = require('passport-oauth2');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const TikTokStrategy = require('passport-tiktok').Strategy;
const { User } = require('../models');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [user] = await User.findOrCreate({
      where: { email: profile.emails[0].value },
      defaults: { username: profile.displayName }
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// Instagram
passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/instagram/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [user] = await User.findOrCreate({
      where: { instagramId: profile.id },
      defaults: { username: profile.username }
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// TikTok
passport.use(new TikTokStrategy({
  clientID: process.env.TIKTOK_CLIENT_ID,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/tiktok/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [user] = await User.findOrCreate({
      where: { tiktokId: profile.id },
      defaults: { username: profile.displayName }
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
}));
