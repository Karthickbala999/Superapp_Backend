const Room = require('../models/room');
const { Hotel } = require('../models');

// List all rooms (optionally by hotel)
exports.getAllRooms = async (req, res) => {
  try {
    const hotelId = req.query.hotel_id;
    const where = hotelId ? { hotel_id: hotelId } : {};
    const rooms = await Room.find(where).populate('hotel');
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching rooms', error: error.message });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching room', error: error.message });
  }
};

// Create room
exports.createRoom = async (req, res) => {
  try {
    // Debug logs
    console.log('ROOM CREATE req.body:', JSON.stringify(req.body));
    console.log('ROOM CREATE req.files:', JSON.stringify(req.files));

    // Handle amenities as array (robust)
    let amenities = [];
    if (req.body['amenities[]']) {
      amenities = Array.isArray(req.body['amenities[]']) ? req.body['amenities[]'] : [req.body['amenities[]']];
    } else if (req.body.amenities) {
      amenities = Array.isArray(req.body.amenities) ? req.body.amenities : [req.body.amenities];
    }

    // Handle file uploads
    const mainImageFile = req.files && req.files['main_image'] ? req.files['main_image'][0] : null;
    const imagesFiles = req.files && req.files['images'] ? req.files['images'] : [];

    // Build file paths
    const main_image = mainImageFile ? `hotels/${mainImageFile.filename}` : undefined;
    const images = imagesFiles.map(f => `others/${f.filename}`);

    // Convert fields to correct types
    const roomData = {
      hotel_id: req.body.hotel_id,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      capacity: req.body.capacity ? Number(req.body.capacity) : undefined,
      price_per_night: req.body.price_per_night ? Number(req.body.price_per_night) : undefined,
      room_number: req.body.room_number,
      status: req.body.status,
      amenities,
      main_image,
      images
    };

    // Remove undefined or empty string fields
    Object.keys(roomData).forEach(key => {
      if (roomData[key] === undefined || roomData[key] === '') {
        delete roomData[key];
      }
    });

    const room = await Room.create(roomData);
    res.status(201).json({ success: true, data: room, message: 'Room created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating room', error: error.message });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // Debug logs
    console.log('ROOM UPDATE req.body:', req.body);
    console.log('ROOM UPDATE req.files:', req.files);

    // Handle amenities as array (robust)
    let amenities = [];
    if (req.body['amenities[]']) {
      amenities = Array.isArray(req.body['amenities[]']) ? req.body['amenities[]'] : [req.body['amenities[]']];
    } else if (req.body.amenities) {
      amenities = Array.isArray(req.body.amenities) ? req.body.amenities : [req.body.amenities];
    }

    // Handle file uploads
    const mainImageFile = req.files && req.files['main_image'] ? req.files['main_image'][0] : null;
    const imagesFiles = req.files && req.files['images'] ? req.files['images'] : [];

    // Build file paths
    const main_image = mainImageFile ? `hotels/${mainImageFile.filename}` : undefined;
    const newImages = imagesFiles.map(f => `others/${f.filename}`);

    // Handle image deletion
    let imagesToDelete = [];
    if (req.body.imagesToDelete) {
      try {
        imagesToDelete = JSON.parse(req.body.imagesToDelete);
      } catch (e) {
        console.log('Error parsing imagesToDelete:', e);
      }
    }

    // Build update data
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      capacity: req.body.capacity ? Number(req.body.capacity) : undefined,
      price_per_night: req.body.price_per_night ? Number(req.body.price_per_night) : undefined,
      room_number: req.body.room_number,
      status: req.body.status,
      amenities
    };

    // Handle main image
    if (main_image) {
      updateData.main_image = main_image;
    }

    // Handle images array - combine existing (minus deleted) with new images
    if (newImages.length > 0 || imagesToDelete.length > 0) {
      let existingImages = room.images || [];
      
      // Remove images that should be deleted
      if (imagesToDelete.length > 0) {
        existingImages = existingImages.filter(img => !imagesToDelete.includes(img));
      }
      
      // Add new images
      updateData.images = [...existingImages, ...newImages];
    }

    // Remove undefined or empty string fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: updatedRoom, message: 'Room updated successfully' });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(400).json({ success: false, message: 'Error updating room', error: error.message });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting room', error: error.message });
  }
}; 