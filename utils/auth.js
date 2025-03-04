const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Crea un token JWT valido per 30 giorni
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Confronta la password inserita con quella salvata nel database
const comparePasswords = async (inputPassword, storedPassword) => {
  return await bcrypt.compare(inputPassword, storedPassword);
};

module.exports = { generateToken, comparePasswords };
