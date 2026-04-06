const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['Card', 'UPI', 'NetBanking', 'Cash', 'Cheque'],
    required: true
  },
  transactionId: { type: String, unique: true },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
