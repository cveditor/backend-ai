const express = require('express');
const router = express.Router();
const { createTrigger, getTriggers, deleteTrigger } = require('../controllers/triggerController');
const { jwtAuth } = require('../middleware/authMiddleware'); // ✅ Import corretto

// Crea un nuovo trigger
router.post('/', jwtAuth, async (req, res) => {
  try {
    await createTrigger(req, res);
  } catch (error) {
    console.error('❌ Errore nella creazione del trigger:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Ottieni tutti i trigger dell'utente
router.get('/', jwtAuth, async (req, res) => {
  try {
    await getTriggers(req, res);
  } catch (error) {
    console.error('❌ Errore nel recupero dei trigger:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Elimina un trigger
router.delete('/:id', jwtAuth, async (req, res) => {
  try {
    await deleteTrigger(req, res);
  } catch (error) {
    console.error('❌ Errore nell’eliminazione del trigger:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

module.exports = router;



