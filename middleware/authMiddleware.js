const passport = require('passport');

const jwtAuth = (req, res, next) => {
  console.log("Token ricevuto:", req.headers.authorization); // 🔍 Verifica se il token arriva

  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      console.error("Errore JWT:", err);
      return res.status(500).json({ message: "Errore interno del server" });
    }
    if (!user) {
      console.warn("🔒 Accesso negato: utente non autenticato");
      return res.status(401).json({ message: "🔒 Accesso negato: utente non autenticato" });
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = { jwtAuth };
