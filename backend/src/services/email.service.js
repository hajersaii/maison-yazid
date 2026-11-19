const nodemailer = require('nodemailer');
async function sendContactEmail({ name, email, message }) {
  if (!process.env.SMTP_HOST || !process.env.CONTACT_EMAIL) return;
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined });
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.CONTACT_EMAIL, to: process.env.CONTACT_EMAIL, replyTo: email, subject: `Nouveau message Maison Yazid — ${name}`, text: `Nom : ${name}\nE-mail : ${email}\n\n${message}` });
}
module.exports = { sendContactEmail };
