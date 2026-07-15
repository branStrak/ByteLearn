const jwt = require('jsonwebtoken');
const User = require('../model/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (req.user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked' });
            }

            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const optionalProtect = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user && !user.isBlocked) {
                req.user = user;
            }
        } catch (error) {
            //fail if token is invalid
        }
    }
    next();
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, admin only' });
    }
};

const educator = (req, res, next) => {
    if (req.user && req.user.role === 'educator') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, educator only' });
    }
};

const approvedEducator = (req, res, next) => {
    if (req.user && req.user.role === 'educator' && req.user.educatorApplication.status === 'approved') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized: You must be an approved educator' });
    }
};

/**
 * Middleware factory: checks if the authenticated educator is either
 * the primary owner (educatorId) OR a co-instructor of the course.
 * The courseId is resolved from params (courseId or id) or body.
 */
const courseCollaborator = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'educator') {
            return res.status(403).json({ message: 'Not authorized: educator only' });
        }
        if (req.user.educatorApplication?.status !== 'approved') {
            return res.status(403).json({ message: 'Not authorized: You must be an approved educator' });
        }

        const Course = require('../model/Course');
        const courseId = req.params.courseId || req.params.id || req.body.courseId;
        if (!courseId) return next(); // let controller handle missing courseId

        const course = await Course.findById(courseId).select('educatorId coInstructors');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const userId = req.user._id.toString();
        const isOwner = course.educatorId.toString() === userId;
        const isCo = course.coInstructors?.some(c => c.userId.toString() === userId);

        if (!isOwner && !isCo) {
            return res.status(403).json({ message: 'Not authorized for this course' });
        }

        // Attach useful flags to request for downstream controllers
        req.isCourseOwner = isOwner;
        req.course = course;
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { protect, optionalProtect, admin, educator, approvedEducator, courseCollaborator };
