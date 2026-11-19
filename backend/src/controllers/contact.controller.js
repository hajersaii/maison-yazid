const Message = require('../models/Message');
const validator = require('validator');
const emailService = require('../services/email.service');
exports.sendMessage = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const message = String(req.body.message || '').trim();
    if (!name || name.length > 100 || !validator.isEmail(email) || email.length > 160 || !message || message.length > 3000) return res.status(400).json({ success: false, error: 'Veuillez vérifier les champs du formulaire.' });
    await Message.create({ name, email, message });
    try { await emailService.sendContactEmail({ name, email, message }); } catch (mailError) { console.warn('E-mail non envoyé (le message est conservé en base) :', mailError.message); }
    res.status(201).json({ success: true, message: 'Message reçu.' });
  } catch (err) { res.status(500).json({ success: false, error: 'Impossible d’enregistrer le message pour le moment.' }); }
};
