const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['Open', 'InProgress', 'Closed'],
    default: 'Open'
  },
  response: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
