const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const upload = require('../middlewares/upload.middleware');

// List all rooms (optionally by hotel)
router.get('/', roomController.getAllRooms);
// Get room by ID
router.get('/:id', roomController.getRoomById);
// Create room
router.post(
  '/',
  upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  roomController.createRoom
);
// Update room
router.put(
  '/:id',
  upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  roomController.updateRoom
);
// Delete room
router.delete('/:id', roomController.deleteRoom);

module.exports = router; 