require('dotenv').config();

// Controlla che tutte le chiavi API siano presenti
const checkEnvVariable = (key) => {
  if (!process.env[key]) {
    console.error(`❌ La variabile d'ambiente ${key} non è definita.`);
    process.exit(1);
  }
};

// Verifica per tutte le piattaforme
['TWITTER_API_KEY', 'INSTAGRAM_APP_ID', 'TIKTOK_CLIENT_KEY'].forEach(checkEnvVariable);

module.exports = {
  twitter: {
    apiKey: process.env.TWITTER_API_KEY,
    apiSecretKey: process.env.TWITTER_API_SECRET_KEY,
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID,
    appSecret: process.env.INSTAGRAM_APP_SECRET,
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
  },
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    accessToken: process.env.TIKTOK_ACCESS_TOKEN,
  },
};
