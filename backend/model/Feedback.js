const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
