const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Crea una sessione di pagamento
const createCheckoutSession = async (priceId) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    console.log('✅ Sessione Stripe creata:', session.id);
    return session;
  } catch (error) {
    console.error('❌ Errore Stripe:', error.message);
    throw new Error('Errore nella creazione della sessione di pagamento.');
  }
};

// Gestione webhook Stripe
const handleStripeWebhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Errore webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`✅ Pagamento completato: ${session.id}`);
    // Qui aggiorna il DB con lo stato della sottoscrizione
  }

  res.status(200).send('Evento ricevuto');
};

module.exports = { createCheckoutSession, handleStripeWebhook };
