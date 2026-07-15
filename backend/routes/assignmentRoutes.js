const express = require('express');
const router = express.Router({ mergeParams: true }); 
const {
    addAssignment,
    getAssignmentsByModule,
    updateAssignment,
    deleteAssignment,
    getAssignmentPdfUrl
} = require('../controller/assignmentController');
const { protect, approvedEducator, courseCollaborator } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const assignmentUpload = upload.single('questionPdf');

router.route('/')
    .post(protect, approvedEducator, courseCollaborator, assignmentUpload, addAssignment)
    .get(getAssignmentsByModule);

router.route('/:assignmentId')
    .put(protect, approvedEducator, courseCollaborator, assignmentUpload, updateAssignment)
    .delete(protect, approvedEducator, courseCollaborator, deleteAssignment);

router.get('/:assignmentId/download', protect, getAssignmentPdfUrl);

module.exports = router;
