const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  buyerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true }, // ← added
  agentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },                     // ← added
  message:      { type: String, required: true },
  contactPhone: { type: String },
  contactEmail: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Closed'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
