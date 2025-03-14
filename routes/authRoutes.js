const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');
const Joi = require('joi');

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
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Email non registrata' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Password errata' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Se login classico, reindirizza all'onboarding per collegare i social
    res.json({ token, redirectUrl: `${process.env.CLIENT_URL}/onboarding` });
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
      res.redirect(`${process.env.CLIENT_URL}/onboarding`);
    } catch (err) {
      res.redirect('/login');
    }
  }
);

// TikTok Login
router.get('/tiktok', passport.authenticate('tiktok'));

router.get('/tiktok/callback',
  passport.authenticate('tiktok', { failureRedirect: '/login' }),
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

// Instagram Login
router.get('/instagram', passport.authenticate('instagram'));

router.get('/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: '/login' }),
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

module.exports = router;
