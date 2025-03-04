const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.warn('⚠️ Tentativo di accesso senza token.');
    return res.status(401).json({ message: 'Token non trovato' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('❌ Token non valido:', error.message);
    res.status(403).json({ message: 'Token non valido' });
  }
};

module.exports = authMiddleware;
