const express = require('express');
const router = express.Router();
const { getTrendingTopics, generatePostIdeas } = require('../Ai/trendAnalyzer');
const authMiddleware = require('../middleware/authMiddleware');

// Controlla che le funzioni siano correttamente importate
if (typeof getTrendingTopics !== 'function' || typeof generatePostIdeas !== 'function') {
  console.error('❌ Errore negli import: getTrendingTopics o generatePostIdeas non sono funzioni');
}

// Recupera i trending topic da TikTok o Instagram
router.get('/trends', async (req, res) => {
  const { platform } = req.query;

  if (!['tiktok', 'instagram'].includes(platform)) {
    return res.status(400).json({ error: 'Specifica una piattaforma valida (tiktok, instagram).' });
  }

  try {
    const trends = await getTrendingTopics(platform);
    if (!Array.isArray(trends)) {
      throw new Error('Dati ricevuti in un formato errato');
    }

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
