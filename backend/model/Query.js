const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson' // Nullable for general course questions
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  studentRead: {
    type: Boolean,
    default: true
  },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);
