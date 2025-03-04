const sequelize = require('../config/db');
const User = require('./User');
const Notification = require('./Notification');
const Analytics = require('./Analytics');
const SocialPost = require('./Post');

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SocialPost, { foreignKey: 'userId', onDelete: 'CASCADE' });
SocialPost.belongsTo(User, { foreignKey: 'userId' });

SocialPost.hasOne(Analytics, { foreignKey: 'postId', onDelete: 'CASCADE' });
Analytics.belongsTo(SocialPost, { foreignKey: 'postId' });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database sincronizzato correttamente.');
  } catch (err) {
    console.error('❌ Errore nella sincronizzazione del database:', err);
  }
};

module.exports = { User, Notification, Analytics, SocialPost, syncDatabase };
