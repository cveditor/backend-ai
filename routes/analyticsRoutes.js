const express = require('express');
const router = express.Router();
const { Analytics } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

// Schema di validazione per filtri
const filterSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  platform: Joi.string().valid('instagram', 'facebook', 'twitter', 'tiktok').optional(),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

// Ottieni analytics con filtri
router.get('/', async (req, res) => {
  const { error, value } = filterSchema.validate(req.query);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { startDate, endDate, platform, limit } = value;

  try {
    const filters = {};

    if (startDate && endDate) {
      filters.createdAt = { [Op.between]: [startDate, endDate] };
    }
    if (platform) {
      filters.platform = platform;
    }

    const analytics = await Analytics.findAll({
      where: filters,
      order: [['createdAt', 'DESC']],
      limit,
    });

    res.json(analytics);
  } catch (err) {
    console.error('Errore nel recupero delle analytics:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Ottieni riepilogo delle metriche
router.get('/summary', async (req, res) => {
  try {
    const summary = await Analytics.findAll({
      attributes: [
        'platform',
        [sequelize.fn('SUM', sequelize.col('likes')), 'totalLikes'],
        [sequelize.fn('SUM', sequelize.col('comments')), 'totalComments'],
        [sequelize.fn('SUM', sequelize.col('shares')), 'totalShares'],
      ],
      group: ['platform'],
    });

    res.json(summary);
  } catch (err) {
    console.error('Errore nel riepilogo delle analytics:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

module.exports = router;
