const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  title: { type: String, required: true },
  instructions: { type: String },
  questionPdfUrl: { type: String },
  totalMarks: { type: Number },
  order: { type: Number, required: true } 
}, {
  timestamps: true
});

assignmentSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
