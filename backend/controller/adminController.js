const Course = require('../model/Course');
const Module = require('../model/Module');
const User = require('../model/User');
const Transaction = require('../model/Transaction');
const sendEmail = require('../utils/sendEmail');

// Course Management 
const getAllPendingCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'pending' })
            .populate('educatorId', 'name email profilePicture')
            .select('-adminFeedback')
            .sort({ updatedAt: -1 });

        res.json({ total: courses.length, courses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reviewCourse = async (req, res) => {
    try {
        const { status, adminFeedback } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be "approved" or "rejected".' });
        }

        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.status !== 'pending') {
            return res.status(400).json({
                message: `Only pending courses can be reviewed. Current status: "${course.status}".`
            });
        }

        if (status === 'approved') {
            course.status = 'approved';
            course.adminFeedback = undefined;
        } else {
            if (!adminFeedback || adminFeedback.trim() === '') {
                return res.status(400).json({ message: 'Feedback is required when rejecting a course.' });
            }
            course.status = 'rejected';
            course.adminFeedback = adminFeedback.trim();
        }

        await course.save();
        res.json({ message: `Course ${status} successfully.`, status: course.status, adminFeedback: course.adminFeedback });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Educator Management 
const getAllEducators = async (req, res) => {
    try {
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { role: 'educator' };
        if (status) filter['educatorApplication.status'] = status;

        const total = await User.countDocuments(filter);
        const educators = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit);

        res.json({ page, totalPages: Math.ceil(total / limit), totalEducators: total, educators });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reviewEducator = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be "approved" or "rejected".' });
        }

        const user = await User.findById(req.params.educatorId);
        if (!user || user.role !== 'educator') {
            return res.status(404).json({ message: 'Educator not found' });
        }

        user.educatorApplication.status = status;
        await user.save();

        const subject = status === 'approved'
            ? '🎉 Your ByteLearn Educator Application is Approved!'
            : 'Update on your ByteLearn Educator Application';

        const message = status === 'approved'
            ? `Hi ${user.name}, congratulations! Your educator application has been approved. You can now log in and start creating courses.`
            : `Hi ${user.name}, after review, your educator application was not approved at this time. You may re-apply with updated credentials.`;

        try {
            await sendEmail({ email: user.email, subject, message });
        } catch (err) {
            console.error('Notification email failed:', err.message);
        }

        res.json({ message: `Educator ${status} successfully.`, educatorId: user._id, status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalEducators = await User.countDocuments({ role: 'educator' });
        const totalCourses = await Course.countDocuments();
        const pendingCoursesCount = await Course.countDocuments({ status: 'pending' });
        const pendingEducatorsCount = await User.countDocuments({ role: 'educator', 'educatorApplication.status': 'pending' });
        const pendingPayoutsCount = await Transaction.countDocuments({ type: 'debit', status: 'pending' });

        const pendingEducators = await User.find({ role: 'educator', 'educatorApplication.status': 'pending' })
            .select('name email createdAt')
            .limit(5);

        const pendingCourses = await Course.find({ status: 'pending' })
            .select('title educatorId createdAt')
            .populate('educatorId', 'name')
            .limit(5);

        const pendingPayouts = await Transaction.find({ type: 'debit', status: 'pending' })
            .select('amount educatorId createdAt')
            .populate('educatorId', 'name')
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalEducators,
                totalCourses,
                pendingApprovals: pendingCoursesCount + pendingEducatorsCount,
                pendingPayoutsCount,
                pendingEducators,
                pendingCourses,
                pendingPayouts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Payout Management
const getAllPayoutRequests = async (req, res) => {
    try {
        const payouts = await Transaction.find({ type: 'debit', status: 'pending' })
            .populate('educatorId', 'name email profilePicture walletBalance bankDetails')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, total: payouts.length, payouts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const reviewPayoutRequest = async (req, res) => {
    try {
        const { status } = req.body;
        const { transactionId } = req.params;

        if (!['completed', 'failed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Use "completed" or "failed".' });
        }

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Transaction already processed' });
        }

        if (status === 'failed') {
            // Refund the amount back to educator's walletBalance
            await User.findByIdAndUpdate(transaction.educatorId, {
                $inc: { walletBalance: transaction.amount }
            });
        }

        transaction.status = status;
        await transaction.save();

        res.status(200).json({
            success: true,
            message: `Payout request ${status === 'completed' ? 'approved' : 'rejected'} successfully`,
            transaction
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// User Management
const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let filter = {};

        if (role) {
            filter.role = role;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot modify admin status' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: `User status updated to ${user.isBlocked ? 'Blocked' : 'Active'}`, 
            isBlocked: user.isBlocked 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllPendingCourses,
    reviewCourse,
    getAllEducators,
    reviewEducator,
    getAdminStats,
    getAllUsers,
    toggleUserStatus
};
