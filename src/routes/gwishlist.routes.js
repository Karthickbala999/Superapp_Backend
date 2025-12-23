// src/routes/gwishlist.routes.js
const express = require('express');
const router  = express.Router();

const Gwhishlist = require('../models/gwhishlist');            // Mongoose model
const { protect }   = require('../middlewares/auth.middleware'); // JWT‑auth middleware

// ---------------------------------------------------------------------------
// ➕ POST /api/gwishlist       – Add an item to the wishlist
// ---------------------------------------------------------------------------
// ➕ Add to wishlist
// ➕ Add to wishlist
router.post('/', protect, async (req, res) => {
  const { grocery_id } = req.body;
  const user_id = req.user.id;

  try {
    // Validate grocery_id
    if (!grocery_id) {
      return res.status(400).json({ error: 'grocery_id is required' });
    }

    // Check if item already exists in wishlist
    const existing = await Gwhishlist.findOne({
      user_id, grocery_id
    });

    if (existing) {
      return res.status(200).json(existing); // 🟩 Return the existing row
    }

    // Create new wishlist item
    const newItem = await Gwhishlist.create({
      user_id,
      grocery_id
    });

    // Populate the grocery data before returning
    const populatedItem = await Gwhishlist.findById(newItem._id).populate('grocery');
    res.status(201).json(populatedItem); // ✅ Return populated row
  } catch (error) {
    console.error('Add wishlist error:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Item already exists in wishlist' });
    }
    
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});



// ---------------------------------------------------------------------------
// 🔁 GET /api/gwishlist        – Fetch all wishlist items for logged‑in user
// ---------------------------------------------------------------------------
router.get('/', protect, async (req, res) => {
  try {
    const items = await Gwhishlist.find({
      user_id: req.user.id
    }).populate('grocery').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Fetch‑wishlist error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// ---------------------------------------------------------------------------
// ❌ DELETE /api/gwishlist/:id – Remove a single item from the wishlist
// ---------------------------------------------------------------------------
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Gwhishlist.findOneAndDelete({
      _id: req.params.id, user_id: req.user.id
    });

    if (deleted) {
      return res.json({ message: 'Removed from wishlist' });
    }
    res.status(404).json({ error: 'Item not found' });
  } catch (err) {
    console.error('Delete‑wishlist error:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
