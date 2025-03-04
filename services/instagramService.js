const axios = require('axios');
const { instagram } = require('../config/socialMedia');

// Pubblica un post su Instagram
const postContent = async ({ imageUrl, caption }) => {
  try {
    const mediaResponse = await axios.post(
      'https://graph.facebook.com/v19.0/me/media',
      {
        image_url: imageUrl,
        caption,
        access_token: instagram.accessToken,
      }
    );

    const mediaId = mediaResponse.data.id;

    const publishResponse = await axios.post(
      'https://graph.facebook.com/v19.0/me/media_publish',
      {
        creation_id: mediaId,
        access_token: instagram.accessToken,
      }
    );

    console.log('✅ Post pubblicato su Instagram:', publishResponse.data);
    return publishResponse.data;
  } catch (error) {
    console.error('❌ Errore Instagram:', error.response?.data || error.message);
    throw new Error('Errore nella pubblicazione su Instagram.');
  }
};

// Invia un DM su Instagram
const sendDM = async (userId, message) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${userId}/messages`,
      {
        recipient: { id: userId },
        message: { text: message },
        access_token: instagram.accessToken,
      }
    );

    console.log('✅ DM inviato su Instagram:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Errore DM Instagram:', error.response?.data || error.message);
    throw new Error('Errore nell’invio del DM.');
  }
};

module.exports = { postContent, sendDM };
