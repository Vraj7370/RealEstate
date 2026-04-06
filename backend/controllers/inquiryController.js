const Inquiry  = require('../models/Inquiry');
const Property = require('../models/Property');

// ─────────────────────────────────────────────
// BUYER  →  Create inquiry on a property
// ─────────────────────────────────────────────
exports.createInquiry = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId)
      .populate('ownerId', 'firstName lastName email phone')
      .populate('agentId', 'firstName lastName email phone');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Prevent owner from inquiring their own property
    if (property.ownerId._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: "You can't inquire on your own property" });
    }

    const inquiry = await Inquiry.create({
      propertyId:   req.params.propertyId,
      buyerId:      req.user.id,
      ownerId:      property.ownerId._id,        // ← store owner
      agentId:      property.agentId?._id || null, // ← store agent if exists
      message:      req.body.message,
      contactPhone: req.body.contactPhone || req.user.phone,
      contactEmail: req.body.contactEmail || req.user.email,
    });

    await inquiry.populate([
      { path: 'buyerId',    select: 'firstName lastName email phone' },
      { path: 'ownerId',   select: 'firstName lastName email phone' },
      { path: 'propertyId', select: 'title location price images' },
    ]);

    res.status(201).json({
      success: true,
      message: `Inquiry sent to ${property.ownerId.firstName}! They will contact you soon.`,
      data: inquiry,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// BUYER  →  See all inquiries I sent
// ─────────────────────────────────────────────
exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ buyerId: req.user.id })
      .populate('propertyId', 'title images location price listingType')
      .populate('ownerId',    'firstName lastName email phone profilePic')
      .populate('agentId',   'firstName lastName email phone')
      .sort('-createdAt');
    res.json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// OWNER / AGENT  →  See all inquiries RECEIVED on my properties
// ─────────────────────────────────────────────
exports.getReceivedInquiries = async (req, res) => {
  try {
    const filter = req.user.role === 'AGENT'
      ? { agentId: req.user.id }   // agent sees inquiries on properties they manage
      : { ownerId: req.user.id };  // owner sees inquiries on their properties

    const inquiries = await Inquiry.find(filter)
      .populate('buyerId',    'firstName lastName email phone profilePic city')
      .populate('propertyId', 'title images location price listingType')
      .sort('-createdAt');

    res.json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// OWNER / AGENT  →  Get inquiries for a specific property
// ─────────────────────────────────────────────
exports.getPropertyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ propertyId: req.params.propertyId })
      .populate('buyerId', 'firstName lastName email phone profilePic')
      .sort('-createdAt');
    res.json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// OWNER / AGENT  →  Update inquiry status (Contacted / Closed)
// ─────────────────────────────────────────────
exports.updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

    // Only the owner or agent of this inquiry can update it
    const isOwner = inquiry.ownerId?.toString() === req.user.id;
    const isAgent = inquiry.agentId?.toString() === req.user.id;
    if (!isOwner && !isAgent && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this inquiry' });
    }

    inquiry.status = req.body.status;
    await inquiry.save();

    res.json({ success: true, message: `Inquiry marked as ${req.body.status}`, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN  →  See ALL inquiries
// ─────────────────────────────────────────────
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('buyerId',    'firstName lastName email')
      .populate('ownerId',   'firstName lastName email')
      .populate('propertyId', 'title location price')
      .sort('-createdAt');
    res.json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
