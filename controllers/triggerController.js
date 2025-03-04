const Trigger = require('../models/Trigger');

const createTrigger = async (req, res) => {
  const { platform, triggerType, keyword, responseType, responseMessage } = req.body;
  const userId = req.userId; // preso dal middleware JWT

  try {
    const newTrigger = await Trigger.create({
      userId,
      platform,
      triggerType,
      keyword,
      responseType,
      responseMessage,
    });

    res.status(201).json(newTrigger);
  } catch (error) {
    console.error('❌ Errore nella creazione del trigger:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const getTriggers = async (req, res) => {
  const userId = req.userId;

  try {
    const triggers = await Trigger.findAll({ where: { userId } });
    res.status(200).json(triggers);
  } catch (error) {
    console.error('❌ Errore nel recupero dei trigger:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const deleteTrigger = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const trigger = await Trigger.findByPk(id);
    if (!trigger || trigger.userId !== userId) {
      return res.status(404).json({ message: 'Trigger non trovato' });
    }

    await trigger.destroy();
    res.status(200).json({ message: 'Trigger eliminato con successo!' });
  } catch (error) {
    console.error('❌ Errore nella cancellazione del trigger:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTrigger, getTriggers, deleteTrigger };
