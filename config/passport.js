const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const TikTokStrategy = require('passport-tiktok').Strategy;
const { User } = require('../models');
const OAuth2Strategy = require('passport-oauth2')

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
ppassport.use('tiktok', new OAuth2Strategy({authorizationURL: 'https://www.tiktok.com/auth/authorize/',
    tokenURL: 'https://open-api.tiktok.com/oauth/access_token/',
    clientID: process.env.TIKTOK_CLIENT_ID,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    callbackURL: process.env.TIKTOK_CALLBACK_URL,
    scope: ['user.info.basic'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Recupera le info utente da TikTok
      const response = await axios.get('https://open-api.tiktok.com/user/info/', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
  
      const userData = response.data.data.user;
  
      let user = await User.findOne({ where: { tiktokId: userData.open_id } });
  
      if (!user) {
        user = await User.create({
          username: userData.display_name || 'TikTokUser',
          tiktokId: userData.open_id,
          email: userData.email || null,
        });
      }
  
      return done(null, user);
    } catch (err) {
      return done(err);
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
      done(err);
    }
  });