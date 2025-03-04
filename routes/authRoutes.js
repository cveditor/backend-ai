const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
require('dotenv').config();

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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
