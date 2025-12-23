const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const controller = require('../controllers/recentTaxiLocation.controller');

router.use(protect);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

module.exports = router; 