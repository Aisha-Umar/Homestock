const mongoose = require('mongoose');

const grocerySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  item: {
    type: String,
    required: true,
    trim: true,
  },
  emoji: {
    type: String,
    default: "🛒"
  },
  order: {
    type: Number,
    default: 0, // so new items appear at the end if no order specified
    index: true, // speeds up sorting queries
  },
  quantity: Number,
  store: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'Store',
    type: String,
    required:true
  },
  weeksLasting: {
    type:Number
  }
});
const Grocery = mongoose.model('Grocery', grocerySchema)

module.exports = Grocery