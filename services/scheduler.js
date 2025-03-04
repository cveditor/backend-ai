const cron = require('node-cron');
const { postContent } = require('./instagramService');

const schedulePost = (userId, content, scheduleTime) => {
  cron.schedule(scheduleTime, async () => {
    try {
      console.log('⏳ Pubblicazione post...');
      await postContent(content);
      console.log('✅ Post pubblicato con successo');
    } catch (error) {
      console.error('❌ Errore nella pubblicazione programmata:', error.message);
    }
  });
};

module.exports = { schedulePost };
