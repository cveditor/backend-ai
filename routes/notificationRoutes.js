const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const passport = require('passport');
const { Op } = require('sequelize');

// Ottieni notifiche utente
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20, // Ottimizzazione
    });
    res.json(notifications);
  } catch (err) {
    console.error('Errore nel recupero delle notifiche:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Segna una notifica come letta
router.put('/:id/read', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) return res.status(404).json({ message: 'Notifica non trovata' });

    await notification.update({ read: true });
    res.json({ message: 'Notifica segnata come letta' });
  } catch (err) {
    console.error('Errore nell aggiornamento della notifica:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Elimina tutte le notifiche lette
router.delete('/clear', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await Notification.destroy({
      where: {
        userId: req.user.id,
        read: true,
      },
    });
    res.json({ message: 'Notifiche lette eliminate' });
  } catch (err) {
    console.error('Errore nell eliminazione delle notifiche:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

module.exports = router;
