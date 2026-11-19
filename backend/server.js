require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { ensureAdmin } = require('./src/services/auth.service');
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await connectDB();
    await ensureAdmin();
    app.listen(PORT, () => console.log(`Maison Yazid disponible sur http://localhost:${PORT}`));
  } catch (error) {
    console.error('Démarrage impossible :', error.message);
    process.exit(1);
  }
})();
