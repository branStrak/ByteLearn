const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  title: { type: String, required: true },
  lessonType: { type: String, enum: ['video', 'article'], default: 'video' },
  videoUrl: { type: String, default: null },
  content: { type: String, default: "" }, 
  notesUrl: { type: String, default: null },
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
}, { timestamps: true });

lessonSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
