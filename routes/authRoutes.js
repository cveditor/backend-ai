const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');
const Joi = require('joi');
const axios = require('axios');

const TIKTOK_AUTH_URL = "https://www.tiktok.com/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open-api.tiktok.com/oauth/access_token/";
const CLIENT_ID = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.TIKTOK_CALLBACK_URL;

const INSTAGRAM_AUTH_URL = "https://api.instagram.com/oauth/authorize";
const INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_APP_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_CALLBACK_URL;

// Schema di validazione Joi
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Registrazione
router.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'Email già registrata' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: 'Utente registrato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nella registrazione' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Email non registrata' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Password errata' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante il login' });
  }
});

// Profilo protetto
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['username', 'email', 'plan'] });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero del profilo' });
  }
});

// Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      let user = await User.findOne({ where: { email: req.user.email } });
      if (!user) {
        user = await User.create({ username: req.user.displayName, email: req.user.email, password: null });
      }
      res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (err) {
      res.redirect('/login');
    }
  }
);

// TikTok Login
router.get('/tiktok', (req, res) => {
  const authURL = `${TIKTOK_AUTH_URL}?client_key=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user.info.basic&response_type=code`;
  res.redirect(authURL);
});

router.get('/tiktok/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: "Authorization code missing" });

    const tokenResponse = await axios.post(TIKTOK_TOKEN_URL, {
      client_key: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI
    });

    const accessToken = tokenResponse.data.access_token;
    const userInfo = tokenResponse.data.data;

    let user = await User.findOne({ where: { email: userInfo.open_id } });
    if (!user) {
      user = await User.create({ username: userInfo.display_name, email: userInfo.open_id, password: null });
    }

    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    res.redirect('/login');
  }
});

// Instagram Login
router.get('/instagram', (req, res) => {
  const authURL = `${INSTAGRAM_AUTH_URL}?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(INSTAGRAM_REDIRECT_URI)}&scope=user_profile,user_media&response_type=code`;
  res.redirect(authURL);
});

router.get('/instagram/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: "Authorization code missing" });

    const tokenResponse = await axios.post(INSTAGRAM_TOKEN_URL, {
      client_id: INSTAGRAM_CLIENT_ID,
      client_secret: INSTAGRAM_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: INSTAGRAM_REDIRECT_URI
    });

    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    res.redirect('/login');
  }
});

module.exports = router;
