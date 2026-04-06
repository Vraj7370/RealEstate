const express = require('express');
const router  = express.Router();
const {
  getProperties, getProperty, createProperty, updateProperty,
  deleteProperty, deletePropertyImage,
  updateApprovalStatus, updatePropertyStatus,
  getFeaturedProperties, addReview, getStats,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPropertyImages } = require('../middleware/upload');

// Optional auth — injects user if token present (for public routes)
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return next();
  try {
    const jwt  = require('jsonwebtoken');
    const User = require('../models/User');
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    User.findById(decoded.id)
      .then(user => { req.user = user; next(); })
      .catch(() => next());
  } catch { next(); }
};

// Public routes
router.get('/featured', getFeaturedProperties);
router.get('/stats',    getStats);
router.get('/',         optionalAuth, getProperties);
router.get('/:id',      optionalAuth, getProperty);

// Authenticated routes
router.post('/',
  protect, authorize('OWNER', 'AGENT', 'ADMIN'),
  uploadPropertyImages,
  createProperty
);
router.put('/:id',
  protect, authorize('OWNER', 'AGENT', 'ADMIN'),
  uploadPropertyImages,
  updateProperty
);
router.delete('/:id',         protect, authorize('OWNER', 'AGENT', 'ADMIN'), deleteProperty);
router.delete('/:id/image',   protect, authorize('OWNER', 'AGENT', 'ADMIN'), deletePropertyImage);
router.patch('/:id/approval', protect, authorize('ADMIN'),                   updateApprovalStatus);
router.patch('/:id/status',   protect, authorize('OWNER', 'AGENT', 'ADMIN'), updatePropertyStatus);
router.post('/:id/reviews',   protect, addReview);

module.exports = router;
