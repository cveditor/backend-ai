const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non è definito. Assicurati che il file .env sia caricato correttamente.');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Necessario per Render
    },
  },
});

sequelize.authenticate()
  .then(() => console.log('✅ Connessione a PostgreSQL riuscita!'))
  .catch(err => console.error('❌ Errore nella connessione a PostgreSQL:', err));

module.exports = sequelize;
