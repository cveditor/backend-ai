const axios = require('axios');
const { tiktok } = require('../config/socialMedia');

const postToTikTok = async (videoUrl, caption) => {
  try {
    const response = await axios.post(
      'https://open-api.tiktok.com/video/upload/',
      {
        video_url: videoUrl,
        caption,
      },
      {
        headers: {
          Authorization: `Bearer ${tiktok.accessToken}`,
        },
      }
    );

    console.log('✅ Video pubblicato su TikTok:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Errore TikTok:', error.response?.data || error.message);
    throw new Error('Errore nella pubblicazione su TikTok.');
  }
};

module.exports = { postToTikTok };
