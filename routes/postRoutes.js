const express = require('express');
const router = express.Router();
const { getAllPosts, createPost } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAllPosts); // Richiede autenticazione
router.post('/', authMiddleware, createPost);

module.exports = router;
