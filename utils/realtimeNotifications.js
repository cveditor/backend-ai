const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Utente connesso:', socket.id);

    // Unisci l'utente a una stanza personalizzata
    socket.on('joinRoom', (userId) => {
      socket.join(userId);
      console.log(`🔒 Utente ${socket.id} unito alla stanza: ${userId}`);
    });

    // Notifica personalizzata a un utente specifico
    socket.on('sendNotification', ({ userId, message, priority = 'normal' }) => {
      io.to(userId).emit('notification', { message, priority });
      console.log(`📩 [${priority}] Notifica inviata a ${userId}: ${message}`);
    });

    // Broadcast globale per aggiornamenti analytics
    socket.on('updateAnalytics', (data) => {
      io.emit('analyticsUpdate', data);
      console.log('📊 Analytics aggiornate:', data);
    });

    // Gestione delle disconnessioni
    socket.on('disconnect', () => {
      console.log('❌ Utente disconnesso:', socket.id);
    });
  });
};

// Funzione per inviare notifiche esterne (da altri file)
const sendNotification = (userId, message, priority = 'normal') => {
  if (io) {
    io.to(userId).emit('notification', { message, priority });
    console.log(`📢 [${priority}] Notifica esterna inviata a ${userId}: ${message}`);
  }
};

// Funzione per trasmettere analytics in tempo reale
const broadcastAnalytics = (data) => {
  if (io) {
    io.emit('analyticsUpdate', data);
    console.log('📊 Analytics broadcast:', data);
  }
};

// Funzione per inviare notifiche a gruppi (stanze)
const sendGroupNotification = (room, message, priority = 'normal') => {
  if (io) {
    io.to(room).emit('groupNotification', { message, priority });
    console.log(`📢 [${priority}] Notifica inviata alla stanza ${room}: ${message}`);
  }
};

module.exports = { initSocket, sendNotification, broadcastAnalytics, sendGroupNotification };

