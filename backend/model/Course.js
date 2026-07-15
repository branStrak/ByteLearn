const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coInstructors: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acceptedAt: { type: Date, default: Date.now }
  }],
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: String,
  category: String,
  tags: [String],
  price: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  language: { type: String, default: "English" },
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected"],
    default: "draft",
  },
  adminFeedback: String,
  totalDuration: Number,
  totalLessons: Number,
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  enrolledStudents: { type: Number, default: 0 },
  gradingConfiguration: {
    quizWeight: { type: Number, default: 50 },
    assignmentWeight: { type: Number, default: 50 },
    minGradeToPass: { type: Number, default: 70 },
    isCertificationEnabled: { type: Boolean, default: true },
    gradingScale: [{
      label: { type: String, required: true },
      minScore: { type: Number, required: true }
    }]
  }
}, { timestamps: true });

courseSchema.virtual('modules', {
  ref: 'Module',
  localField: '_id',
  foreignField: 'courseId'
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Course", courseSchema);
