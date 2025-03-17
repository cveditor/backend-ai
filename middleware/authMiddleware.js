const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '🔒 Accesso negato: token mancante o non valido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // ✅ Assegna l'utente alla richiesta
    next();
  } catch (err) {
    return res.status(401).json({ message: '🔒 Token non valido' });
  }
};

module.exports = { ensureAuthenticated };
