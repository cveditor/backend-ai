const express = require('express');
const router = express.Router();
const { handleStripeWebhook, createCheckoutSession } = require('../services/paymentService');

if (!handleStripeWebhook || !createCheckoutSession) {
  console.error('❌ Errore: Le funzioni di pagamento non sono definite. Controlla paymentService.js');
  process.exit(1);
}

// Webhook Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Creazione di una sessione di pagamento
router.post('/checkout', async (req, res) => {
  try {
    const session = await createCheckoutSession(req.body.plan);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Errore nella creazione della sessione di pagamento:', err);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

module.exports = router;
