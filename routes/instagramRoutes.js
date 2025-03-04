const express = require('express');
const router = express.Router();
const { postContent, sendDM } = require('../services/instagramService');
require('dotenv').config();

if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
  console.error('❌ INSTAGRAM_ACCESS_TOKEN non definito nel file .env');
  process.exit(1);
}

// Pubblicazione post su Instagram
router.post('/post', async (req, res) => {
  const { imageUrl, caption } = req.body;
  try {
    const result = await postContent(process.env.INSTAGRAM_ACCESS_TOKEN, { imageUrl, caption });
    res.status(200).json({ message: 'Post pubblicato con successo!', data: result });
  } catch (error) {
    console.error('❌ Errore nella pubblicazione del post:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Invio DM su Instagram
router.post('/dm', async (req, res) => {
  const { userId, message } = req.body;
  try {
    const result = await sendDM(process.env.INSTAGRAM_ACCESS_TOKEN, userId, message);
    res.status(200).json({ message: 'DM inviato con successo!', data: result });
  } catch (error) {
    console.error('❌ Errore nell’invio del DM:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
