const sequelize = require('../config/db');
const User = require('./User');
const Notification = require('./Notification');
const Analytics = require('./Analytics');
const SocialPost = require('./Post');
const Trend = require('./Trend'); // ✅ Importa il modello Trend

// Relazioni tra i modelli
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SocialPost, { foreignKey: 'userId', onDelete: 'CASCADE' });
SocialPost.belongsTo(User, { foreignKey: 'userId' });

SocialPost.hasOne(Analytics, { foreignKey: 'postId', onDelete: 'CASCADE' });
Analytics.belongsTo(SocialPost, { foreignKey: 'postId' });

// Relazione tra User e Trend (un utente può monitorare più trend)
User.hasMany(Trend, { foreignKey: 'userId', onDelete: 'CASCADE' });
Trend.belongsTo(User, { foreignKey: 'userId' });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database sincronizzato correttamente.');
  } catch (err) {
    console.error('❌ Errore nella sincronizzazione del database:', err);
  }
};

module.exports = { User, Notification, Analytics, SocialPost, Trend, syncDatabase };
