const express = require('express');
const router = express.Router();

// Placeholder for taxi routes
router.get('/', (req, res) => {
  res.json({ message: 'Taxi route' });
});

module.exports = router; 