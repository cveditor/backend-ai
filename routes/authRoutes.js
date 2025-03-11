const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();
const passport = require('passport');
require('../config/passport');

// Registrazione
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.status(201).json({ token, userId: user.id, username: user.username });
  } catch (error) {
    console.error('Errore nella registrazione:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Password errata' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.status(200).json({ token, userId: user.id, username: user.username });
  } catch (error) {
    console.error('Errore nel login:', error);
    res.status(500).json({ message: 'Errore nel login' });
  }
});
// Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&userId=${req.user.id}&username=${req.user.username}`);
  }
);

// Instagram
router.get('/instagram',
  passport.authenticate('instagram')
);

router.get('/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&userId=${req.user.id}&username=${req.user.username}`);
  }
);

// TikTok
router.get('/tiktok',
  passport.authenticate('tiktok')
);

router.get('/tiktok/callback',
  passport.authenticate('tiktok', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&userId=${req.user.id}&username=${req.user.username}`);
  }
);

module.exports = router;