const passport = require('passport');

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔍 Header Authorization ricevuto:", authHeader); // <-- Debug

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⛔ Nessun token valido ricevuto!");
    return res.status(401).json({ message: "Accesso negato, token mancante o non valido" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Errore nella verifica del token:", err.message);
      return res.status(403).json({ message: "Token non valido o scaduto" });
    }

    console.log("✅ Token decodificato con successo:", decoded);
    req.user = decoded;
    next();
  });
};
module.exports = { jwtAuth };
