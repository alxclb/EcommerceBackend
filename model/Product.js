const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0, required: true },
  description: { type: String, required: true },
  image: {
    img: { type: String, required: true },
    id: { type: String, required: true }
  },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0, required: true }
});

module.exports = mongoose.model("Product", productSchema);
