const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/history', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const whereClause = { userId };
    if (status === 'read') whereClause.isRead = true;
    if (status === 'unread') whereClause.isRead = false;

    const { rows: notifications, count } = await Notification.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      notifications,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalCount: count,
    });
  } catch (err) {
    console.error('❌ Errore nella paginazione delle notifiche:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
