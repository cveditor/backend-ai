const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const SocialPost = require('./Post');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: SocialPost,
      key: 'id',
    },
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  followers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  engagementRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    get() {
      const likes = this.getDataValue('likes') || 0;
      const comments = this.getDataValue('comments') || 0;
      const shares = this.getDataValue('shares') || 0;
      const followers = this.getDataValue('followers') || 1; // Evita divisioni per 0
      return ((likes + comments + shares) / followers) * 100;
    },
  },
}, {
  timestamps: true,
});

SocialPost.hasOne(Analytics, { foreignKey: 'postId', onDelete: 'CASCADE' });
Analytics.belongsTo(SocialPost, { foreignKey: 'postId' });

module.exports = Analytics;
