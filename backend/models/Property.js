const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  propertyType: {
    type: String,
    enum: ['House', 'Apartment', 'Land', 'Commercial', 'Villa', 'Studio'],
    required: true
  },
  listingType: { type: String, enum: ['Sale', 'Rent'], required: true },
  price: { type: Number, required: true },
  area: { type: Number, required: true },
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  furnishing: {
    type: String,
    enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
    default: 'Unfurnished'
  },
  parking: { type: Boolean, default: false },
  amenities: [{ type: String }],
  images:   [{ type: String }],  // Cloudinary secure_url
  imageIds: [{ type: String }],  // Cloudinary public_id (for deletion)
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Rented'],
    default: 'Available'
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  location: {
    address: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    pincode: String,
    latitude: Number,
    longitude: Number
  }
}, { timestamps: true });

propertySchema.index({ 'location.city': 1, propertyType: 1, listingType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
