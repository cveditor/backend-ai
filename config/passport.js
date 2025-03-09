const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const TikTokStrategy = require('passport-tiktok').Strategy;
const User = require('../models/User');
require('dotenv').config();

const calculateTrialEndDate = () => {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7);
  return trialEndDate;
};

const saveUser = async (profile, done) => {
  try {
    let user = await User.findOne({ where: { email: profile.emails[0]?.value } });

    if (!user) {
      user = await User.create({
        username: profile.displayName,
        email: profile.emails[0]?.value,
        provider: profile.provider,
        plan: 'trial',
        trialEnd: calculateTrialEndDate(),
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => saveUser(profile, done)
  )
);

passport.use(
  new InstagramStrategy(
    {
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/instagram/callback`,
    },
    (accessToken, refreshToken, profile, done) => saveUser(profile, done)
  )
);

passport.use(
  new TikTokStrategy(
    {
      clientID: process.env.TIKTOK_CLIENT_ID,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/tiktok/callback`,
    },
    (accessToken, refreshToken, profile, done) => saveUser(profile, done)
  )
);

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

module.exports = passport;
