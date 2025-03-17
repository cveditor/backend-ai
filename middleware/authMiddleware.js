const passport = require('passport');

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: '🔒 Accesso negato: utente non autenticato' });
};

const jwtAuth = passport.authenticate('jwt', { session: false });

module.exports = { ensureAuthenticated, jwtAuth };
