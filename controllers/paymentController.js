const { createCheckoutSession } = require('../config/payment');
const User = require('../models/User');

const createPaymentSession = async (req, res) => {
  try {
    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID obbligatorio' });
    }

    const session = await createCheckoutSession(priceId);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('❌ Errore nella creazione della sessione di pagamento:', error.message);
    res.status(500).json({ error: 'Errore nella creazione della sessione di pagamento' });
  }
};

module.exports = { createPaymentSession };
