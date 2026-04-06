const {
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} = require('../config/cloudinary');

// ─────────────────────────────────────────────────────────────
// Middleware: Upload single profile picture to Cloudinary
// Usage:  router.put('/profile', protect, uploadProfilePic, updateProfile)
// ─────────────────────────────────────────────────────────────
exports.uploadProfilePic = (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // No file uploaded — just continue (profile update without pic change)
    if (!req.file) return next();

    try {
      const result = await uploadToCloudinary(req.file.buffer, 'propfinder/profiles', {
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      // Attach secure_url and public_id to req for controller to use
      req.uploadedFile = {
        url:       result.secure_url,
        publicId:  result.public_id,
      };

      next();
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      res.status(500).json({ success: false, message: 'Image upload failed. Please try again.' });
    }
  });
};

// ─────────────────────────────────────────────────────────────
// Middleware: Upload multiple property images to Cloudinary
// Usage:  router.post('/properties', protect, uploadPropertyImages, createProperty)
// ─────────────────────────────────────────────────────────────
exports.uploadPropertyImages = (req, res, next) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // No images uploaded — continue (property can be created without pics)
    if (!req.files || req.files.length === 0) return next();

    try {
      const uploadPromises = req.files.map((file, index) =>
        uploadToCloudinary(file.buffer, 'propfinder/properties', {
          transformation: [
            { width: 1200, height: 800, crop: 'fill' },
            { quality: 'auto:good', fetch_format: 'auto' },
          ],
          // Keep upload order
          public_id: `prop_${Date.now()}_${index}`,
        })
      );

      const results = await Promise.all(uploadPromises);

      req.uploadedFiles = results.map(r => ({
        url:      r.secure_url,
        publicId: r.public_id,
      }));

      next();
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      res.status(500).json({ success: false, message: 'Image upload failed. Please try again.' });
    }
  });
};

// ─────────────────────────────────────────────────────────────
// Helper: Delete old image from Cloudinary before replacing
// ─────────────────────────────────────────────────────────────
exports.deleteImage = deleteFromCloudinary;
exports.getPublicIdFromUrl = getPublicIdFromUrl;
