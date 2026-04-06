const express = require('express');
const router  = express.Router();

const {
  scheduleVisit, getMyVisits, updateVisitStatus, getOwnerVisits,
  toggleFavorite, getMyFavorites,
  createPayment, getMyPayments, getAllPayments,
  createTicket, getMyTickets, getAllTickets, respondToTicket,
  getAllUsers, toggleUserStatus, getAdminStats
} = require('../controllers/otherControllers');

const {
  createInquiry, getMyInquiries, getReceivedInquiries,
  getPropertyInquiries, updateInquiryStatus, getAllInquiries
} = require('../controllers/inquiryController');

const { protect, authorize } = require('../middleware/auth');

// ── Visits ───────────────────────────────────
router.post('/visits/property/:propertyId',  protect, scheduleVisit);
router.get('/visits/my',                     protect, getMyVisits);
router.get('/visits/owner',                  protect, authorize('OWNER', 'AGENT', 'ADMIN'), getOwnerVisits);
router.patch('/visits/:id/status',           protect, updateVisitStatus);

// ── Favorites ────────────────────────────────
router.post('/favorites/:propertyId',        protect, toggleFavorite);
router.get('/favorites/my',                  protect, getMyFavorites);

// ── Inquiries ────────────────────────────────
// Buyer: send an inquiry
router.post('/inquiries/property/:propertyId', protect, createInquiry);

// Buyer: see all inquiries I have sent
router.get('/inquiries/my',                    protect, getMyInquiries);

// Owner/Agent: see all inquiries RECEIVED on their properties ← key fix
router.get('/inquiries/received',              protect, authorize('OWNER', 'AGENT', 'ADMIN'), getReceivedInquiries);

// Owner/Agent: inquiries on a specific property
router.get('/inquiries/property/:propertyId',  protect, authorize('OWNER', 'AGENT', 'ADMIN'), getPropertyInquiries);

// Owner/Agent: update inquiry status
router.patch('/inquiries/:id/status',          protect, authorize('OWNER', 'AGENT', 'ADMIN'), updateInquiryStatus);

// Admin: all inquiries
router.get('/inquiries/all',                   protect, authorize('ADMIN'), getAllInquiries);

// ── Payments ─────────────────────────────────
router.post('/payments',                     protect, createPayment);
router.get('/payments/my',                   protect, getMyPayments);
router.get('/payments/all',                  protect, authorize('ADMIN'), getAllPayments);

// ── Support Tickets ──────────────────────────
router.post('/support',                      protect, createTicket);
router.get('/support/my',                    protect, getMyTickets);
router.get('/support/all',                   protect, authorize('ADMIN', 'SUPPORT'), getAllTickets);
router.patch('/support/:id/respond',         protect, authorize('ADMIN', 'SUPPORT'), respondToTicket);

// ── Admin ────────────────────────────────────
router.get('/admin/users',                   protect, authorize('ADMIN'), getAllUsers);
router.patch('/admin/users/:id/toggle',      protect, authorize('ADMIN'), toggleUserStatus);
router.get('/admin/stats',                   protect, authorize('ADMIN'), getAdminStats);

module.exports = router;
