const { Analytics } = require('../models');

// Controlla le soglie e invia notifiche via socket.io
const checkAnalyticsThreshold = async (io) => {
  try {
    const analytics = await Analytics.findAll();

    analytics.forEach((data) => {
      if (data.likes > 100 || data.engagementRate > 0.2) {
        io.emit('newNotification', {
          platform: data.platform,
          message: `🚀 Il tuo post ha superato i 100 like o un engagement rate del 20%!`,
        });
      }
    });
  } catch (error) {
    console.error('❌ Errore nel controllo delle soglie delle analytics:', error.message);
  }
};

module.exports = checkAnalyticsThreshold;
