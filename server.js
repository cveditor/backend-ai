const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const cors = require('cors');
const { syncDatabase } = require('./models');
const checkAnalyticsThreshold = require('./utils/checkAnalyticsThreshold');
const { initSocket, sendNotification, broadcastAnalytics } = require('./utils/realtimeNotifications');
const passport = require('passport');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const Redis = require('ioredis');
// const redis = new Redis(process.env.REDIS_URL);
const { handleStripeWebhook } = require('./services/paymentService');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const app = express();
const server = http.createServer(app);

// Inizializza Socket.io
initSocket(server);

// Configura CORS
const corsOptions = {
  origin: [process.env.CLIENT_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

// Sicurezza
app.use(helmet());

// Log delle richieste
app.use(morgan('combined'));

// Rate limiting per proteggere le route sensibili
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // max 100 richieste per IP
  message: 'Troppi tentativi, riprova più tardi.',
});
app.use('/api/auth', limiter);
app.use('/api/payments', limiter);

// Parsing del body
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.raw({ type: 'application/json' }));

// Sessioni PostgreSQL
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
  }),
  secret: process.env.JWT_SECRET || 'supersegreto',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Test connessione al database
syncDatabase()
  .then(() => console.log('✅ Connessione al database riuscita'))
  .catch((err) => console.error('❌ Errore nella connessione al database:', err));

// Importa le tue route
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const trendRoutes = require('./routes/trendRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const triggerRoutes = require('./routes/triggerRoutes');
const planRoutes = require('./routes/PlanRoutes').router;

// Middleware per cache Redis (disabilitato)
// const cache = (req, res, next) => {
//   const key = req.originalUrl;
//   redis.get(key, (err, data) => {
//     if (err) console.error('Errore Redis:', err);
//     if (data) {
//       res.json(JSON.parse(data));
//     } else {
//       next();
//     }
//   });
// };

// Invalida cache dopo aggiornamenti (disabilitato)
// const invalidateCache = (req, res, next) => {
//   const routesToClear = ['/api/analytics', '/api/notifications'];
//   routesToClear.forEach((route) => {
//     redis.del(route, (err, result) => {
//       if (err) console.error('Errore eliminazione cache:', err);
//       else console.log(`Cache invalidata per: ${route}`);
//     });
//   });
//   next();
// };

// Route principali
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/plans', planRoutes);

// Webhook Stripe
app.post('/api/payments/webhook', handleStripeWebhook);

// Cron job per le analytics
cron.schedule('*/1 * * * *', async () => {
  console.log('🔔 Controllo delle analytics...');
  await checkAnalyticsThreshold();
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ message: 'Risorsa non trovata' });
});

// Gestione errori
app.use((err, req, res, next) => {
  console.error('❌ Errore:', err);
  res.status(500).json({ message: 'Errore interno del server' });
});

// Avvio del server
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Errore nell’avvio del server:', err.message);
    process.exit(1);
  }
};

startServer();
