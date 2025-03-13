const express = require('express');
const router = express.Router();
const { User } = require('../models');
const passport = require('passport');
const Joi = require('joi');

// Schema di validazione per aggiornamento profilo
const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  plan: Joi.string().valid('base', 'pro', 'enterprise'),
});

// Ottieni dati utente
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['username', 'email', 'plan', 'createdAt'] });
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    res.json(user);
  } catch (err) {
    console.error('Errore nel recupero del profilo:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Aggiorna dati utente
router.put('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { error } = updateUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    await user.update(req.body);
    res.json({ message: 'Profilo aggiornato con successo', user });
  } catch (err) {
    console.error('Errore durante l’aggiornamento del profilo:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Elimina account utente
router.delete('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    await user.destroy();
    res.json({ message: 'Account eliminato con successo' });
  } catch (err) {
    console.error('Errore nella cancellazione dell’account:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

module.exports = router;
