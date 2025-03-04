const express = require('express');
const router = express.Router();
const { createTrigger, getTriggers, deleteTrigger } = require('../controllers/triggerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createTrigger); // Crea un nuovo trigger
router.get('/', authMiddleware, getTriggers); // Ottieni tutti i trigger dell’utente
router.delete('/:id', authMiddleware, deleteTrigger); // Elimina un trigger

module.exports = router;
