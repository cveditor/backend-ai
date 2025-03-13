const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, PlanLog } = require('../models');
const passport = require('passport');
const Joi = require('joi');

// Schema di validazione per creare una sessione di checkout
const checkoutSchema = Joi.object({
  plan: Joi.string().valid('pro', 'enterprise').required(),
});

const planPrices = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

// Crea una sessione di pagamento Stripe
router.post('/create-checkout-session', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { error } = checkoutSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { plan } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: planPrices[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { userId: req.user.id, plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Errore nella creazione della sessione di pagamento:', err);
    res.status(500).json({ message: 'Errore durante la creazione della sessione di pagamento' });
  }
});

// Webhook Stripe per aggiornare il piano dell'utente
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;

      await Promise.all([
        User.update({ plan }, { where: { id: userId } }),
        PlanLog.create({ userId, oldPlan: 'base', newPlan: plan }),
      ]);
    }

    res.status(200).send('Webhook ricevuto');
  } catch (err) {
    console.error('Errore nel webhook Stripe:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
