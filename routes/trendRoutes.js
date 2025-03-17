const express = require('express');
const router = express.Router();
const { getTrendingTopics, generatePostIdeas } = require('../Ai/trendAnalyzer');
const { Trend } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const SUPPORTED_PLATFORMS = ['tiktok', 'instagram'];

router.get('/', authMiddleware, async (req, res) => {
  const { platform } = req.query;

  if (!platform || !SUPPORTED_PLATFORMS.includes(platform.toLowerCase())) {
    return res.status(400).json({ error: 'Specifica una piattaforma valida (tiktok, instagram).' });
  }

  try {
    const trends = await getTrendingTopics(platform.toLowerCase());

    if (!trends || trends.length === 0) {
      return res.status(404).json({ message: `Nessun trend trovato per ${platform}.` });
    }

    const trendIdeas = await Promise.all(
      trends.map(async (trend) => {
        try {
          const idea = await generatePostIdeas(trend);

          // ✅ Salviamo il trend nel database
          await Trend.upsert({
            platform,
            topic: trend,
            mentions: Math.floor(Math.random() * 1000) + 100, // Dati finti se non disponibili
          });

          return { trend, idea };
        } catch (err) {
          console.error(`❌ Errore generando idea per ${trend}:`, err.message);
          return { trend, idea: 'Errore nella generazione dell’idea' };
        }
      })
    );

    res.status(200).json(trendIdeas);
  } catch (error) {
    console.error(`❌ Errore nel recupero dei trend per ${platform}:`, error.message);
    res.status(500).json({ error: 'Errore interno nel recupero dei trend.' });
  }
});

// ✅ Recupera i trend salvati nel database
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const savedTrends = await Trend.findAll({
      order: [['lastUpdated', 'DESC']],
      limit: 10, // Limitiamo a 10 risultati recenti
    });

    res.json(savedTrends);
  } catch (error) {
    console.error('❌ Errore nel recupero dei trend salvati:', error.message);
    res.status(500).json({ error: 'Errore interno nel recupero dei trend salvati.' });
  }
});

module.exports = router;
