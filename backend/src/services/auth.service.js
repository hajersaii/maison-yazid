const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser({ username, email, password }) {
  if (!username || !email || !password || password.length < 8) throw new Error('Nom, e-mail et mot de passe (8 caractères minimum) requis.');
  const normalizedEmail = String(email).trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) throw new Error('Cette adresse e-mail est déjà utilisée.');
  const user = await User.create({ username: String(username).trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), role: 'customer' });
  return user;
}
async function loginUser({ email, password }) {
  if (!email || !password) throw new Error('Adresse e-mail et mot de passe requis.');
  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) throw new Error('Identifiants incorrects.');
  if (!process.env.JWT_SECRET) throw new Error('Configuration JWT manquante sur le serveur.');
  const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h', issuer: 'maison-yazid' });
  return { user, token };
}
async function ensureAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Maison Yazid' } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD non configurés : le compte administrateur initial ne sera pas créé.');
    return;
  }
  const email = ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') { existing.role = 'admin'; await existing.save(); }
    return;
  }
  await User.create({ username: ADMIN_NAME, email, password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'admin' });
  console.log('Compte administrateur initial créé.');
}
module.exports = { registerUser, loginUser, ensureAdmin };
