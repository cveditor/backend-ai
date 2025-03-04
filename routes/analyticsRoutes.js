const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Analytics, SocialPost } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/user', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { startDate, endDate, platform } = req.query;

  try {
    const posts = await SocialPost.findAll({
      where: {
        userId,
        ...(platform && { platform }),
      },
      attributes: ['id'],
    });

    if (!posts.length) {
      return res.status(404).json({ message: 'Nessun post trovato per questo utente.' });
    }

    const analytics = await Analytics.findAll({
      where: {
        postId: posts.map(post => post.id),
        createdAt: {
          [Op.between]: [startDate || '1900-01-01', endDate || new Date()],
        },
      },
    });

    res.status(200).json(analytics);
  } catch (err) {
    console.error('Errore nel recupero delle analytics:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
