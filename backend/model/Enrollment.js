const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  // progress tracking
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  completedQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
  completedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  completedAssignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }],

  lastAccessedLesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  progressPercentage: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },

  enrolledAt: { type: Date, default: Date.now },
  completedAt: Date,
}, { timestamps: true });

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
