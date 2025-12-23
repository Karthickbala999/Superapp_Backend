const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  toggleFaqStatus,
  deleteFaq
} = require('../controllers/faq.controller');

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// Get all FAQs with pagination and search
router.get('/', getAllFaqs);

// Get FAQ by ID
router.get('/:id', getFaqById);

// Create new FAQ
router.post('/', createFaq);

// Update FAQ
router.put('/:id', updateFaq);

// Toggle FAQ status
router.patch('/:id/toggle-status', toggleFaqStatus);

// Delete FAQ
router.delete('/:id', deleteFaq);

module.exports = router; 