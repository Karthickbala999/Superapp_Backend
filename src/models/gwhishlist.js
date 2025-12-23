const mongoose = require('mongoose');

const gwhishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  grocery_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grocery',
    required: [true, 'Grocery ID is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

gwhishlistSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

gwhishlistSchema.virtual('grocery', {
  ref: 'Grocery',
  localField: 'grocery_id',
  foreignField: '_id',
  justOne: true
});

gwhishlistSchema.index({ user_id: 1 });
gwhishlistSchema.index({ grocery_id: 1 });

gwhishlistSchema.index({ user_id: 1, grocery_id: 1 }, { unique: true });

const Gwhishlist = mongoose.model('Gwhishlist', gwhishlistSchema);

module.exports = Gwhishlist;
