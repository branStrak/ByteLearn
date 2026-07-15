const express = require('express');
const router = express.Router({ mergeParams: true }); //mergeParams allows access to :courseId from parent router
const {
    addModule,
    getModulesByCourse,
    updateModule,
    deleteModule,
} = require('../controller/moduleController');
const { protect, approvedEducator, courseCollaborator } = require('../middleware/authMiddleware');


router.route('/')
    .post(protect, approvedEducator, courseCollaborator, addModule)
    .get(getModulesByCourse);


router.route('/:moduleId')
    .put(protect, approvedEducator, courseCollaborator, updateModule)
    .delete(protect, approvedEducator, courseCollaborator, deleteModule);

//nested
const lessonRoutes = require('./lessonRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const quizRoutes = require('./quizRoutes');

router.use('/:moduleId/lessons', lessonRoutes);
router.use('/:moduleId/assignments', assignmentRoutes);
router.use('/:moduleId/quizzes', quizRoutes);

module.exports = router;
