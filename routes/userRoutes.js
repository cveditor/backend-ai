const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');

// **PROFILO UTENTE**
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    console.log("🔍 Middleware JWT - req.user:", req.user); // Aggiungi questo log

    if (!req.user || !req.user.id) {
      console.error("❌ ERRORE: req.user è undefined o manca l'ID!");
      return res.status(401).json({ message: "Token non valido o scaduto" });
    }

    console.log("🔍 Richiesta profilo per utente ID:", req.user.id);

    const user = await User.findByPk(req.user.id, { attributes: ['username', 'email', 'plan'] });

    if (!user) {
      console.error("❌ Utente non trovato nel DB!");
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json(user);
  } catch (err) {
    console.error("❌ Errore nel recupero del profilo:", err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});



// **REGISTRAZIONE**
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'Email già registrata' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: 'Utente registrato con successo' });
  } catch (err) {
    console.error('Errore nella registrazione:', err);
    res.status(500).json({ message: 'Errore nella registrazione' });
  }
});

// **LOGIN**
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Email non registrata' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Password errata' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error('Errore nel login:', err);
    res.status(500).json({ message: 'Errore durante il login' });
  }
});

// **ELIMINA UTENTE**
router.delete('/delete', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    await user.destroy();
    res.json({ message: 'Account eliminato con successo' });
  } catch (err) {
    console.error('Errore nella cancellazione dell’account:', err);
    res.status(500).json({ message: 'Errore nella cancellazione dell’account' });
  }
});

module.exports = router;
