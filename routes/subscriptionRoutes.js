const express = require('express');
const router = express.Router();
const { updateSubscription } = require('../controllers/subscriptionController');
const { jwtAuth } = require('../middleware/authMiddleware');;

// Modifica il piano di abbonamento dell'utente autenticato
router.post('/subscribe', jwtAuth, async (req, res) => {
    try {
      // Logica della subscription...
      res.status(200).json({ message: "Abbonamento attivato con successo!" });
    } catch (error) {
      console.error("Errore nella sottoscrizione:", error);
      res.status(500).json({ message: "Errore nel server" });
    }
  });
  

module.exports = router;
