const express = require('express');
const router = express.Router();
const { updateSubscription } = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// Modifica il piano di abbonamento dell'utente autenticato
router.post('/update', authMiddleware, updateSubscription);

module.exports = router;
