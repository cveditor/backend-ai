const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Trigger = sequelize.define('Trigger', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  platform: {
    type: DataTypes.ENUM('instagram', 'tiktok'),
    allowNull: false,
  },
  triggerType: {
    type: DataTypes.ENUM('new_follower', 'comment'),
    allowNull: false,
  },
  keyword: {
    type: DataTypes.STRING,
    allowNull: true, // per i commenti
  },
  responseType: {
    type: DataTypes.ENUM('dm', 'comment'),
    allowNull: false,
  },
  responseMessage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

User.hasMany(Trigger, { foreignKey: 'userId', onDelete: 'CASCADE' });
Trigger.belongsTo(User, { foreignKey: 'userId' });

module.exports = Trigger;
