const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'view'],
  },
  entityType: {
    type: String,
    required: true,
    enum: ['client', 'project', 'user', 'system'],
  },
  entityId: mongoose.Schema.Types.ObjectId,
  entityName: String,
  details: String,
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Activity', ActivitySchema);