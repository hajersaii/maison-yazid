const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 3000 }
}, { timestamps: true });
module.exports = mongoose.model('Message', messageSchema);
