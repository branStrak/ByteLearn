const Enrollment = require('../model/Enrollment');
const QuizAttempt = require('../model/QuizAttempt');
const Submission = require('../model/Submission');

exports.getStudentDashboardData = async (req, res) => {
  try {
    const studentId = req.user._id;

    const [enrollments, recentQuizzes, recentAssignments] = await Promise.all([
      Enrollment.find({ studentId }).populate({
        path: 'courseId',
        select: 'title thumbnail educatorId coInstructors totalDuration gradingConfiguration rating totalRatings',
        populate: [
          { path: 'educatorId', select: 'name' },
          { path: 'coInstructors.userId', select: 'name' }
        ]
      }),
      QuizAttempt.find({ studentId, status: 'completed' })
        .sort({ submittedAt: -1 })
        .limit(3)
        .populate('quizId', 'title'),
      Submission.find({ studentId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('assignmentId', 'title')
    ]);

    const metrics = {
      totalEnrolled: enrollments.length,
      completedCourses: enrollments.filter(e => e.progressPercentage === 100).length,
      certificatesEarned: enrollments.filter(e => 
        e.progressPercentage === 100 && 
        e.courseId?.gradingConfiguration?.isCertificationEnabled
      ).length
    };

    const activeCourses = enrollments
      .filter(e => e.progressPercentage < 100)
      .map(e => ({
        ...e.toObject().courseId,
        progressPercentage: e.progressPercentage,
        enrollmentId: e._id
      }));

    res.status(200).json({
      success: true,
      data: {
        metrics,
        activeCourses,
        recentQuizzes,
        recentAssignments
      }
    });

  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
