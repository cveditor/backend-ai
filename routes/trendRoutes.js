const express = require('express');
const router = express.Router();
const { getTrendingTopics, generatePostIdeas } = require('../Ai/trendAnalyzer');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/trends', authMiddleware, async (req, res) => {
  const { platform } = req.query;

  if (!['tiktok', 'instagram'].includes(platform)) {
    return res.status(400).json({ error: 'Specifica una piattaforma valida (tiktok, instagram).' });
  }

  try {
    const trends = await getTrendingTopics(platform);
    const trendIdeas = await Promise.all(
      trends.map(async (trend) => {
        const idea = await generatePostIdeas(trend);
        return { trend, idea };
      })
    );

    res.status(200).json(trendIdeas);
  } catch (error) {
    console.error(`❌ Errore nei trend per ${platform}:`, error.message);
    res.status(500).json({ error: 'Errore nel recupero dei trend.' });
  }
});

module.exports = router;
