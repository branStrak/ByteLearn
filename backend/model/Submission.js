const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  fileUrl: { type: String, required: true },
  status: { type: String, enum: ["submitted", "graded"], default: "submitted" },
  marksObtained: { type: Number },
  feedback: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

submissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
