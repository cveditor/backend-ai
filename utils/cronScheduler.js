const cron = require('node-cron');
const axios = require('axios');
const { SocialPost, User } = require('../models');
const sendEmail = require('../config/email');
const sendTelegramMessage = require('../config/telegram');

// Cron job che gira ogni ora (0 * * * *)
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Avvio del cron job per pubblicare i post programmati...');

  try {
    const scheduledPosts = await SocialPost.findAll({
      where: { status: 'scheduled' },
      include: [{ model: User }],
    });

    for (const post of scheduledPosts) {
      const { platform, content, User: user } = post;
      let response;

      if (platform === 'instagram' && user.instagramAccessToken) {
        response = await axios.post(
          'https://graph.facebook.com/v19.0/me/media',
          {
            caption: content,
            access_token: user.instagramAccessToken,
          }
        );
      } else if (platform === 'tiktok' && user.tiktokAccessToken) {
        response = await axios.post(
          'https://open-api.tiktok.com/video/upload/',
          {
            video_url: 'https://example.com/video.mp4',
            caption: content,
          },
          {
            headers: {
              Authorization: `Bearer ${user.tiktokAccessToken}`,
            },
          }
        );
      }

      if (response?.data) {
        await post.update({ status: 'posted' });
        console.log(`✅ Post pubblicato su ${platform} per l'utente ${user.username}`);

        // Notifica email
        if (user.notificationEmail) {
          await sendEmail(
            user.notificationEmail,
            'Post pubblicato con successo!',
            `Il tuo post su ${platform} è stato pubblicato con il contenuto: "${content}".`
          );
        }

        // Notifica Telegram
        if (user.telegramChatId) {
          await sendTelegramMessage(
            user.telegramChatId,
            `🎉 Il tuo post su ${platform} è stato pubblicato: "${content}"`
          );
        }
      }
    }
  } catch (err) {
    console.error('❌ Errore nel cron job:', err.message);
  }
});
