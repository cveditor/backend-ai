const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SocialPost = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  platform: {
    type: DataTypes.ENUM('instagram', 'twitter', 'tiktok'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Il contenuto del post non può essere vuoto.',
      },
    },
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'posted', 'failed'),
    defaultValue: 'scheduled',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = SocialPost;
