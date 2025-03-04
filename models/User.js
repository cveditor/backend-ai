const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Deve essere un indirizzo email valido.',
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('basic', 'premium', 'pro'),
    defaultValue: 'basic',
  },
  instagramAccessToken: DataTypes.STRING,
  tiktokAccessToken: DataTypes.STRING,
  twitterAccessToken: DataTypes.STRING,
  notificationEmail: DataTypes.STRING,
  notificationPassword: DataTypes.STRING,
}, {
  timestamps: true,
});

module.exports = User;
