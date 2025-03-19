const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const { syncDatabase } = require('./models');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { handleStripeWebhook } = require('./services/paymentService');
const checkAnalyticsThreshold = require('./utils/checkAnalyticsThreshold');
const { initSocket } = require('./utils/realtimeNotifications');

dotenv.config();

const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1);

// Configura CORS
app.use(cors({
  origin: [process.env.CLIENT_URL],
  credentials: true,
}));

// Sicurezza e logging
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Troppi tentativi, riprova più tardi.',
});
app.use('/api/auth', limiter);
app.use('/api/payments', limiter);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'application/json' }));

// Connessione al database PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log('✅ Connessione al database PostgreSQL riuscita!'))
  .catch(err => console.error('❌ Errore nella connessione a PostgreSQL:', err));

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
require('./config/passport');

// Inizializza Socket.io
initSocket(server);

// Importa le route
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const trendRoutes = require('./routes/trendRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const triggerRoutes = require('./routes/triggerRoutes');
const planRoutes = require('./routes/planRoutes');


// Registra le route
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/plans', planRoutes);

// Webhook Stripe
app.post('/api/payments/webhook', handleStripeWebhook);

// Cron job per le analytics
const cron = require('node-cron');
cron.schedule('*/1 * * * *', async () => {
  console.log('🔔 Controllo delle analytics...');
  await checkAnalyticsThreshold();
});

// Route di test
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend attivo!' });
});

// Gestione errori
app.use((req, res) => {
  res.status(404).json({ message: 'Risorsa non trovata' });
});

app.use((err, req, res, next) => {
  console.error('❌ Errore:', err);
  res.status(500).json({ message: 'Errore interno del server' });
});

// Avvio del server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await syncDatabase();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Errore nell’avvio del server:', err);
  }
});
