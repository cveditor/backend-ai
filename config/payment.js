const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

// Controlla che la chiave Stripe sia definita
if (!process.env.STRIPE_SECRET_KEY || !process.env.CLIENT_URL) {
  console.error('❌ Configurazione Stripe mancante nel file .env');
  process.exit(1);
}

// Crea una sessione di checkout Stripe per gli abbonamenti
const createCheckoutSession = async (priceId) => {
  try {
    if (!priceId) throw new Error('Price ID non fornito');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    return session;
  } catch (error) {
    console.error('❌ Errore nella creazione della sessione di pagamento:', error.message);
    throw new Error('Errore nel pagamento: ' + error.message);
  }
};

module.exports = { createCheckoutSession };
