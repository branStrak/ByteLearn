const Module = require('../model/Module');
const Course = require('../model/Course');
const Lesson = require('../model/Lesson');
const Quiz = require('../model/Quiz');
const Question = require('../model/Question');
const Assignment = require('../model/Assignment');

const addModule = async (req, res) => {
    try {
        const { title, order } = req.body;

        if (!title || order === undefined) {
            return res.status(400).json({ message: 'Title and order are required' });
        }

        // auth check now handled by courseCollaborator middleware
        const course = req.course;

        const module = await Module.create({
            courseId: req.params.courseId,
            title,
            order,
        });

        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getModulesByCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const modules = await Module.find({ courseId: req.params.courseId }).sort({ order: 1 });

        res.json(modules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId).populate('courseId');

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // auth check now handled by courseCollaborator middleware

        // Whitelist allowed updates — courseId and _id cannot be changed
        const allowedUpdates = {};
        if (req.body.title !== undefined) allowedUpdates.title = req.body.title;
        if (req.body.order !== undefined) allowedUpdates.order = req.body.order;

        const updatedModule = await Module.findByIdAndUpdate(
            req.params.moduleId,
            allowedUpdates,
            { new: true, runValidators: true }
        );

        res.json(updatedModule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteModule = async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const module = await Module.findById(moduleId).populate('courseId');

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // --- Cascading Deletion ---
        const quizzes = await Quiz.find({ moduleId });
        const quizIds = quizzes.map(q => q._id);

        await Promise.all([
            Lesson.deleteMany({ moduleId }),
            Question.deleteMany({ quizId: { $in: quizIds } }),
            Quiz.deleteMany({ moduleId }),
            Assignment.deleteMany({ moduleId }),
            Module.findByIdAndDelete(moduleId)
        ]);

        res.json({ message: 'Module and all its contents deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addModule,
    getModulesByCourse,
    updateModule,
    deleteModule,
};
