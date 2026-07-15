const mongoose = require("mongoose");
const Feedback = require("../model/Feedback");
const Enrollment = require("../model/Enrollment");
const Course = require("../model/Course");


const updateCourseAverageRating = async (courseId) => {
    try {
        const stats = await Feedback.aggregate([
            { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
            {
                $group: {
                    _id: "$courseId",
                    averageRating: { $avg: "$rating" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Course.findByIdAndUpdate(courseId, {
                rating: Math.round(stats[0].averageRating * 10) / 10, 
                totalRatings: stats[0].totalRatings
            });
        } else {
            await Course.findByIdAndUpdate(courseId, {
                rating: 0,
                totalRatings: 0
            });
        }
    } catch (error) {
        console.error("Error updating course average rating:", error);
    }
};

const submitFeedback = async (req, res) => {
    try {
        const { courseId, rating, review } = req.body;
        const studentId = req.user._id;

        if (!courseId || !rating) {
            return res.status(400).json({ success: false, message: "Course ID and rating are required" });
        }

        const enrollment = await Enrollment.findOne({ studentId, courseId });

        if (!enrollment || enrollment.progressPercentage !== 100) {
            return res.status(403).json({
                success: false,
                message: "You must complete the course to leave a review"
            });
        }

        const feedback = await Feedback.findOneAndUpdate(
            { courseId, studentId },
            { rating, review },
            { new: true, upsert: true }
        );

        await updateCourseAverageRating(courseId);

        res.status(200).json({
            success: true,
            message: "Feedback submitted successfully",
            data: feedback
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getCourseFeedbacks = async (req, res) => {
    try {
        const { courseId } = req.params;

        const feedbacks = await Feedback.find({ courseId })
            .populate("studentId", "name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: feedbacks
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getMyFeedback = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user._id;

        const feedback = await Feedback.findOne({ courseId, studentId });

        res.status(200).json({
            success: true,
            data: feedback
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitFeedback,
    getCourseFeedbacks,
    getMyFeedback
};
