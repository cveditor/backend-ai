const express = require('express');
const router = express.Router();
const { analyzePost } = require('../services/postAnalyzerService');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Analizza un post
router.post('/analyze', ensureAuthenticated, async (req, res) => {
  try {
    const { postContent } = req.body;
    if (!postContent) {
      return res.status(400).json({ message: 'Contenuto del post richiesto' });
    }

    const analysis = await analyzePost(postContent);
    res.json({ analysis });
  } catch (err) {
    console.error('Errore nell analisi del post:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

module.exports = router;
