const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const prices = {
  basic: 400,
  premium: 1000,
  pro: 2500,
};

router.post('/create-checkout-session', async (req, res) => {
  const { plan } = req.body;

  if (!prices[plan]) {
    return res.status(400).json({ error: 'Piano non valido. Scegli tra basic, premium o pro.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${plan} Plan` },
            unit_amount: prices[plan],
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('❌ Errore nella creazione della sessione Stripe:', err.message);
    res.status(500).json({ error: 'Errore durante la creazione della sessione di pagamento.' });
  }
});

module.exports = router;
