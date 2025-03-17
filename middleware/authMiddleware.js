const passport = require('passport');

// Middleware per proteggere le route con autenticazione JWT
const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      console.error('🔒 Accesso negato: utente non autenticato');
      return res.status(401).json({ message: 'Accesso negato, token non valido' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = authMiddleware;
