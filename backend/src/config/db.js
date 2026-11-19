const mongoose = require('mongoose');
module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI est absent du fichier .env');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connecté.');
};
