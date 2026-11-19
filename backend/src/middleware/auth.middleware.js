const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function authMiddleware(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ success: false, error: 'Authentification requise.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'maison-yazid' });
    const user = await User.findById(decoded.id).select('_id role email');
    if (!user) return res.status(401).json({ success: false, error: 'Compte introuvable.' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ success: false, error: 'Session invalide ou expirée. Veuillez vous reconnecter.' }); }
}
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, error: 'Accès réservé à l’administration.' });
  next();
}
module.exports = authMiddleware;
module.exports.adminOnly = adminOnly;
