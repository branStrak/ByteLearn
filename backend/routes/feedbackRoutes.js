const express = require("express");
const router = express.Router();
const {
    submitFeedback,
    getCourseFeedbacks,
    getMyFeedback
} = require("../controller/feedbackController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, submitFeedback);

router.get("/course/:courseId", getCourseFeedbacks);

router.get("/my-feedback/:courseId", protect, getMyFeedback);

module.exports = router;
