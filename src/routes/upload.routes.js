const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Upload single image
router.post('/image', protect, authorize('admin'), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Return the file URL with correct subdirectory
    const subdirectory = req.file.destination.split('uploads/')[1] || 'others';
    const imageUrl = `/uploads/${subdirectory}/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
});

// Upload multiple images
router.post('/images', protect, authorize('admin'), upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Return array of file URLs with correct subdirectories
    const imageUrls = req.files.map(file => {
      const subdirectory = file.destination.split('uploads/')[1] || 'others';
      return `/uploads/${subdirectory}/${file.filename}`;
    });
    
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      urls: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images'
    });
  }
});

module.exports = router;
