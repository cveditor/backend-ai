const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');
const Joi = require('joi');
const { ensureAuthenticated } = require('../middleware/authMiddleware');


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

// Ottenere tutti gli utenti (solo per test)
router.get('/all', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'email'] });
    res.json(users);
  } catch (err) {
    console.error('Errore nel recupero utenti:', err);
    res.status(500).json({ message: 'Errore nel recupero degli utenti' });
  }
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

    res.json({ token, redirectUrl: `${process.env.CLIENT_URL}/onboarding` });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante il login' });
  }
});

// Profilo protetto
router.get('/profile', ensureAuthenticated, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: '🔒 Accesso negato: utente non autenticato' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'subscriptionPlan'],
    });

    if (!user) return res.status(404).json({ message: '❌ Utente non trovato' });

    res.json(user);
  } catch (err) {
    console.error('❌ Errore nel recupero del profilo:', err);
    res.status(500).json({ message: '❌ Errore interno del server' });
  }
});

module.exports = router;
