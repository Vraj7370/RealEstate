const Property  = require('../models/Property');
const Favorite  = require('../models/Favorite');
const Review    = require('../models/Review');
const { deleteImage, getPublicIdFromUrl } = require('../middleware/upload');

// ─────────────────────────────────────────────────────────────
// GET ALL PROPERTIES  (with filters, pagination, sorting)
// ─────────────────────────────────────────────────────────────
exports.getProperties = async (req, res) => {
  try {
    const {
      propertyType, listingType, city, state,
      minPrice, maxPrice, minArea, maxArea,
      bedrooms, bathrooms, furnishing, parking,
      amenities, status, approvalStatus, search, featured,
      page = 1, limit = 12,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const query = {};

    // ── Property filters ──
    if (propertyType) query.propertyType = propertyType;
    if (listingType)  query.listingType  = listingType;
    if (city)         query['location.city']  = new RegExp(city, 'i');
    if (state)        query['location.state'] = new RegExp(state, 'i');

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = Number(minArea);
      if (maxArea) query.area.$lte = Number(maxArea);
    }
    if (bedrooms  !== undefined && bedrooms  !== '') query.bedrooms  = { $gte: Number(bedrooms) };
    if (bathrooms !== undefined && bathrooms !== '') query.bathrooms = { $gte: Number(bathrooms) };
    if (furnishing) query.furnishing = furnishing;
    if (parking !== undefined && parking !== '') query.parking = parking === 'true';
    if (amenities) query.amenities = { $in: amenities.split(',') };
    if (featured)  query.featured  = featured === 'true';

    // ── Role-based visibility ──────────────────────────────
    const role = req.user?.role;

    if (!role || role === 'BUYER') {
      // Public & Buyers see only Approved + Available
      query.approvalStatus = 'Approved';
      query.status = status || 'Available';
    } else if (role === 'OWNER') {
      // Owner sees only THEIR own properties (all statuses)
      query.ownerId = req.user.id;
      if (approvalStatus) query.approvalStatus = approvalStatus;
      if (status) query.status = status;
    } else if (role === 'AGENT') {
      // Agent sees properties where they are the agent
      query.agentId = req.user.id;
      if (approvalStatus) query.approvalStatus = approvalStatus;
      if (status) query.status = status;
    } else if (role === 'ADMIN' || role === 'SUPPORT') {
      // Admin/Support see everything
      if (approvalStatus) query.approvalStatus = approvalStatus;
      if (status) query.status = status;
    }

    // ── Full-text search — use $and to avoid overwriting role filter ──
    if (search) {
      const searchConditions = [
        { title:              new RegExp(search, 'i') },
        { description:        new RegExp(search, 'i') },
        { 'location.city':    new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') },
      ];
      if (query.$and) {
        query.$and.push({ $or: searchConditions });
      } else {
        query.$and = [{ $or: searchConditions }];
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('ownerId', 'firstName lastName phone email profilePic')
        .populate('agentId', 'firstName lastName phone email profilePic')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Property.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: properties,
      pagination: {
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE PROPERTY
// ─────────────────────────────────────────────────────────────
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('ownerId', 'firstName lastName phone email profilePic city')
      .populate('agentId', 'firstName lastName phone email profilePic');

    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Non-admin/owner/agent can only see approved properties
    const role = req.user?.role;
    const isOwnerOrAgent = (
      property.ownerId?._id?.toString() === req.user?.id ||
      property.agentId?._id?.toString() === req.user?.id
    );
    if (property.approvalStatus !== 'Approved' && role !== 'ADMIN' && !isOwnerOrAgent) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Increment views (don't count owner/agent views)
    if (!isOwnerOrAgent && role !== 'ADMIN') {
      await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    const reviews = await Review.find({ propertyId: property._id })
      .populate('userId', 'firstName lastName profilePic')
      .sort('-createdAt');

    const avgRating = reviews.length
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;

    let isFavorited = false;
    if (req.user) {
      const fav = await Favorite.findOne({ userId: req.user.id, propertyId: property._id });
      isFavorited = !!fav;
    }

    // Is the current user the owner of this property?
    const isOwner = property.ownerId?._id?.toString() === req.user?.id;

    res.json({
      success: true,
      data: { ...property.toObject(), reviews, avgRating, isFavorited, isOwner },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE PROPERTY
// ─────────────────────────────────────────────────────────────
exports.createProperty = async (req, res) => {
  try {
    const data = { ...req.body, ownerId: req.user.id };

    // For AGENT: set themselves as agent, allow specifying different ownerId
    if (req.user.role === 'AGENT') {
      data.agentId = req.user.id;
      // If agent provides an ownerId (another user's ID), use it, else use agent's own ID
      if (!req.body.ownerId) data.ownerId = req.user.id;
    }

    if (req.uploadedFiles?.length) {
      data.images   = req.uploadedFiles.map(f => f.url);
      data.imageIds = req.uploadedFiles.map(f => f.publicId);
    }

    if (typeof data.location  === 'string') data.location  = JSON.parse(data.location);
    if (typeof data.amenities === 'string') data.amenities = JSON.parse(data.amenities);
    if (data.parking  !== undefined) data.parking  = data.parking === 'true' || data.parking === true;
    if (data.bedrooms)  data.bedrooms  = Number(data.bedrooms);
    if (data.bathrooms) data.bathrooms = Number(data.bathrooms);
    if (data.price)     data.price     = Number(data.price);
    if (data.area)      data.area      = Number(data.area);

    // Admin-listed properties are auto-approved
    if (req.user.role === 'ADMIN') data.approvalStatus = 'Approved';

    const property = await Property.create(data);
    await property.populate('ownerId', 'firstName lastName phone email');

    res.status(201).json({
      success: true,
      message: req.user.role === 'ADMIN'
        ? 'Property listed and approved! ✅'
        : 'Property submitted! Awaiting admin approval. ⏳',
      data: property,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PROPERTY
// ─────────────────────────────────────────────────────────────
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const isOwner = property.ownerId?.toString() === req.user.id;
    const isAgent = property.agentId?.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAgent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this property' });
    }

    const data = { ...req.body };

    if (req.uploadedFiles?.length) {
      // Delete old images from Cloudinary
      const oldIds = property.imageIds?.length
        ? property.imageIds
        : property.images?.map(url => getPublicIdFromUrl(url)).filter(Boolean);
      if (oldIds?.length) await Promise.all(oldIds.map(id => deleteImage(id).catch(() => {})));

      data.images   = req.uploadedFiles.map(f => f.url);
      data.imageIds = req.uploadedFiles.map(f => f.publicId);
    }

    if (typeof data.location  === 'string') data.location  = JSON.parse(data.location);
    if (typeof data.amenities === 'string') data.amenities = JSON.parse(data.amenities);
    if (data.parking  !== undefined) data.parking  = data.parking === 'true' || data.parking === true;
    if (data.price)     data.price     = Number(data.price);
    if (data.area)      data.area      = Number(data.area);
    if (data.bedrooms)  data.bedrooms  = Number(data.bedrooms);
    if (data.bathrooms) data.bathrooms = Number(data.bathrooms);

    // Owner/Agent editing resets approval (needs re-approval) unless admin edits
    if (!isAdmin && (data.title || data.price || data.description)) {
      data.approvalStatus = 'Pending';
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, data, {
      new: true, runValidators: true,
    });

    res.json({ success: true, message: 'Property updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE PROPERTY
// ─────────────────────────────────────────────────────────────
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const isOwner = property.ownerId?.toString() === req.user.id;
    const isAgent = property.agentId?.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAgent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    // Clean up Cloudinary images
    const ids = property.imageIds?.length
      ? property.imageIds
      : property.images?.map(url => getPublicIdFromUrl(url)).filter(Boolean);
    if (ids?.length) await Promise.all(ids.map(id => deleteImage(id).catch(() => {})));

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE SINGLE IMAGE
// ─────────────────────────────────────────────────────────────
exports.deletePropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const isOwner = property.ownerId?.toString() === req.user.id;
    const isAgent = property.agentId?.toString() === req.user.id;
    if (!isOwner && !isAgent && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { imageUrl } = req.body;
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) await deleteImage(publicId).catch(() => {});

    await Property.findByIdAndUpdate(req.params.id, {
      $pull: { images: imageUrl, imageIds: publicId },
    });
    res.json({ success: true, message: 'Image removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE APPROVAL STATUS (Admin only)
// ─────────────────────────────────────────────────────────────
exports.updateApprovalStatus = async (req, res) => {
  try {
    const { approvalStatus, featured } = req.body;
    const updateData = {};
    if (approvalStatus) updateData.approvalStatus = approvalStatus;
    if (featured !== undefined) updateData.featured = featured === true || featured === 'true';

    const property = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('ownerId', 'firstName lastName email');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    res.json({ success: true, message: `Property ${approvalStatus || 'updated'}`, data: property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PROPERTY STATUS (Owner/Agent: Available/Sold/Rented)
// ─────────────────────────────────────────────────────────────
exports.updatePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const isOwner = property.ownerId?.toString() === req.user.id;
    const isAgent = property.agentId?.toString() === req.user.id;
    if (!isOwner && !isAgent && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, message: `Property marked as ${req.body.status}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// FEATURED PROPERTIES (public)
// ─────────────────────────────────────────────────────────────
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      featured: true,
      approvalStatus: 'Approved',
      status: 'Available',
    })
      .populate('ownerId', 'firstName lastName phone profilePic')
      .limit(8)
      .sort('-createdAt')
      .lean();
    res.json({ success: true, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADD REVIEW
// ─────────────────────────────────────────────────────────────
exports.addReview = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Owners can't review their own property
    if (property.ownerId?.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: "You can't review your own property" });
    }

    const existing = await Review.findOne({ propertyId: req.params.id, userId: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this property' });

    const review = await Review.create({
      propertyId: req.params.id,
      userId: req.user.id,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    });
    await review.populate('userId', 'firstName lastName profilePic');
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PROPERTY STATS
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [total, byType, byCity, totalValue] = await Promise.all([
      Property.countDocuments({ approvalStatus: 'Approved' }),
      Property.aggregate([
        { $match: { approvalStatus: 'Approved' } },
        { $group: { _id: '$propertyType', count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $match: { approvalStatus: 'Approved' } },
        { $group: { _id: '$location.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Property.aggregate([
        { $match: { approvalStatus: 'Approved', status: 'Available' } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
    ]);
    res.json({
      success: true,
      data: { total, byType, byCity, totalValue: totalValue[0]?.total || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
