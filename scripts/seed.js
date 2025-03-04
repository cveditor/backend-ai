const dotenv = require('dotenv');
const sequelize = require('../config/db');
const User = require('../models/User');

dotenv.config();

const seedSubscriptions = async () => {
  try {
    await sequelize.sync(); // Sincronizza il database

    // Popola le sottoscrizioni
    await User.bulkCreate([
      { username: 'user1', email: 'user1@example.com', password: 'password123', subscriptionPlan: 'basic' },
      { username: 'user2', email: 'user2@example.com', password: 'password123', subscriptionPlan: 'premium' },
      { username: 'user3', email: 'user3@example.com', password: 'password123', subscriptionPlan: 'pro' },
    ]);

    console.log('✅ Dati iniziali aggiunti.');
    process.exit();
  } catch (err) {
    console.error('❌ Errore nel popolamento:', err);
    process.exit(1);
  }
};

seedSubscriptions();
