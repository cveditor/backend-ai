const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, comparePasswords } = require('../utils/auth');

// Registrazione utente
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ token });
  } catch (error) {
    console.error('❌ Errore nella registrazione:', error.message);
    res.status(400).json({ error: 'Errore nella registrazione' });
  }
};

// Login utente
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password obbligatori' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = generateToken(user._id);
    res.status(200).json({ token });
  } catch (error) {
    console.error('❌ Errore nel login:', error.message);
    res.status(500).json({ error: 'Errore nel login' });
  }
};

module.exports = { registerUser, loginUser };
