const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  title: { type: String, required: true },
  order: { type: Number, required: true },
}, { timestamps: true });

moduleSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'moduleId'
});

moduleSchema.virtual('quizzes', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'moduleId'
});

moduleSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'moduleId'
});

moduleSchema.set('toJSON', { virtuals: true });
moduleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Module", moduleSchema);
