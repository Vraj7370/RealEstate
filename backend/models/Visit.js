const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitDate: { type: Date, required: true },
  visitTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Requested'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Visit', visitSchema);
