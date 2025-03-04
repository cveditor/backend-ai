const axios = require('axios');
require('dotenv').config();

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN non definito nel file .env');
  process.exit(1);
}

const sendTelegramMessage = async (chatId, message) => {
  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
    }, { timeout: 5000 });

    console.log('📲 Messaggio Telegram inviato con successo:', response.data);
  } catch (error) {
    console.error('❌ Errore nell’invio del messaggio Telegram:', error.response?.data?.description || error.message);
  }
};

module.exports = sendTelegramMessage;
