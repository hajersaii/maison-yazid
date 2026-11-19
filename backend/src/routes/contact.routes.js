const router = require('express').Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth.middleware');
const adminOnly = auth.adminOnly;
const controller = require('../controllers/contact.controller');
router.post('/', controller.sendMessage);
router.get('/', auth, adminOnly, async (_req, res) => { const data = await Message.find().sort({ createdAt: -1 }).limit(200).lean(); res.json({ success: true, data }); });
module.exports = router;
