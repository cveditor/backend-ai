const axios = require('axios');
const openai = require('openai');

openai.apiKey = process.env.OPENAI_API_KEY;

// Ottieni i trending topic da TikTok e Instagram
const getTrendingTopics = async (platform) => {
  try {
    let url, headers;

    if (platform === 'tiktok') {
      url = 'https://open-api.tiktokglobalshop.com/api/hashtag/trending';
      headers = { Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}` };
    } else if (platform === 'instagram') {
      url = `https://graph.facebook.com/v17.0/${process.env.INSTAGRAM_USER_ID}/recently_searched_hashtags`;
      headers = { Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}` };
    } else {
      throw new Error('Piattaforma non supportata');
    }

    // Timeout di 5 secondi per le richieste
    const response = await axios.get(url, { headers, timeout: 5000 });

    if (!response.data || !response.data.data) {
      throw new Error('Dati non disponibili o formattati in modo errato');
    }

    return platform === 'tiktok'
      ? response.data.data.hashtags.map((tag) => tag.name)
      : response.data.data.map((tag) => tag.name);
  } catch (error) {
    console.error(`❌ Errore nei trend da ${platform}: ${error.message}`);
    return []; // Ritorna un array vuoto per evitare crash
  }
};

// Genera idee AI per post virali basati sui trend
const generatePostIdeas = async (trend) => {
  try {
    const completion = await openai.ChatCompletion.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Sei un esperto di social media marketing.' },
        { role: 'user', content: `Suggerisci un post virale su questo trend: "${trend}". Crea una caption e 3 hashtag.` },
      ],
    });

    return completion.choices[0]?.message?.content || 'Nessun suggerimento disponibile.';
  } catch (error) {
    console.error('❌ Errore AI nel generare idee per il post:', error.message);
    return 'Errore nella generazione del post.';
  }
};

module.exports = { getTrendingTopics, generatePostIdeas };
