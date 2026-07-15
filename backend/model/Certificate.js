const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
    educatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    certificateId: {
        type: String,
        unique: true,
        required: true
    },
    finalPercentage: {
        type: Number,
        required: true
    },
    gradeLabel: {
        type: String,
        required: true
    },
    pdfUrl: {
        type: String,
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
});
 
certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
 
module.exports = mongoose.model('Certificate', certificateSchema);
