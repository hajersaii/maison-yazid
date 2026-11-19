const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  image: { type: String, default: '/assets/images/rideau1.jpg' }
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);
