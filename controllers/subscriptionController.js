const User = require('../models/User');

const updateSubscription = async (req, res) => {
  const { userId, plan } = req.body;

  if (!userId || !plan) {
    return res.status(400).json({ message: 'userId e plan sono obbligatori' });
  }

  if (!['basic', 'premium', 'pro'].includes(plan)) {
    return res.status(400).json({ message: 'Piano non valido' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    user.subscriptionPlan = plan;
    await user.save();

    console.log(`✅ Piano aggiornato per l'utente ${user.username}: ${plan}`);
    res.status(200).json({ message: 'Piano aggiornato con successo', user });
  } catch (error) {
    console.error('❌ Errore durante l’aggiornamento del piano:', error.message);
    res.status(500).json({ message: 'Errore durante l’aggiornamento del piano' });
  }
};

module.exports = { updateSubscription };
