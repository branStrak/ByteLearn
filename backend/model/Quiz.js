const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  title: { type: String, required: true },
  duration: { type: Number }, //duration in minutes
  order: { type: Number, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

quizSchema.index({ moduleId: 1, order: 1 });

quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quizId'
});

module.exports = mongoose.model("Quiz", quizSchema);
