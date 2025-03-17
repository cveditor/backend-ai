const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Assicurati che questo import sia corretto

const Trend = sequelize.define('Trend', {
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['tiktok', 'instagram']],
    },
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mentions: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Numero di volte in cui è stato menzionato
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true, // Aggiunge createdAt e updatedAt
});

module.exports = Trend;
