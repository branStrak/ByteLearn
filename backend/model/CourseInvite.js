const mongoose = require('mongoose');

const courseInviteSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  invitedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Auto-expire index — MongoDB will delete doc after expiresAt
courseInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Prevent duplicate pending invite to same email for same course
courseInviteSchema.index({ courseId: 1, invitedEmail: 1, status: 1 });

module.exports = mongoose.model('CourseInvite', courseInviteSchema);
