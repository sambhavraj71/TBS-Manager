const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  projectType: {
    type: String,
    enum: ['web', 'mobile', 'desktop', 'full-stack'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'on-hold'],
    default: 'pending',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  technologies: [String],
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  budget: Number,
  hourlyRate: Number,
  estimatedHours: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', ProjectSchema);