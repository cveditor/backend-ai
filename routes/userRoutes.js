const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Ottieni le impostazioni di notifica di un utente
router.get('/:userId/notification-settings', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }

    res.status(200).json({
      likeThreshold: user.likeThreshold || 100,
      engagementRateThreshold: user.engagementRateThreshold || 0.2,
    });
  } catch (err) {
    console.error('❌ Errore nel recupero delle notifiche:', err.message);
    res.status(500).json({ error: 'Errore nel recupero delle notifiche.' });
  }
});

// Aggiorna le impostazioni di notifica
router.post('/update-notification-settings', authMiddleware, async (req, res) => {
  const { userId, likeThreshold, engagementRateThreshold } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }

    user.likeThreshold = likeThreshold;
    user.engagementRateThreshold = engagementRateThreshold;
    await user.save();

    res.status(200).json({ message: 'Impostazioni aggiornate correttamente!' });
  } catch (err) {
    console.error('❌ Errore nell’aggiornamento delle notifiche:', err.message);
    res.status(500).json({ error: 'Errore durante l’aggiornamento.' });
  }
});

module.exports = router;
