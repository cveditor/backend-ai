
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Per Render
    },
  },
});

sequelize.authenticate()
  .then(() => console.log('✅ Connessione al database PostgreSQL riuscita!'))
  .catch((err) => console.error('❌ Errore nella connessione al database:', err));

module.exports = sequelize;

