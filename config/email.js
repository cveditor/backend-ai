const nodemailer = require('nodemailer');
require('dotenv').config();

// Controllo delle variabili d’ambiente
if (!process.env.NOTIFICATION_EMAIL || !process.env.NOTIFICATION_PASSWORD) {
  console.error('❌ Configurazione email mancante nel file .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.NOTIFICATION_EMAIL,
    pass: process.env.NOTIFICATION_PASSWORD,
  },
});

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.NOTIFICATION_EMAIL,
      to,
      subject,
      text,
      ...(html && { html }), // Se html è presente, lo aggiunge
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email inviata con successo:', info.response);
  } catch (error) {
    console.error('❌ Errore nell’invio dell’email:', error.message);
  }
};

module.exports = sendEmail;
