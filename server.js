const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const { syncDatabase } = require('./models');
const checkAnalyticsThreshold = require('./utils/realtimeNotifications');
const { handleStripeWebhook } = require('./services/paymentService');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const trendRoutes = require('./routes/trendRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const triggerRoutes = require('./routes/triggerRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(bodyParser.raw({ type: 'application/json' }));

// Webhook Stripe (JSON raw richiesto da Stripe)
app.post('/api/payments/webhook', handleStripeWebhook);

// Rotte API
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/triggers', triggerRoutes);

// Cron job per controllare le analytics (ogni minuto)
cron.schedule('*/1 * * * *', () => {
  console.log('🔔 Controllo delle analytics in corso...');
  checkAnalyticsThreshold(io);
});

// Socket.io per notifiche real-time
io.on('connection', (socket) => {
  console.log('✅ Utente connesso via WebSocket:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Utente disconnesso:', socket.id);
  });
});

// Sincronizza il DB prima di avviare il server
const startServer = async () => {
  try {
    await syncDatabase();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server in esecuzione su http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Errore nell’avvio del server:', err.message);
    process.exit(1); // Chiude l'app se il DB non è connesso
  }
};

startServer();
