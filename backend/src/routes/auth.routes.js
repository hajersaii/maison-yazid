const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, error: 'Trop de tentatives. Réessayez dans 15 minutes.' } });
router.post('/register', controller.register);
router.post('/login', loginLimiter, controller.login);
module.exports = router;
