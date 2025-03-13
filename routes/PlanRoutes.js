const express = require('express');
const router = express.Router();
const { User, PlanLog } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const Joi = require('joi');
const { Op } = require('sequelize');

// Piani disponibili
const allowedPlans = ['base', 'pro', 'enterprise'];

// Schema di validazione Joi
const planSchema = Joi.object({
  plan: Joi.string().valid(...allowedPlans).required(),
});

// Recupera il piano dell'utente (ottimizzato)
router.get('/user/plan', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['plan'] });
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    res.json({ plan: user.plan });
  } catch (err) {
    console.error('Errore nel recupero del piano:', err);
    res.status(500).json({ message: 'Errore nel recupero del piano' });
  }
});

// Aggiorna il piano dell'utente con validazione e transazioni
router.post('/user/update-plan', authMiddleware, async (req, res) => {
  const { error } = planSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { plan } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    await Promise.all([
      PlanLog.create({ userId: user.id, oldPlan: user.plan, newPlan: plan }),
      user.update({ plan }),
    ]);

    res.json({ message: `Piano aggiornato a ${plan}`, plan });
  } catch (err) {
    console.error('Errore durante l aggiornamento del piano:', err);
    res.status(500).json({ message: 'Errore durante l aggiornamento del piano' });
  }
});

// Recupera la cronologia dei cambiamenti di piano (ottimizzato)
router.get('/user/plan-history', authMiddleware, async (req, res) => {
  try {
    const logs = await PlanLog.findAll({
      where: { userId: req.user.id },
      attributes: ['oldPlan', 'newPlan', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20, // Ottimizzazione: limitiamo le query
    });

    res.json(logs);
  } catch (err) {
    console.error('Errore nel recupero della cronologia dei piani:', err);
    res.status(500).json({ message: 'Errore nel recupero della cronologia dei piani' });
  }
});

// Middleware per limitare l'accesso in base al piano
const checkPlan = (requiredPlan) => (req, res, next) => {
  if (req.user.plan !== requiredPlan) {
    return res.status(403).json({ message: 'Accesso negato, piano non autorizzato' });
  }
  next();
};

module.exports = { router, checkPlan };
