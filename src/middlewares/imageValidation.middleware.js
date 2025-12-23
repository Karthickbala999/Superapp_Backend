const path = require('path');

const validateImage = (req, res, next) => {
  // Handle both single file and multiple files
  const files = req.file ? [req.file] : (req.files ? Object.values(req.files).flat() : []);

  if (files.length === 0) {
    return next();
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Only JPEG, PNG and GIF images are allowed'
      });
    }

    if (file.size > maxSize) {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 5MB'
      });
    }
  }

  next();
};

module.exports = { validateImage }; 