const Visit = require('../models/Visit');
const Favorite = require('../models/Favorite');
const Payment = require('../models/Payment');
const SupportTicket = require('../models/SupportTicket');
const Property = require('../models/Property');
const User = require('../models/User');

// ===== VISIT CONTROLLERS =====
exports.scheduleVisit = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const visit = await Visit.create({
      propertyId: req.params.propertyId,
      buyerId: req.user.id,
      ownerId: property.ownerId,
      visitDate: req.body.visitDate,
      visitTime: req.body.visitTime,
      notes: req.body.notes
    });
    await visit.populate([
      { path: 'propertyId', select: 'title location images' },
      { path: 'ownerId', select: 'firstName lastName phone email' }
    ]);
    res.status(201).json({ success: true, message: 'Visit scheduled', data: visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ buyerId: req.user.id })
      .populate('propertyId', 'title location images price')
      .populate('ownerId', 'firstName lastName phone')
      .sort('-visitDate');
    res.json({ success: true, data: visits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateVisitStatus = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });

    // Authorization: buyer can only cancel their own visit, owner/agent can approve/reject/complete
    const isBuyer = visit.buyerId.toString() === req.user.id;
    const isOwner = visit.ownerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this visit' });
    }

    // Buyer can only cancel
    if (isBuyer && !isAdmin && req.body.status !== 'Cancelled') {
      return res.status(403).json({ success: false, message: 'Buyers can only cancel visits' });
    }

    visit.status = req.body.status;
    await visit.save();
    res.json({ success: true, data: visit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOwnerVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ ownerId: req.user.id })
      .populate('propertyId', 'title location')
      .populate('buyerId', 'firstName lastName phone email profilePic')
      .sort('-visitDate');
    res.json({ success: true, data: visits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===== FAVORITE CONTROLLERS =====
exports.toggleFavorite = async (req, res) => {
  try {
    const existing = await Favorite.findOne({ userId: req.user.id, propertyId: req.params.propertyId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, message: 'Removed from favorites', isFavorited: false });
    }
    await Favorite.create({ userId: req.user.id, propertyId: req.params.propertyId });
    res.json({ success: true, message: 'Added to favorites', isFavorited: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id })
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId', select: 'firstName lastName phone' }
      })
      .sort('-createdAt');
    res.json({ success: true, data: favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===== PAYMENT CONTROLLERS =====
exports.createPayment = async (req, res) => {
  try {
    const property = await Property.findById(req.body.propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    const payment = await Payment.create({
      ...req.body,
      buyerId: req.user.id,
      ownerId: property.ownerId,
      transactionId,
      paymentDate: new Date()
    });
    await payment.populate([
      { path: 'propertyId', select: 'title location price' },
      { path: 'ownerId', select: 'firstName lastName' }
    ]);
    res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ buyerId: req.user.id })
      .populate('propertyId', 'title location images')
      .sort('-paymentDate');
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('buyerId', 'firstName lastName email')
      .populate('propertyId', 'title location')
      .populate('ownerId', 'firstName lastName')
      .sort('-paymentDate');
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===== SUPPORT CONTROLLERS =====
exports.createTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.create({ userId: req.user.id, ...req.body });
    res.status(201).json({ success: true, message: 'Ticket created', data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort('-createdAt');
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('userId', 'firstName lastName email')
      .sort('-createdAt');
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondToTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { response: req.body.response, status: req.body.status || 'InProgress' },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===== ADMIN CONTROLLERS =====
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').skip(skip).limit(Number(limit)).sort('-createdAt'),
      User.countDocuments(query)
    ]);
    res.json({ success: true, data: users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'blocked'}`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers, totalProperties, pendingProperties, totalPayments,
      openTickets, usersByRole, recentProperties
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({ approvalStatus: 'Pending' }),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      SupportTicket.countDocuments({ status: 'Open' }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Property.find({ approvalStatus: 'Pending' }).populate('ownerId', 'firstName lastName').limit(5).sort('-createdAt')
    ]);
    res.json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        pendingProperties,
        totalRevenue: totalPayments[0]?.total || 0,
        totalTransactions: totalPayments[0]?.count || 0,
        openTickets,
        usersByRole,
        recentProperties
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
