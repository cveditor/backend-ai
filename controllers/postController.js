const getAllPosts = (req, res) => {
    try {
      // Recupera tutti i post (simulazione)
      res.status(200).json({ message: 'Tutti i post recuperati con successo!' });
    } catch (error) {
      console.error('❌ Errore nel recupero dei post:', error.message);
      res.status(500).json({ error: 'Errore nel recupero dei post' });
    }
  };
  
  const createPost = (req, res) => {
    try {
      const { content } = req.body;
      if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Il contenuto del post è obbligatorio' });
      }
  
      res.status(201).json({ message: 'Post creato con successo!', data: content });
    } catch (error) {
      console.error('❌ Errore nella creazione del post:', error.message);
      res.status(500).json({ error: 'Errore nella creazione del post' });
    }
  };
  
  module.exports = { getAllPosts, createPost };
  