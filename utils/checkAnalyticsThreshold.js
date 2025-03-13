const { Analytics } = require('../models');
const { sendNotification, broadcastAnalytics } = require('./realtimeNotifications');

// Controlla le soglie delle analytics e invia notifiche
const checkAnalyticsThreshold = async () => {
  try {
    const analytics = await Analytics.findAll();

    analytics.forEach((data) => {
      if (data.likes > 100 || data.engagementRate > 0.2) {
        sendNotification(data.userId, `🚀 Il tuo post su ${data.platform} ha superato i 100 like o un engagement rate del 20%!`);
      }
    });

    // Emetti un aggiornamento globale per le analytics in tempo reale
    broadcastAnalytics(analytics);
  } catch (error) {
    console.error('❌ Errore nel controllo delle soglie delle analytics:', error.message);
  }
};

module.exports = checkAnalyticsThreshold;
