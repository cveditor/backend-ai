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
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Alter per aggiornare le colonne
    console.log('✅ Database sincronizzato correttamente.');
  } catch (err) {
    console.error('❌ Errore nella sincronizzazione del database:', err);
  }
};

sequelize.authenticate()
  .then(() => console.log('✅ Connessione a PostgreSQL riuscita!'))
  .catch(err => console.error('❌ Errore nella connessione a PostgreSQL:', err));

module.exports = sequelize;
