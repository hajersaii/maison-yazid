const authService = require('../services/auth.service');
exports.register = async (req, res) => {
  try { const user = await authService.registerUser(req.body); res.status(201).json({ success: true, user: { id: user._id, username: user.username, email: user.email, role: user.role } }); }
  catch (err) { res.status(400).json({ success: false, error: err.message }); }
};
exports.login = async (req, res) => {
  try { const result = await authService.loginUser(req.body); res.json({ success: true, token: result.token, user: { id: result.user._id, username: result.user.username, email: result.user.email, role: result.user.role } }); }
  catch (err) { res.status(401).json({ success: false, error: err.message }); }
};
